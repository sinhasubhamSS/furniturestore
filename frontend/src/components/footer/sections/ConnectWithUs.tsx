import React from "react";
import { socialLinks } from "../data/SocialLinks";
import type { SocialLink } from "../../../types/footer/footer";

interface AppDownloadLink {
  name: string;
  url?: string;
  icon: string;
  isUpcoming?: boolean;
}

const ConnectWithUs: React.FC = () => {
  const appDownloadLinks: AppDownloadLink[] = [
    {
      name: "Google Play",
      icon: "📱",
      isUpcoming: true,
    },
    {
      name: "App Store",
      icon: "🍎",
      isUpcoming: true,
    },
  ];

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-[--color-accent] border-b border-[--color-border-custom] pb-2">
        Connect With Us
      </h4>

      {/* Social Media Links */}
      <div className="space-y-3">
        <h5 className="font-medium text-[--text-accent]">Follow Us</h5>
        <div className="space-y-2">
          {socialLinks.map((social: SocialLink, index: number) => (
            <div
              key={index}
              className="relative flex items-center space-x-3 p-2 bg-[--color-secondary] rounded-lg border border-[--color-border-custom] cursor-not-allowed opacity-60"
              title={`${social.name} - Coming Soon`}
            >
              <span className="text-lg">{social.icon}</span>
              <span className="relative inline-block font-medium text-green">
                {social.name}
                {social.isUpcoming && (
                  <span
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/1 bg-[--color-primary] text-green-600  text-[8px] font-bold uppercase select-none"
                    aria-label="Upcoming"
                    title="Upcoming"
                  >
                    Upcoming
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile App Download */}
      <div className="space-y-3">
        <h5 className="font-medium text-[--text-accent]">Download Our App</h5>
        <div className="space-y-2">
          {appDownloadLinks.map((app: AppDownloadLink, index: number) => (
            <div
              key={index}
              className="relative flex items-center space-x-3 p-2 bg-[--color-accent] text-[--text-light] rounded-lg opacity-60 cursor-not-allowed select-none"
              title={`Download for ${app.name} - Coming Soon`}
            >
              <span className="text-lg">{app.icon}</span>
              <span className="relative inline-block font-medium">
                Download for {app.name}
                {app.isUpcoming && (
                  <span
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-[--color-primary] text-green-600 text-[8px] font-bold uppercase select-none"
                    aria-label="Upcoming"
                    title="Upcoming"
                  >
                    Upcoming
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Reference */}
      <div className="bg-[--color-secondary] p-4 rounded-lg border border-[--color-border-custom]">
        <h5 className="font-medium text-[--text-accent] mb-2">Stay Updated</h5>
        <p className="text-xs text-[--text-accent] opacity-70">
          Don't miss out! Subscribe to our newsletter for exclusive deals and
          updates.
        </p>
      </div>
    </div>
  );
};

export default ConnectWithUs;
