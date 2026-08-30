const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-recruiter-id");
  next();
});

const port = process.env.PORT || process.env.port;

//mongodb connection

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db(process.env.MONGODB_DB_NAME);
    // all database collections

    // Wire up the /api/my/* routes (recruiter-scoped, ownership-checked) and
    // enhance the public /api/companies + /api/jobs endpoints with pagination
    // and filters that the frontend expects.
    const { mountMyRoutes, mountPublicEnhancements } = require("./routes");
    mountMyRoutes(app, database);
    mountPublicEnhancements(app, database);
    mountSavedJobsRoutes(app, database);
    mountApplicationsRoutes(app, database);

    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}
run().catch(console.dir);

function mountSavedJobsRoutes(app, database) {
  const collection = database.collection("savedJobs");

  function requireSeeker(req, res, next) {
    const userId = req.headers["x-recruiter-id"];
    if (!userId || typeof userId !== "string" || userId === "null" || userId === "undefined" || userId.length < 1) {
      return res.status(401).json({ message: "Missing or invalid x-recruiter-id header" });
    }
    req.userId = userId;
    next();
  }

  app.get("/api/my/saved-jobs", requireSeeker, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(req.query.pageSize, 10) || 12),
      );
      const filter = { userId: req.userId };
      const [items, total] = await Promise.all([
        collection
          .find(filter)
          .sort({ savedAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        collection.countDocuments(filter),
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
        .json({ message: "Error fetching saved jobs", error: error.message });
    }
  });

  app.post("/api/my/saved-jobs", requireSeeker, async (req, res) => {
    try {
      const { jobId, title, companySlug } = req.body ?? {};
      if (!jobId) {
        return res.status(400).json({ message: "jobId is required" });
      }
      const existing = await collection.findOne({ userId: req.userId, jobId });
      if (existing) {
        return res
          .status(200)
          .json({ savedJob: existing, alreadySaved: true });
      }
      const doc = {
        userId: req.userId,
        jobId,
        title: title || null,
        companySlug: companySlug || null,
        savedAt: new Date().toISOString(),
      };
      const result = await collection.insertOne(doc);
      const savedJob = await collection.findOne({ _id: result.insertedId });
      res.status(201).json({ savedJob });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error saving job", error: error.message });
    }
  });

  app.delete(
    "/api/my/saved-jobs/:jobId",
    requireSeeker,
    async (req, res) => {
      try {
        const result = await collection.findOneAndDelete({
          userId: req.userId,
          jobId: req.params.jobId,
        });
        if (!result) {
          return res.status(404).json({ message: "Saved job not found" });
        }
        res.json({ message: "Saved job removed" });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error removing saved job", error: error.message });
      }
    },
  );
}

function mountApplicationsRoutes(app, database) {
  const applications = database.collection("applications");
  const jobs = database.collection("jobs");

  function requireSeeker(req, res, next) {
    const userId = req.headers["x-recruiter-id"];
    if (!userId || typeof userId !== "string" || userId === "null" || userId === "undefined" || userId.length < 1) {
      return res.status(401).json({ message: "Missing or invalid x-recruiter-id header" });
    }
    req.userId = userId;
    next();
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
        return res
          .status(400)
          .json({ message: "name and email are required" });
      }
      const job = await jobs.findOne({
        $or: [{ jobId }, { slug: jobId }, { _id: require("mongodb").ObjectId.isValid(jobId) ? new (require("mongodb").ObjectId)(jobId) : null }].filter(Boolean),
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
      await applications.deleteOne({ _id: application._id });
      // Decrement the job's applicant counter so it stays consistent.
      await jobs.updateOne(
        { _id: application.jobId },
        { $inc: { applicants: -1 } },
      );
      res.json({ ok: true, withdrawn: true });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error withdrawing application", error: error.message });
    }
  });
}

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
