import mongoose from "mongoose";
import { InteractiveFAQ } from "../src/models/footer/interactiveFaq";
import { homeDecorFAQs } from "../src/data/faqs/homeDecorFAQs";
import dotenv from "dotenv";
dotenv.config();
async function seedInteractiveFAQDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://subhamsinhass344:subham123@cluster0.yp9tcvz.mongodb.net/suvidha"
    );
    console.log("🔌 Connected to MongoDB");

    // Clear existing Interactive FAQs
    const deleteResult = await InteractiveFAQ.deleteMany({});
    console.log(
      `🗑️  Cleared ${deleteResult.deletedCount} existing Interactive FAQs`
    );

    // Insert new FAQ data
    const insertResult = await InteractiveFAQ.insertMany(homeDecorFAQs);
    console.log(
      `✅ Successfully inserted ${insertResult.length} Interactive FAQs`
    );

    // Show category breakdown
    const categoryStats = await InteractiveFAQ.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          questions: { $push: "$question" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("\n📊 Category Breakdown:");
    categoryStats.forEach((cat) => {
      console.log(`\n📂 ${cat._id.toUpperCase()}: ${cat.count} FAQs`);
      cat.questions.forEach((q: string, index: number) => {
        console.log(`   ${index + 1}. ${q.substring(0, 50)}...`);
      });
    });

    // Validation
    const totalCount = await InteractiveFAQ.countDocuments();
    const activeCount = await InteractiveFAQ.countDocuments({ isActive: true });

    console.log(`\n✅ Validation:`);
    console.log(`   Total FAQs: ${totalCount}`);
    console.log(`   Active FAQs: ${activeCount}`);

    await mongoose.disconnect();
    console.log("\n🔌 Database connection closed");
    console.log("🎉 Interactive FAQ seeding completed successfully!");
  } catch (error: any) {
    console.error("❌ Error seeding Interactive FAQ data:", error.message);
    process.exit(1);
  }
}

// Run the seeding function
if (require.main === module) {
  seedInteractiveFAQDatabase();
}

export { seedInteractiveFAQDatabase };
