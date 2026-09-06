const { MongoClient } = require("mongodb");

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] || "admin";
  if (!email) {
    console.error("Usage: node scripts/set-admin.js <email> [admin|mod]");
    process.exit(1);
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const users = client.db(process.env.MONGODB_DB_NAME).collection("user");
  const result = await users.updateOne(
    { email: String(email).toLowerCase() },
    { $set: { role, updatedAt: new Date().toISOString() } },
  );
  console.log(`Matched ${result.matchedCount}, updated ${result.modifiedCount} -> ${role}`);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
