import React from "react";
import CompanyInfo from "./sections/CompanyInfo";
import NavigationLinks from "./sections/NavigationLinks";
import ContactInfo from "./sections/ContactInfo"; // ✅ Fixed - Was importing CompanyInfo
import Newsletter from "./sections/NewsLetter"; // ✅ Fixed casing - Was NewsLetter
import CustomerSupport from "./sections/CustomerSupport";
import ConnectWithUs from "./sections/ConnectWithUs";
import StoreLocator from "./sections/StoreLocator";
import type { FooterProps } from "../../types/footer";

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer
      className={`bg-[--color-secondary] text-[--text-dark] mt-auto ${className}`}
    >
      {/* Newsletter Section - Full width background */}
      <Newsletter />

      {/* Main Footer Content - Full width background */}
      <div className="w-full bg-[--color-card] py-12">
        {/* Content constrained to max-width */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <CompanyInfo />
            </div>
            <div className="lg:col-span-1">
              <NavigationLinks />
            </div>
            <div className="lg:col-span-1">
              <CustomerSupport />
            </div>
            <div className="lg:col-span-1">
              <ConnectWithUs />
            </div>
          </div>
        </div>
      </div>

      {/* Store Locator Section - Full width background */}
      <StoreLocator />

      {/* Contact Info - Full width background */}
      <ContactInfo />

      {/* Footer Bottom - Full width background */}
      <div className="w-full bg-[--color-accent] text-[--text-light] py-4">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              &copy; 2025 Your Store Name. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a
                href="/privacy"
                className="hover:text-[--color-primary] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="hover:text-[--color-primary] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/returns"
                className="hover:text-[--color-primary] transition-colors"
              >
                Returns & Refunds
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
