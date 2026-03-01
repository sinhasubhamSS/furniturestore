import React from "react";
import { navigationData } from "../data/NavigationData";
import Link from "next/link";

const NavigationLinks: React.FC = () => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-[--color-accent]">
        Quick Links
      </h4>

      {navigationData.map((section, index) => (
        <div key={index} className="space-y-2">
          <h5 className="font-medium text-[--text-accent]">{section.title}</h5>

          <ul className="space-y-1 text-sm">
            {section.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <Link
                  href={link.url}
                  className="hover:text-[var(--color-accent)] transition"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default NavigationLinks;
