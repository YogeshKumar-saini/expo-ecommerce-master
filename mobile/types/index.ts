export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  subcategory?: string;
  images: string[];
  averageRating: number;
  totalReviews: number;
  brandName?: string;
  details?: string;
  sizes?: string;
  mrp?: string;
  sellPrice?: number;
  discount?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSubcategory {
  name: string;
  image: string;
  count: number;
}

export interface ProductCategory {
  name: string;
  image: string;
  count: number;
  subcategories: ProductSubcategory[];
}

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl: string;
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  user: string;
  clerkId: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
  };
  paymentResult: {
    id: string;
    status: string;
  };
  totalPrice: number;
  status: "pending" | "shipped" | "delivered";
  hasReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string | User;
  orderId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  clerkId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}
