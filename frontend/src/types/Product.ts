export type Variant = {
  color?: string;
  size?: string;
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
  title: string;
  description: string;
  category: string;
  variants: Variant[];
  specifications?: Specification[];
  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  isPublished: boolean;
  // Optional meta fields
  warranty?: string;
  disclaimer?: string;
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
