export type CartProduct = {
  _id: string;
  name: string;
  slug: string;
  title: string;
  basePrice: number;
  gstRate: number;
  price: number;
  stock: number;
  images: {
    url: string;
    public_id: string;
  }[];
};

export type CartItem = {
  _id: string;
  product: CartProduct;
  quantity: number;
  subtotal: number;
  gstAmount: number;
  totalWithGST: number;
};

export type CartResponse = {
  _id: string;
  user: string;
  items: CartItem[];
  cartSubtotal: number;
  cartGST: number;
  cartTotal: number;
  totalVerification: boolean;
};
