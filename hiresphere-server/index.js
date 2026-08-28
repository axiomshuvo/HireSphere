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

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`HireSphere is running on port ${port}`);
  });
}
