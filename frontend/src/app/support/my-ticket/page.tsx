import SupportList from "@/components/footer/support/SupportList";
import React from "react";

const MyTicketsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My Support Tickets
          </h1>
          <p className="text-gray-600">
            Track and manage all your support requests
          </p>
        </div>

        <SupportList />
      </div>
    </div>
  );
};

export default MyTicketsPage;
