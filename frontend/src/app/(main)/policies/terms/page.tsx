import React from "react";

const TermsOfUse: React.FC = () => {
  return (
    <main
      className="max-w-4xl mx-auto p-8 text-[--text-dark] rounded-md shadow-md"
      style={{ backgroundColor: "var(--color-card)" }}
    >
      <h1 className="text-4xl font-bold mb-8 text-[--color-accent]">
        Terms of Use
      </h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
        <p>
          By accessing and using Suvidha Furniture's services, you agree to
          these Terms of Use.
        </p>
        <p>
          Please read carefully before using the website. We may update these
          terms occasionally; continued use means acceptance of updates.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Account Registration</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            You must provide accurate, current, and complete information during
            registration.
          </li>
          <li>Maintain confidentiality of your account credentials.</li>
          <li>
            Notify us immediately of unauthorized use or security breaches.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Product Information & Pricing
        </h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            We strive for accurate product listings but do not guarantee
            availability or error-free content.
          </li>
          <li>Prices are subject to change without prior notice.</li>
          <li>
            We reserve the right to refuse or cancel orders due to pricing
            errors, inventory, or fraud suspicion.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Orders and Payments</h2>
        <p>
          Orders placed constitute a binding contract, subject to acceptance and
          availability. Payments must be completed through authorized methods.
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            We do not share payment information with third parties except
            payment processors.
          </li>
          <li>Failed or incomplete payments may delay or cancel orders.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Shipping and Delivery</h2>
        <p>
          Estimated delivery times are provided but are not guaranteed. We shall
          not be held liable for delays beyond our reasonable control.
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Risk passes to you on successful delivery receipt.</li>
          <li>
            You are responsible for inspecting goods upon receipt and reporting
            damages promptly.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Return and Refunds</h2>
        <p>
          Returns, cancellations, and refunds are governed separately under our
          Returns & Refunds Policy available on the website.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Conduct</h2>
        <p>
          Users agree not to misuse the platform, engage in fraudulent or
          prohibited activities, or infringe third-party rights. Violations can
          lead to account suspension or termination.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
        <p>
          All content, trademarks, logos, and designs on the site are owned or
          licensed by Suvidha Furniture. You must not copy, reproduce, or
          exploit them without written permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
        <p>
          We provide the platform "as is" without warranties. Suvidha Furniture
          is not liable for indirect, incidental, or consequential damages
          arising from use.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
        <p>
          These terms are governed by Indian law. Any disputes will be subject
          to courts located in Jharkhand, India.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p>
          Questions about these terms can be directed to
          support@suvidhafurniture.in.
        </p>
      </section>
    </main>
  );
};

export default TermsOfUse;
