const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config();

app.use(cors());

const port = process.env.port;

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

    // all companies collection
    const companiesCollection = database.collection("companies");

    // all jobs collection
    const jobsCollection = database.collection("jobs");

    app.get("/api/companies", async (req, res) => {
      try {
        const companies = await companiesCollection.find({}).toArray();
        res.json(companies);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching companies", error: error.message });
      }
    });

    app.post("/api/companies", async (req, res) => {
      const company = req.body;

      try {
        const result = await companiesCollection.insertOne({
          ...company,
          createdAt: new Date().toISOString(),
        });
        const inserted = await companiesCollection.findOne({
          _id: result.insertedId,
        });
        res.status(201).json({
          message: "Company created successfully",
          company: inserted,
        });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error creating company", error: error.message });
      }
    });

    function buildCompanyLookup(id) {
      const or = [{ companyId: id }];
      if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
        or.push({ _id: new ObjectId(id) });
      }
      return { $or: or };
    }

    app.put("/api/companies/:id", async (req, res) => {
      const companyParam = req.params.id;
      const { _id, id, companyId: incomingCompanyId, ...updatedCompany } =
        req.body;

      try {
        const result = await companiesCollection.updateOne(
          buildCompanyLookup(companyParam),
          { $set: updatedCompany },
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Company not found" });
        }

        res.json({ message: "Company updated successfully" });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error updating company", error: error.message });
      }
    });

    app.delete("/api/companies/:id", async (req, res) => {
      try {
        const companyParam = req.params.id;
        const result = await companiesCollection.deleteOne(
          buildCompanyLookup(companyParam),
        );

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Company not found" });
        }

        const companyId = companyParam;
        const jobsResult = await jobsCollection.updateMany(
          { companyId, status: "active" },
          { $set: { status: "closed", closedAt: new Date().toISOString() } },
        );

        res.json({
          message: "Company deleted successfully",
          closedJobs: jobsResult.modifiedCount,
        });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting company", error: error.message });
      }
    });

    // all jobs collection
    app.get("/api/jobs", async (req, res) => {
      try {
        const query = {};
        if (req.query.status) {
          query.status = req.query.status;
        }
        if (req.query.companyId) {
          query.companyId = req.query.companyId;
        }

        const jobs = await jobsCollection.find(query).toArray();
        res.json(jobs);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching jobs", error: error.message });
      }
    });

    app.get("/api/jobs/:id", async (req, res) => {
      try {
        const jobId = req.params.id;
        if (!ObjectId.isValid(jobId)) {
          return res.status(400).json({ message: "Invalid job id" });
        }

        const job = await jobsCollection.findOne({
          _id: new ObjectId(jobId),
        });
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }

        res.json(job);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching job", error: error.message });
      }
    });

    app.post("/api/jobs", async (req, res) => {
      const job = req.body;

      try {
        const result = await jobsCollection.insertOne({
          ...job,
          status: "active",
          applicants: 0,
          createdAt: new Date().toISOString(),
        });
        res.status(201).json({
          message: "Job created successfully",
          jobId: result.insertedId,
        });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error creating job", error: error.message });
      }
    });

    app.put("/api/jobs/:id", async (req, res) => {
      const jobId = req.params.id;
      const { _id, id, ...updatedJob } = req.body;

      try {
        const result = await jobsCollection.updateOne(
          { _id: new ObjectId(jobId) },
          { $set: updatedJob },
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Job not found" });
        }

        res.json({ message: "Job updated successfully" });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error updating job", error: error.message });
      }
    });

    app.patch("/api/jobs/:id/status", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "closed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      try {
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid job id" });
        }

        const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }

        if (status === "active") {
          if (!job.companyId) {
            return res.status(400).json({
              message:
                "Cannot activate a job that has no company. Add a company first.",
            });
          }

          const companyExists = await companiesCollection.findOne(
            buildCompanyLookup(job.companyId),
          );
          if (!companyExists) {
            return res.status(400).json({
              message:
                "Cannot activate a job whose company no longer exists. Restore the company or move the job first.",
            });
          }
        }

        const result = await jobsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status,
              ...(status === "active" ? { reopenedAt: new Date().toISOString() } : { closedAt: new Date().toISOString() }),
            },
          },
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Job not found" });
        }

        res.json({ message: "Status updated successfully" });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error updating status", error: error.message });
      }
    });

    app.delete("/api/jobs/:id", async (req, res) => {
      try {
        const result = await jobsCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Job not found" });
        }

        res.json({ message: "Job deleted successfully" });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting job", error: error.message });
      }
    });

    // Send a ping to confirm a successful connection
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

app.listen(port, () => {
  console.log(`HireSphere is running on port ${port}`);
});
