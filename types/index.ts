import type { z } from "zod";
import type {
  cartItemSchema,
  insertCartSchema,
  insertOrderItemSchema,
  insertOrderSchema,
  insertProductSchema,
  insertReviewSchema,
  paymentResultSchema,
  shippingAddressSchema,
} from "./validators";

export type ProductType = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  numReviews: number;
  createdAt: Date;
};

export type CartType = z.infer<typeof insertCartSchema>;

export type CartItemType = z.infer<typeof cartItemSchema>;

export type OrderItemType = z.infer<typeof insertOrderItemSchema>;

export type OrderType = z.infer<typeof insertOrderSchema> & {
  id: string;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderItems: OrderItemType[];
  user: { name: string; email: string };
};

export type ShippingAddressType = z.infer<typeof shippingAddressSchema>;

export type PaymentResultType = z.infer<typeof paymentResultSchema>;

export type ReviewType = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user?: { name: string };
};
