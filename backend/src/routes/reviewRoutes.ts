// src/routes/reviewRoutes.ts
import express from 'express';
import ReviewController from '../controllers/reviewController';
import { authVerify } from '../middlewares/authVerify';



const router = express.Router();

// Public Routes (No Authentication Required)
router.get('/products/:productId/reviews', ReviewController.getProductReviews);
router.get('/reviews/:reviewId', ReviewController.getReviewById);

// Protected Routes (Authentication Required)
router.post('/products/:productId/reviews', authVerify, ReviewController.createReview);
router.put('/reviews/:reviewId', authVerify, ReviewController.updateReview);
router.delete('/reviews/:reviewId', authVerify, ReviewController.deleteReview);

// User-specific routes (Authentication Required)
// router.get('/users/reviews', authVerify, ReviewController.getUserReviews);

export default router;
