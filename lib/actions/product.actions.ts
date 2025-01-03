"use server";

import { prisma } from "@/db/prisma";
import { LIMIT_PRODUCTS } from "@/lib/constants";
import { prismaToJsObject } from "../utils";

// get latest products
export async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: LIMIT_PRODUCTS,
    orderBy: {
      createdAt: "desc",
    },
  });

  return prismaToJsObject(products);
}

// get product by slug
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug },
  });

  return prismaToJsObject(product);
}
