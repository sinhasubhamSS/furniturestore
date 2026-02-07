import React from "react";

const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

const ContactInfo: React.FC = () => {
  return (
    <div className="w-full bg-[--color-secondary] py-8 border-t border-[--color-border-custom]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[--color-accent]">
              Contact Us
            </h4>

            {PHONE && (
              <div className="flex gap-3 text-sm">
                <span>📞</span>
                <a
                  href={`tel:+91${PHONE}`}
                  className="hover:text-[--color-accent]"
                >
                  +91 {PHONE}
                </a>
              </div>
            )}

            {EMAIL && (
              <div className="flex gap-3 text-sm">
                <span>📧</span>
                <a
                  href={`mailto:${EMAIL}`}
                  className="hover:text-[--color-accent]"
                >
                  {EMAIL}
                </a>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[--color-accent]">
              Head Office
            </h4>
            <p className="text-sm leading-relaxed">
              📍 Main Road, Gumla, Jharkhand – 835207
            </p>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[--color-accent]">
              Business Hours
            </h4>
            <p className="text-sm">
              ⏰ Mon–Fri: 9 AM – 8 PM <br />
              Sat–Sun: 10 AM – 6 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
