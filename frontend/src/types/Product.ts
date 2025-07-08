export type Product = {
  _id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  gstRate: number;
  price: number;
  basePrice: number;
  images: {
    url: string;
    public_id: string;
  }[];
  stock: number;

  // ✅ Change this:
  category: {
    _id: string;
    name: string;
  };

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
