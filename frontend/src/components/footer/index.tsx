import React from "react";
import CompanyInfo from "./sections/CompanyInfo";
import NavigationLinks from "./sections/NavigationLinks";
import Newsletter from "./sections/NewsLetter";
import CustomerSupport from "./sections/CustomerSupport";
import ConnectWithUs from "./sections/ConnectWithUs";
import type { FooterProps } from "../../types/footer/footer";
import OurStores from "./sections/OurStores";
const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`mt-auto ${className}`}>
      {/* ================= NEWSLETTER ================= */}
      <div className="bg-[var(--color-primary)] py-16">
        <div className="max-w-[1280px] mx-auto px-4">
          <Newsletter source="website_footer" />
        </div>
      </div>

      {/* ================= MAIN FOOTER ================= */}
      <div className="bg-[var(--color-secondary)] py-16">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {" "}
            <CompanyInfo />
            <NavigationLinks />
            <div className="space-y-10">
              <CustomerSupport />
              <OurStores />
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="bg-[var(--color-accent)] text-white py-5">
        <div className="max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2025 Suvidha Furniture. All rights reserved.</p>

          <div className="flex gap-6">
            <a href="/policies/privacy" className="hover:opacity-80 transition">
              Privacy Policy
            </a>
            <a href="/policies/terms" className="hover:opacity-80 transition">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
