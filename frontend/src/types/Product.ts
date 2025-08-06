export type Variant = {
  color?: string;
  size?: string;
  price: number;
  basePrice: number;
  gstRate: number;
  stock: number;
  images: {
    url: string;
    public_id: string;
  }[];
};

export type Specification = {
  section: string;
  specs: {
    key: string;
    value: string;
  }[];
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  title: string;
  description: string;

  // ✅ Use the shared Specification type
  specifications: Specification[];

  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };

  variants: Variant[];
  colors?: string[];
  sizes?: string[];
  warranty?: string;
  disclaimer?: string;

  category: {
    _id: string;
    name: string;
  };

  stock?: number;
  
  price?: number;

  createdBy: string;
  createdAt: string;
  isPublished: boolean;
};

export type AdminProductResponse = {
  products: Product[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
};

export type UserProductResponse = {
  products: Product[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
};
