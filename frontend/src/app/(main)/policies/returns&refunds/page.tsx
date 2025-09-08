import React from "react";

const ReturnsRefunds: React.FC = () => {
  return (
    <main
      className="max-w-4xl mx-auto p-8 text-[--text-dark] rounded-md shadow-md"
      style={{ backgroundColor: "var(--color-card)" }}
    >
      <h1 className="text-4xl font-bold mb-8 text-[--color-accent]">
        Returns & Refunds Policy
      </h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Cancellation Policy</h2>
        <p>
          Customers can cancel their order{" "}
          <strong>anytime before dispatch</strong>. Once the order is out for
          delivery, cancellation is not possible. However, customers may{" "}
          <strong>reject the order at the doorstep</strong> upon delivery.
        </p>
        <p>
          Specific cancellation windows and fees may apply, as mentioned on the
          product or order confirmation page. Suvidha Furniture reserves the
          right to cancel any order due to product unavailability, suspected
          fraud, or logistical issues. All prepaid orders cancelled by us will
          receive a <strong>full refund</strong> within 5-7 business days.
        </p>
        <p>
          For cancellations beyond the allowed time, a cancellation fee may be
          charged as per the product category.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Returns Policy</h2>
        <p>
          Returns for furniture items are allowed{" "}
          <strong>only within 10 days</strong> of delivery or installation, and
          only if the product is defective, damaged, or incorrect.
        </p>
        <p>
          Products requiring installation must be installed by Suvidha
          Furniture’s authorized personnel for the return to be valid.
        </p>
        <p>
          During the 10-day window, troubleshooting may be done online, through
          phone support, or in-person technical visits.
        </p>
        <p>
          If a defect is confirmed within the return window, a{" "}
          <strong>refund or replacement</strong> will be provided at no extra
          cost. If no defect is found or issue is not confirmed within 10 days
          post-delivery or installation, customers will be directed to
          authorized service centers for repairs. Only one replacement is
          provided for each returned item.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Fees and Charges</h2>
        <p>
          Delivery, packaging, handling, and fitting/installation fees are{" "}
          <strong>non-refundable</strong> once service has been performed. If
          fitting/installation is completed, the fitting charges will not be
          refunded even if the product is returned.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Return Process</h2>
        <p>
          To initiate a return, customers should contact our customer support
          team with order details and any supporting photos within the 10-day
          return window. Returned items must be unused (unless defective),
          well-packaged, and include all original accessories and documentation.
          Returns will be processed after inspection. Approved refunds will be
          issued to the original payment method within 7-14 business days.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Exclusions</h2>
        <p>
          Custom, personalized, or made-to-order furniture items may not be
          eligible for return unless defective. Products damaged due to misuse,
          improper handling after delivery, or without original packaging will
          not be accepted.
        </p>
      </section>
    </main>
  );
};

export default ReturnsRefunds;
