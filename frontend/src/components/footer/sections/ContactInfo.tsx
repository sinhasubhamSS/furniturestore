import React from "react";
import type { ContactInfo as ContactInfoType } from "../../../types/footer";

const ContactInfo: React.FC = () => {
  const contactDetails: ContactInfoType = {
    phone: "+91 1800-123-4567",
    email: "support@yourstore.com",
    address:
      "Head Office: 123 Business Park, Sector 18, Gurgaon, Haryana - 122001",
    hours: "Mon-Fri: 9 AM - 8 PM, Sat-Sun: 10 AM - 6 PM",
  };

  return (
    <div className="w-full bg-[--color-secondary] py-8">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[--color-accent]">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <span className="text-[--color-accent]">📞</span>
                <div>
                  <p className="font-medium text-[--text-accent]">
                    Customer Care
                  </p>
                  <a
                    href={`tel:${contactDetails.phone}`}
                    className="text-[--text-accent] hover:text-[--color-accent]"
                  >
                    {contactDetails.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-[--color-accent]">📧</span>
                <div>
                  <p className="font-medium text-[--text-accent]">
                    Email Support
                  </p>
                  <a
                    href={`mailto:${contactDetails.email}`}
                    className="text-[--text-accent] hover:text-[--color-accent]"
                  >
                    {contactDetails.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[--color-accent]">
              Head Office
            </h4>
            <div className="flex items-start space-x-3 text-sm">
              <span className="text-[--color-accent]">📍</span>
              <p className="text-[--text-accent] leading-relaxed">
                {contactDetails.address}
              </p>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[--color-accent]">
              Business Hours
            </h4>
            <div className="flex items-start space-x-3 text-sm">
              <span className="text-[--color-accent]">⏰</span>
              <p className="text-[--text-accent] leading-relaxed">
                {contactDetails.hours}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
