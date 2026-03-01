import React from "react";
import { socialLinks } from "../data/SocialLinks";

const ConnectWithUs: React.FC = () => {
  const activeSocials = socialLinks.filter((s) => !s.isUpcoming);

  if (activeSocials.length === 0) return null;

  return (
    <div className="space-y-5">
      <h4 className="text-lg font-semibold text-[--color-accent]">
        Connect With Us
      </h4>

      <div className="flex gap-6 text-sm">
        {activeSocials.map((social, index) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-accent)] transition"
          >
            {social.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ConnectWithUs;
