import type { ShippingAddressType } from "@/types";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Udemy Store";

export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Udemy Store Project by Next.js 15";

export const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

export const shippingAddressDefaultValues: ShippingAddressType = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS?.split(", ") || [
  "Paypal",
  "Stripe",
  "CashOnDelivery",
];

export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "Stripe";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 10;

export const ROLES = ["admin", "user"];

export const PRODUCT_DEFAULT_VALUES = {
  name: "",
  slug: "",
  category: "",
  images: [],
  brand: "",
  description: "",
  price: "0",
  stock: 0,
  rating: "0",
  numReviews: "0",
  isFeatured: false,
  banner: null,
};

export const REVIEW_DEFAULT_VALUES = {
  title: "",
  description: "",
  rating: 0,
};

export const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev";
