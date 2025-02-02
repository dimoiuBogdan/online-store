"use server";

import { prisma } from "@/db/prisma";
import { insertProductSchema, updateProductSchema } from "@/types/validators";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { PAGE_SIZE } from "../constants";
import { formatError, prismaToJsObject } from "../utils";

// get latest products
export async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: PAGE_SIZE,
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

// get product by id
export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id },
  });

  return prismaToJsObject(product);
}

// Get all products
export async function getProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  // Category filter
  const categoryFilter = category && category !== "all" ? { category } : {};

  // Price filter
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]) || undefined,
          },
        }
      : {};

  // Rating filter
  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
        ? { price: "desc" }
        : sort === "rating"
        ? { rating: "desc" }
        : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count();

  return {
    products: prismaToJsObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete product
export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}

// create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);

    await prisma.product.create({
      data: product,
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product created successfully" };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}

// update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);

    const productExists = await prisma.product.findUnique({
      where: { id: product.id },
    });

    if (!productExists) {
      return { success: false, message: "Product not found" };
    }

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}

// get all categories
export async function getAllCategories() {
  const categories = await prisma.product.groupBy({
    by: ["category"],
    _count: {
      category: true,
    },
  });

  return prismaToJsObject(categories);
}

// get featured products
export async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return prismaToJsObject(products);
}
