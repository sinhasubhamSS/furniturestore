// Base shared structure
export type Variant = {
  _id?: string;
  color?: string;
  size?: string;
  basePrice: number;
  gstRate: number;
  stock: number;
  images: {
    url: string;
    public_id: string;
  }[];
  price?: number;
};

export type BaseProduct = {
  _id: string;
  name: string;
  title: string;
  description: string;
  variants: Variant[];
  specifications?: Specification[];
  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  isPublished: boolean;
  warranty?: string;
  disclaimer?: string;
};

// Input/Create: used when sending data (category is just ID)
export type Product = BaseProduct & {
  category: string; // just the ID
};

// Display/View: used when receiving data (category is populated)
export type DisplayProduct = BaseProduct & {
  category: {
    _id: string;
    name: string;
  };
};

// Variant & Specification stay as-is

export type Specification = {
  section: string;
  specs: {
    key: string;
    value: string;
  }[];
};

// Response types
export type AdminProductResponse = {
  products: DisplayProduct[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
};

export type UserProductResponse = {
  products: DisplayProduct[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
};
