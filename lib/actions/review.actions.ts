"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { insertReviewSchema } from "@/types/validators";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { formatError } from "../utils";

export const createUpdateReview = async (
  data: z.infer<typeof insertReviewSchema>
) => {
  try {
    const session = await auth();

    if (!session) {
      throw new Error("user is not authenticated");
    }

    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    const product = await prisma.product.findFirst({
      where: {
        id: review.productId,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // check if user already has a review for this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId: review.productId,
      },
    });

    await prisma.$transaction(async (tx) => {
      if (existingReview) {
        await tx.review.update({
          where: { id: existingReview.id },
          data: review,
        });
      } else {
        await tx.review.create({
          data: review,
        });
      }

      // get average rating for the product
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      const numberOfReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating ?? 0,
          numReviews: numberOfReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: "Review created/updated successfully" };
  } catch (error) {
    console.error(error);

    return { success: false, message: await formatError(error) };
  }
};

export const getReviews = async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
};

export const getReviewByProductIdAndUserId = async (productId: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const review = await prisma.review.findFirst({
    where: { productId, userId: session.user.id },
  });

  return review;
};
