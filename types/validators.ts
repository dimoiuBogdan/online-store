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
    .max(20, "Name must be less than 20 characters"),
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
