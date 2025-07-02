// Task	Status
// Create MongoDB order (status: pending)	✅ Done
// Create Razorpay Order (API call)	⏳ Next
// Send order_id to frontend + open Razorpay	⏳ Next
// Frontend Razorpay checkout	⏳ Pending
// Verify payment on backend	⏳ Pending
// Update DB order (status: paid)	⏳ Pending

//aab mai razorpay ka instacne bana rha hu thik hai
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
export default razorpay;
