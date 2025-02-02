"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import type { CartItemType } from "@/types";
import { cartItemSchema, insertCartSchema } from "@/types/validators";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { calculateCartPrice, formatError, prismaToJsObject } from "../utils";

export async function addItemToCart(data: CartItemType) {
  try {
    // check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("Cart not found");

    const session = await auth();
    const userId = session?.user?.id;

    const cart = await getMyCart();

    const item = cartItemSchema.parse(data);

    const product = await prisma.product.findFirst({
      where: {
        id: item.productId,
      },
    });

    if (!product) throw new Error("Product not found");

    if (!cart) {
      const newCart = {
        userId,
        items: [item],
        sessionCartId,
        ...calculateCartPrice([item]),
      };

      insertCartSchema.parse(newCart);

      await prisma.cart.create({
        data: newCart,
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${item.name} added to cart`,
      };
    } else {
      // check if item already exists in cart
      const existingItem = cart.items.find(
        (x) => x.productId === item.productId
      );

      if (existingItem) {
        if (product.stock < existingItem.qty + 1) {
          throw new Error("Not enough stock");
        }

        existingItem.qty += 1;
      } else {
        // check stock
        if (product.stock < 1) {
          throw new Error("Not enough stock");
        }

        cart.items.push(item);
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calculateCartPrice(cart.items),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: existingItem
          ? `${existingItem.name} quantity increased`
          : `${item.name} added to cart`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;

  if (!sessionCartId) throw new Error("Cart not found");

  const session = await auth();
  const userId = session?.user?.id;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId },
  });

  if (!cart) return undefined;

  return prismaToJsObject({
    ...cart,
    items: cart.items as CartItemType[],
    itemsPrice: cart.itemsPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    const cart = await getMyCart();

    if (!cart) return;

    const item = cart.items.find((x) => x.productId === productId);

    if (!item) throw new Error("Item not found");

    if (item.qty > 1) {
      item.qty -= 1;
    } else {
      cart.items = cart.items.filter((x) => x.productId !== productId);
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calculateCartPrice(cart.items),
      },
    });

    revalidatePath("/cart");
    revalidatePath(`/product/${item.slug}`);

    return {
      success: true,
      message: `${item.name} removed from cart`,
    };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}
