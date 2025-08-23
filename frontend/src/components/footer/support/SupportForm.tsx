"use client";

interface SupportFormProps {
  onTicketCreated?: (ticketNumber: string) => void;
}

import React, { useState } from "react";
import { SupportFormData, Category } from "@/types/footer/support/support";
import axiosClient from "../../../../utils/axios";

const SupportForm = ({ onTicketCreated }: SupportFormProps) => {
  const [formData, setFormData] = useState<SupportFormData>({
    customerName: "",
    customerEmail: "",
    subject: "",
    description: "",
    category: "general" as Category,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosClient.post("/support/create", formData);
      const ticketNumber = response.data.data.ticketNumber;

      setSuccess(`Ticket created: ${ticketNumber}`);
      setFormData({
        customerName: "",
        customerEmail: "",
        subject: "",
        description: "",
        category: "general",
      });

      // ✅ Add this: Call the callback if provided
      if (onTicketCreated) {
        onTicketCreated(ticketNumber);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center">
        <h3 className="text-green-800 font-bold">✅ {success}</h3>
        <button
          onClick={() => setSuccess("")}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Create Another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow space-y-4"
    >
      <h2 className="text-xl font-bold">Create Support Ticket</h2>

      <input
        type="text"
        placeholder="Your Name *"
        value={formData.customerName}
        onChange={(e) =>
          setFormData({ ...formData, customerName: e.target.value })
        }
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="email"
        placeholder="Your Email *"
        value={formData.customerEmail}
        onChange={(e) =>
          setFormData({ ...formData, customerEmail: e.target.value })
        }
        className="w-full p-2 border rounded"
        required
      />

      <select
        value={formData.category}
        onChange={(e) =>
          setFormData({ ...formData, category: e.target.value as Category })
        }
        className="w-full p-2 border rounded"
      >
        <option value="general">General Inquiry</option>
        <option value="order_issue">Order Issue</option>
        <option value="delivery">Delivery Problem</option>
        <option value="return_refund">Return & Refund</option>
        <option value="technical">Technical Support</option>
      </select>

      <input
        type="text"
        placeholder="Subject *"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />

      <textarea
        placeholder="Describe your issue *"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        className="w-full p-2 border rounded h-24"
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Submit Ticket"}
      </button>
    </form>
  );
};

export default SupportForm;
