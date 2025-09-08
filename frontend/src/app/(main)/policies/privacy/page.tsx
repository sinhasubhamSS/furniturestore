import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <main
      className="max-w-4xl mx-auto p-8 text-[--text-dark] rounded-md shadow-md"
      style={{ backgroundColor: "var(--color-card)" }}
    >
      <h1 className="text-4xl font-bold mb-8 text-[--color-accent] text-center">
        Privacy Policy
      </h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
        <p>
          Suvidha Furniture respects your privacy and is committed to protecting
          your personal information. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you visit
          our website and use our services.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
        <p>
          We collect personal information that you voluntarily provide when
          placing orders, creating an account, or contacting us. This includes
          your name, address, phone number, email, payment information, and
          order history.
        </p>
        <p>
          We may also collect non-personal information such as browser type, IP
          address, and user behavior to improve and personalize your shopping
          experience.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Use of Your Information</h2>
        <p>
          The information we collect is used to process and fulfill your orders,
          communicate order status, provide customer support, and improve our
          services.
        </p>
        <p>
          With your consent, we may send you promotional emails or updates about
          our products and offers. You may opt-out of these communications
          anytime.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">
          Cookies and Tracking Technologies
        </h2>
        <p>
          We use cookies and similar technologies to enhance website
          functionality, improve user experience, and analyze website traffic.
          You can control cookie preferences via your browser settings.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Information Sharing</h2>
        <p>
          We share your information only with trusted third parties involved in
          order processing, payment, and delivery. We do not sell or rent your
          information to marketers or unaffiliated parties.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
        <p>
          We implement a variety of security measures to maintain the safety of
          your personal information. Payment transactions are encrypted and
          processed securely.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal
          information. Please contact us at{" "}
          <a
            href="mailto:support@suvidhafurniture.in"
            className="text-[--color-primary] underline hover:text-[--color-accent]"
          >
            support@suvidhafurniture.in
          </a>{" "}
          for any privacy-related requests.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Children’s Privacy</h2>
        <p>
          Our services are not intended for individuals under the age of 18. We
          do not knowingly collect personal information from children.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
          <a
            href="mailto:support@suvidhafurniture.in"
            className="text-[--color-primary] underline hover:text-[--color-accent]"
          >
            support@suvidhafurniture.in
          </a>
          .
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
