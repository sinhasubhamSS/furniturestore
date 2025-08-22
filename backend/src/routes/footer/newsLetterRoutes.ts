import express from "express";
import { NewsletterController } from "../../controllers/footer/newsletterController";

const router = express.Router();
const newsletterController = new NewsletterController();

// ✅ Public Routes
router.post("/subscribe", newsletterController.subscribe);
router.get("/verify/:token", newsletterController.verifyEmail);
router.post("/unsubscribe", newsletterController.unsubscribe);
router.put("/preferences", newsletterController.updatePreferences);
router.get("/subscriber", newsletterController.getSubscriber);

// ✅ Admin Routes (Add authentication middleware when ready)
// router.use(protect);
// router.use(restrictTo('admin', 'marketing'));

router.get(
  "/admin/subscribers",
  newsletterController.getSubscribersWithPagination
);
router.get("/admin/search", newsletterController.searchSubscribers);
router.get("/admin/stats", newsletterController.getNewsletterStats);
router.post("/admin/newsletter", newsletterController.sendNewsletter); // ✅ Added missing route

export default router;
