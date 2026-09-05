const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// --- STRIPE WEBHOOK MUST COME BEFORE express.json() ---
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      if (!endpointSecret) {
        throw new Error("Missing STRIPE_WEBHOOK_SECRET");
      }
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (!client || !database) {
        return res.status(503).json({ message: "Database not configured" });
      }
      if (!dbReady) {
        try {
          await client.connect();
          dbReady = true;
        } catch (dbErr) {
          console.error("Webhook DB connect failed:", dbErr?.message ?? dbErr);
          return res.status(503).json({ message: "Database starting, retry shortly" });
        }
      }
      const subscriptions = database.collection("subscriptions");
      const users = database.collection("user");

      // Handle the event
      switch (event.type) {
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object;

          await subscriptions.updateOne(
            { stripeSubscriptionId: subscription.id },
            {
              $set: {
                status: subscription.status,
                currentPeriodEnd: new Date(
                  subscription.current_period_end * 1000,
                ).toISOString(),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                updatedAt: new Date().toISOString(),
              },
            },
          );

          // If deleted or past_due, downgrade user to free plan
          if (
            subscription.status === "canceled" ||
            subscription.status === "unpaid"
          ) {
            const subDoc = await subscriptions.findOne({
              stripeSubscriptionId: subscription.id,
            });
            if (subDoc && subDoc.userId) {
              await users.updateOne(
                { _id: new ObjectId(subDoc.userId) },
                { $set: { plan: "free" } },
              );
            }
          }
          break;
        }
        case "checkout.session.completed": {
          // checkout session completed is handled mostly by our success verify route,
          // but we can also handle it here as a fallback if the user closes the browser early.
          const session = event.data.object;
          if (
            session.mode === "subscription" &&
            session.payment_status === "paid"
          ) {
            const planId =
              session.subscription_details?.metadata?.planId ||
              session.metadata?.planId;
            const userId =
              session.subscription_details?.metadata?.userId ||
              session.metadata?.userId;

            if (userId && planId) {
              await subscriptions.updateOne(
                { stripeSubscriptionId: session.subscription },
                {
                  $set: {
                    userId: userId,
                    planId: planId,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    status: "active",
                    updatedAt: new Date().toISOString(),
                  },
                  $setOnInsert: {
                    createdAt: new Date().toISOString(),
                  },
                },
                { upsert: true },
              );

              await users.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { plan: planId } },
              );
            }
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      } catch (e) {
      console.error("Database error in webhook:", e);
    }

    res.json({ received: true });
  },
);

app.use(express.json());
dotenv.config();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-recruiter-id");
  next();
});

const port = process.env.PORT || process.env.port;

//mongodb connection — cached for Vercel serverless reuse.
// Db object can be created synchronously; actual socket connects lazily
// via ensureDb so routes exist even on cold start.

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

function createMongoClient() {
  return new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

if (!global._hiresphereClient) {
  global._hiresphereClient = uri ? createMongoClient() : null;
}
const client = global._hiresphereClient;
const database = client ? client.db(dbName) : null;

let dbReady = false;
async function ensureDb(req, res, next) {
  if (!client || !database) {
    return res.status(503).json({ message: "Database not configured" });
  }
  if (dbReady) return next();
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    dbReady = true;
    console.log("MongoDB connected.");
    return next();
  } catch (error) {
    console.error("MongoDB connect failed:", error?.message ?? error);
    return res.status(503).json({ message: "Database starting, retry shortly" });
  }
}

// Warm up in background on cold start — non-blocking, never exits on Vercel.
if (client) {
  client
    .connect()
    .then(() => client.db("admin").command({ ping: 1 }))
    .then(() => {
      dbReady = true;
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!",
      );
    })
    .catch((error) => {
      console.error("MongoDB warmup failed (will retry per-request):", error?.message ?? error);
    });
}

// Mount routes immediately so they exist on cold start — DB connects lazily
// via ensureDb per request. DB-free routes (/, /health, webhook signature
// check) work even before Mongo is up.
if (database) {
  app.use(["/api/my", "/api/jobs", "/api/companies", "/api/plans"], ensureDb);
  const {
    mountMyRoutes,
    mountPublicEnhancements,
    mountSubscriptionsRoutes,
  } = require("./routes");
  mountMyRoutes(app, database);
  mountPublicEnhancements(app, database);
  mountApplicationsRoutes(app, database);
  if (mountSubscriptionsRoutes) mountSubscriptionsRoutes(app, database);
} else {
  console.error("MONGODB_URI missing — API routes not mounted.");
}

