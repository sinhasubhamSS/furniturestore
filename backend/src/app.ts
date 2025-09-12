import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true, // 👈 important if using cookies
  })
);
app.use(cookieParser());
app.use(express.json());

import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import wishlistRoute from "./routes/wishlistRoutes";
import addressRoute from "./routes/addressRoutes";
import orderRoute from "./routes/orderRoutes";
import returnRoute from "./routes/returnRoutes";
import paymentRoute from "./routes/paymentRoutes";
import categoryRoute from "./routes/categoryRoutes";
import supportTicketRoutes from "./routes/footer/supportTicketRoutes";
import dashboardRoutes from "./routes/adminRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import reviewRoutes from "./routes/reviewRoutes";
import newsletterRoutes from "./routes/footer/newsLetterRoutes";
import interactiveFaqRoutes from "./routes/footer/interactiveFaqRoutes";
import deliveryRoutes from "./routes/deliverRoutes";
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/address", addressRoute);
app.use("/api/order", orderRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/returns", returnRoute);

app.use("/api/category", categoryRoute);
app.use("/api/admin", dashboardRoutes);
//reviews
app.use("/api", reviewRoutes);
//delivery
app.use("/api/delivery", deliveryRoutes);

//customer support

app.use("/api/support", supportTicketRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/interactive-faq", interactiveFaqRoutes);

app.use(errorMiddleware);
export default app;
