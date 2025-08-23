import React from "react";
import { socialLinks } from "../data/SocialLinks";
import type { SocialLink } from "../../../types/footer/footer";

interface AppDownloadLink {
  name: string;
  url: string;
  icon: string;
}

const ConnectWithUs: React.FC = () => {
  const appDownloadLinks: AppDownloadLink[] = [
    {
      name: "Google Play",
      url: "https://play.google.com/store",
      icon: "📱",
    },
    {
      name: "App Store",
      url: "https://apps.apple.com",
      icon: "🍎",
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
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-2 bg-[--color-secondary] hover:bg-[--color-hover-card] rounded-lg border border-[--color-border-custom] transition-colors"
            >
              <span className="text-lg">{social.icon}</span>
              <span className="text-sm font-medium text-[--text-accent]">
                {social.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Mobile App Download */}
      <div className="space-y-3">
        <h5 className="font-medium text-[--text-accent]">Download Our App</h5>
        <div className="space-y-2">
          {appDownloadLinks.map((app: AppDownloadLink, index: number) => (
            <a
              key={index}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-2 bg-[--color-accent] hover:opacity-90 text-[--text-light] rounded-lg transition-opacity"
            >
              <span className="text-lg">{app.icon}</span>
              <span className="text-sm font-medium">
                Download for {app.name}
              </span>
            </a>
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