function mountApplicationsRoutes(app, database) {
  const applications = database.collection("applications");
  const jobs = database.collection("jobs");
  const users = database.collection("user");

  async function requireSeeker(req, res, next) {
    const userId = req.headers["x-recruiter-id"];
    if (
      !userId ||
      typeof userId !== "string" ||
      userId === "null" ||
      userId === "undefined" ||
      userId.length < 1 ||
      !ObjectId.isValid(userId)
    ) {
      return res
        .status(401)
        .json({ message: "Missing or invalid x-recruiter-id header" });
    }

    try {
      const user = await users.findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ message: "Unknown user" });
      }
      if (user.role !== "seeker") {
        return res
          .status(403)
          .json({ message: "Only job seekers can access applications" });
      }
      req.userId = userId;
      return next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Unable to validate user", error: error.message });
    }
  }

  app.get("/api/my/applications", requireSeeker, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(req.query.pageSize, 10) || 12),
      );
      const filter = { userId: req.userId };
      const [items, total] = await Promise.all([
        applications
          .find(filter)
          .sort({ appliedAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        applications.countDocuments(filter),
      ]);
      res.json({
        items,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching applications", error: error.message });
    }
  });

  app.get("/api/my/applications/:jobId", requireSeeker, async (req, res) => {
    try {
      const application = await applications.findOne({
        userId: req.userId,
        jobId: req.params.jobId,
      });
      res.json({ application: application ?? null });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching application", error: error.message });
    }
  });

  app.post("/api/my/applications", requireSeeker, async (req, res) => {
    try {
      const {
        jobId,
        name,
        email,
        phone,
        coverLetter,
        resumeUrl,
        expectedSalary,
      } = req.body ?? {};
      if (!jobId) {
        return res.status(400).json({ message: "jobId is required" });
      }
      if (!name || !email) {
        return res.status(400).json({ message: "name and email are required" });
      }
      const job = await jobs.findOne({
        $or: [
          { jobId },
          { slug: jobId },
          {
            _id: require("mongodb").ObjectId.isValid(jobId)
              ? new (require("mongodb").ObjectId)(jobId)
              : null,
          },
        ].filter(Boolean),
      });
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (job.status && job.status !== "active") {
        return res
          .status(400)
          .json({ message: "This job is not accepting applications" });
      }
      const existing = await applications.findOne({
        userId: req.userId,
        jobId,
      });
      if (existing) {
        return res
          .status(200)
          .json({ application: existing, alreadyApplied: true });
      }
      const doc = {
        userId: req.userId,
        jobId,
        jobTitle: job.title || null,
        companySlug: job.companySlug || job.companyId || null,
        name,
        email,
        phone: phone || null,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl || null,
        expectedSalary: expectedSalary ?? null,
        status: "submitted",
        appliedAt: new Date().toISOString(),
      };
      const result = await applications.insertOne(doc);
      await jobs.updateOne({ _id: job._id }, { $inc: { applicants: 1 } });
      const inserted = await applications.findOne({ _id: result.insertedId });
      res.status(201).json({ application: inserted });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error applying to job", error: error.message });
    }
  });

  app.delete("/api/my/applications/:jobId", requireSeeker, async (req, res) => {
    try {
      const jobId = req.params.jobId;
      if (!jobId) {
        return res.status(400).json({ message: "jobId is required" });
      }
      const application = await applications.findOne({
        userId: req.userId,
        jobId,
      });
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      const job = await jobs.findOne({
        $or: [
          { jobId },
          { slug: jobId },
          ...(ObjectId.isValid(jobId) ? [{ _id: new ObjectId(jobId) }] : []),
        ],
      });
      await applications.deleteOne({ _id: application._id });
      // Decrement the job's applicant counter so it stays consistent.
      if (job) {
        await jobs.updateOne(
          { _id: job._id, applicants: { $gt: 0 } },
          { $inc: { applicants: -1 } },
        );
      }
      res.json({ ok: true, withdrawn: true });
    } catch (error) {
      res.status(500).json({
        message: "Error withdrawing application",
        error: error.message,
      });
    }
  });
}

app.get("/health", (req, res) => {
  res.json({ ok: true, db: dbReady ? "ready" : "starting" });
});

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            background: #000;
            color: #fff;
            font-family: sans-serif;
            display: flex;
            font-size: 3rem;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
        </style>
      </head>
      <body>
        HireSphere API is running
      </body>
    </html>
  `);
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`HireSphere is running on port ${port}`);
  });
}
