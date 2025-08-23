import React from "react";
import { navigationData } from "../data/NavigationData";
import type { NavigationSection, NavigationLink } from "@/types/footer/footer";

const NavigationLinks: React.FC = () => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-[--color-accent] border-b border-[--color-border-custom] pb-2">
        Quick Links
      </h4>

      <div className="space-y-4">
        {navigationData.map((section: NavigationSection, index: number) => (
          <div key={index}>
            <h5 className="font-medium text-[--text-accent] mb-2">
              {section.title}
            </h5>
            <ul className="space-y-1">
              {section.links.map((link: NavigationLink, linkIndex: number) => (
                <li key={linkIndex}>
                  <a
                    href={link.url}
                    className="text-sm text-[--text-accent] hover:text-[--color-accent] hover:underline transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationLinks;
