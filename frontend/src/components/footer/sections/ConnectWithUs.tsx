import React from "react";
import { socialLinks } from "../data/SocialLinks";
import type { SocialLink } from "../../../types/footer/footer";

interface AppDownloadLink {
  name: string;
  icon: string;
  isUpcoming?: boolean;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const ConnectWithUs: React.FC = () => {
  const appDownloadLinks: AppDownloadLink[] = [
    { name: "Google Play", icon: "📱", isUpcoming: true },
    { name: "App Store", icon: "🍎", isUpcoming: true },
  ];

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-[--color-accent] border-b border-[--color-border-custom] pb-2">
        Connect With Us
      </h4>

      {/* Social Media */}
      <div className="space-y-3">
        <h5 className="font-medium text-[--text-accent]">Follow Us</h5>

        <div className="space-y-2">
          {socialLinks.map((social: SocialLink, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg border border-[--color-border-custom] bg-[--color-secondary] opacity-60 cursor-not-allowed"
            >
              <span className="text-lg">{social.icon}</span>
              <span className="text-sm font-medium">{social.name}</span>
              {social.isUpcoming && (
                <span className="ml-auto text-[10px] font-bold text-green-600">
                  UPCOMING
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* App Download */}
      <div className="space-y-3">
        <h5 className="font-medium text-[--text-accent]">Download Our App</h5>

        {appDownloadLinks.map((app, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 rounded-lg bg-[--color-accent] text-white opacity-60 cursor-not-allowed"
          >
            <span className="text-lg">{app.icon}</span>
            <span className="text-sm font-medium">
              {app.name} (Coming Soon)
            </span>
          </div>
        ))}
      </div>

      {/* WhatsApp CTA */}
      {WHATSAPP_NUMBER && (
        <a
          href={`https://wa.me/91${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
        >
          💬 Chat on WhatsApp
        </a>
      )}
    </div>
  );
};

export default ConnectWithUs;
