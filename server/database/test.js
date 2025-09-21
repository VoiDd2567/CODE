import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const dbName = "UPT";

async function resetCollection() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("exercisesolution");

        await collection.drop();

        console.log(`Collection '${"exercisesolution"}' has been reset`);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

resetCollection();