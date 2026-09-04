import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Lazy-load the MongoDB client to prevent Next.js build from hanging
let _client;
let _db;

function getDb() {
  // If we are in the Next.js build process, we use a dummy DB.
  // Next.js static generation doesn't need to read from DB for static routes.
  const isBuild = process.env.BUILD_MODE === "1";

  if (isBuild) {
    console.log("Mocking MongoDB during Next.js build to prevent hang...");
    return {
      collection: () => ({
        findOne: async () => null,
        find: () => ({ toArray: async () => [] }),
      }),
      databaseName: "dummy",
    };
  }

  if (!_client) {
    _client = new MongoClient(process.env.MONGODB_URI);
    _db = _client.db(process.env.MONGODB_DB_NAME);
  }
  return _db;
}

const dbProxy = new Proxy(
  {},
  {
    get(target, prop) {
      return getDb()[prop];
    },
  },
);

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL,
  database: mongodbAdapter(dbProxy),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "seeker",
      },
      plan: {
        type: "string",
        default: "free",
      },
    },
  },
});
