export interface NavigationLink {
  name: string;
  url: string;
}

export interface NavigationSection {
  title: string;
  links: NavigationLink[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface NewsletterFormData {
  email: string;
  preferences?: string[];
  source?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  hours: string;
}

export interface FooterProps {
  className?: string;
}
