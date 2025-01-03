import type { z } from "zod";
import type { insertProductSchema } from "./validators";

export type ProductType = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};
