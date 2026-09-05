import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";

// Lazy-load logic isn't needed with modern MongoDB driver as it connects automatically on first query.
// However, we still support BUILD_MODE mock for safety during static generation.
const isBuild = process.env.BUILD_MODE === "1";

let db;
if (isBuild) {
  console.log("Mocking MongoDB during Next.js build...");
  db = {
    collection: () => ({
      findOne: async () => null,
      find: () => ({ toArray: async () => [] }),
      createIndex: async () => null,
      updateOne: async () => null,
      insertOne: async () => null,
      deleteOne: async () => null,
    }),
    databaseName: "dummy",
  };
} else {
  // In development, preserve the client across hot reloads
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(process.env.MONGODB_URI);
    }
    db = global._mongoClient.db(process.env.MONGODB_DB_NAME);
  } else {
    const client = new MongoClient(process.env.MONGODB_URI);
    db = client.db(process.env.MONGODB_DB_NAME);
  }
}

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL,
  database: mongodbAdapter(db),
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
