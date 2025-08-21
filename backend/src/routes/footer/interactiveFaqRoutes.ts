import express from "express";
import { InteractiveFAQController } from "../../controllers/footer/interactiveFaqController"

const router = express.Router();
const interactiveFAQController = new InteractiveFAQController();

// ✅ Core Interactive FAQ Routes (Public)
router.get("/categories", interactiveFAQController.getMainCategories);
router.get(
  "/category/:category",
  interactiveFAQController.getCategoryQuestions
);
router.get("/details/:id", interactiveFAQController.getFAQDetails);
router.get("/search", interactiveFAQController.searchFAQs);
router.post("/feedback", interactiveFAQController.submitFeedback);

export default router;

// import express from "express";
// import { InteractiveFAQController } from "../../controllers/footer/interactivefaqController";
// // Import your existing auth middleware when needed
// // import { protect, restrictTo } from '../../middleware/auth';

// const router = express.Router();
// const interactiveFAQController = new InteractiveFAQController();

// // ✅ Public Routes (No Authentication Required)
// router.get("/categories", interactiveFAQController.getMainCategories);
// router.get("/category/:category", interactiveFAQController.getCategoryQuestions);
// router.get("/details/:id", interactiveFAQController.getFAQDetails);
// router.get("/search", interactiveFAQController.searchFAQs);
// router.post("/feedback", interactiveFAQController.submitFeedback);

// // Quick actions for interactive FAQ
// // router.get("/popular", interactiveFAQController.getPopularFAQs);
// // router.get("/recent", interactiveFAQController.getRecentFAQs);

// // ✅ Admin Routes (Authentication Required - Add middleware later)
// // Uncomment these when you add authentication middleware
// // router.use(protect); // Add your auth middleware
// // router.use(restrictTo('admin', 'support', 'content_manager')); // Add role-based access

// // router.post("/admin/create", interactiveFAQController.createFAQ);
// // router.put("/admin/:id", interactiveFAQController.updateFAQ);
// // router.delete("/admin/:id", interactiveFAQController.deleteFAQ);
// // router.get("/admin/list", interactiveFAQController.getFAQsWithPagination);
// // router.get("/admin/stats", interactiveFAQController.getFAQStats);
// // router.patch("/admin/:id/toggle-status", interactiveFAQController.toggleFAQStatus);
// // router.post("/admin/bulk-update", interactiveFAQController.bulkUpdateFAQs);

// // // Analytics routes for admin
// // router.get("/admin/analytics/popular", interactiveFAQController.getPopularityAnalytics);
// // router.get("/admin/analytics/feedback", interactiveFAQController.getFeedbackAnalytics);

// export default router;
