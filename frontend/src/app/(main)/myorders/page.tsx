// "use client";

// import { useEffect } from "react";
// import { useGetMyOrdersQuery } from "@/redux/services/user/orderApi";

// const MyOrdersPage = () => {
//   const {
//     data: orders,
//     isLoading,
//     isError,
//     refetch,
//   } = useGetMyOrdersQuery();

//   useEffect(() => {
//     refetch(); // optional: refresh on mount
//   }, [refetch]);

//   if (isLoading) return <p className="text-center mt-6">Loading orders...</p>;
//   if (isError) return <p className="text-center mt-6 text-red-500">Failed to load orders.</p>;

//   if (!orders || orders.length === 0)
//     return <p className="text-center mt-6 text-gray-500">No orders yet.</p>;

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <h1 className="text-2xl font-semibold mb-4 text-center">My Orders</h1>

//       <div className="space-y-4">
//         {orders.map((order, index) => (
//           <div
//             key={index}
//             className="border rounded-lg p-4 shadow-sm bg-white"
//           >
//             <p className="font-medium text-lg mb-2">
//               Order #{order._id?.slice(-6).toUpperCase()}
//             </p>

//             <p className="text-sm text-gray-600 mb-2">
//               Placed on:{" "}
//               {new Date(order.createdAt).toLocaleDateString("en-IN", {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//               })}
//             </p>

//             <div className="space-y-1 text-sm">
//               {order.items.map((item, i) => (
//                 <p key={i}>
//                   {item.productId.name} × {item.quantity}
//                 </p>
//               ))}
//             </div>

//             <p className="mt-3 text-sm">
//               Total: ₹<strong>{order.totalAmount}</strong>
//             </p>

//             <p className="text-sm">
//               Payment: <span className="capitalize">{order.payment.method}</span>
//             </p>

//             <p
//               className={`text-sm font-medium ${
//                 order.status === "DELIVERED"
//                   ? "text-green-600"
//                   : order.status === "CANCELLED"
//                   ? "text-red-500"
//                   : "text-blue-500"
//               }`}
//             >
//               Status: {order.status}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MyOrdersPage;
