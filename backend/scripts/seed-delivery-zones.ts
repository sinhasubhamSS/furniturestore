// scripts/seed-delivery-zones.ts
import dotenv from 'dotenv';
import mongoose from "mongoose";
import { seedJharkhandPincodes } from "../src/data/seeders/jharkhand-pincodes";
dotenv.config();
async function runSeed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required");
    }
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("📦 Connected to MongoDB");

    // Get environment and options from command line
    const args = process.argv.slice(2);
    const environment =
      args.find((arg) => arg.startsWith("--env="))?.split("=")[1] ||
      "development";
    const clearData = args.includes("--clear");

    // Set environment variable for seeder
    if (clearData) {
      process.env.CLEAR_SEED_DATA = "true";
    }

    await seedJharkhandPincodes(environment);

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Seed failed:", error);
    process.exit(1);
  }
}

runSeed();
