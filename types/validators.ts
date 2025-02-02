import { PAYMENT_METHODS } from "@/lib/constants";
import { formatNumberWithDecimalPlaces } from "@/lib/utils";
import { z } from "zod";

export const currencySchema = z
  .string()
  .refine(
    (value) =>
      /^\d+(\.\d{2})?$/.test(formatNumberWithDecimalPlaces(Number(value))),
    "Price must be a number with up to 2 decimal places"
  );

export const insertProductSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  price: currencySchema,
  brand: z.string().min(3, "Brand must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  stock: z.coerce.number(),
  category: z.string().min(3, "Category must be at least 3 characters"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  price: currencySchema,
  qty: z.number().int().min(1, "Quantity is required"),
  image: z.string().min(1, "Image is required"),
  slug: z.string().min(1, "Slug is required"),
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  totalPrice: currencySchema,
  itemsPrice: currencySchema,
  taxPrice: currencySchema,
  shippingPrice: currencySchema,
  sessionCartId: z.string().min(1, "Session cart ID is required"),
  userId: z.string().nullable().optional(),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  streetAddress: z
    .string()
    .min(3, "Street address must be at least 3 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(3, "Country must be at least 3 characters"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    message: "Invalid payment method",
    path: ["type"],
  });

// schema for inserting order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  itemsPrice: currencySchema,
  shippingPrice: currencySchema,
  taxPrice: currencySchema,
  totalPrice: currencySchema,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
    path: ["paymentMethod"],
  }),
  shippingAddress: shippingAddressSchema,
});

// schema for inserting order item
export const insertOrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  price: currencySchema,
  image: z.string().min(1, "Image is required"),
  qty: z.number().int().min(1, "Quantity is required"),
});

export const paymentResultSchema = z.object({
  id: z.string().min(1, "ID is required"),
  status: z.string().min(1, "Status is required"),
  email_address: z.string().email("Invalid email address"),
  price_paid: z.string(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

// schema for updating product
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, "ID is required"),
});

// schema to update user
export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, "ID is required"),
  role: z.string().min(1, "Role is required"),
});

// schema to insert reviews
export const insertReviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  productId: z.string().min(1, "Product ID is required"),
  userId: z.string().min(1, "User ID is required"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating is required")
    .max(5, "Rating must be less than 5"),
});
