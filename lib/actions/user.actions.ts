"use server";

import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/db/prisma";
import type { ShippingAddressType } from "@/types";
import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInSchema,
  signUpSchema,
  updateProfileSchema,
  type updateUserSchema,
} from "@/types/validators";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { z } from "zod";
import { PAGE_SIZE } from "../constants";
import { hash } from "../encrypt";
import { formatError } from "../utils";

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", {
      email: user.email,
      password: user.password,
    });

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: "Invalid credentials",
    };
  }
}

export async function signOutUser() {
  await signOut();
}

export async function signUpWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signUpSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const hashedPassword = await hash(user.password);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: user.password,
    });

    return {
      success: true,
      message: "Signed up successfully",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: await formatError(error),
    };
  }
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    ...user,
    role: user.role || "user",
  };
}

export async function updateUserShippingAddress(address: ShippingAddressType) {
  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not found");
  }

  const addressSchema = shippingAddressSchema.parse(address);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { address: addressSchema },
    });

    return { success: true, message: "Shipping address updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findUnique({
      where: { id: session?.user?.id },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return { success: true, message: "Payment method updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

export async function updateUserProfile(
  user: z.infer<typeof updateProfileSchema>
) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error("User not found");

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: user.name,
      },
    });

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

// Get all the users
export async function getAllUsers({
  page,
  query,
}: {
  page: number;
  query?: string;
}) {
  const where: Prisma.UserWhereInput = {};

  if (query) {
    where.name = {
      contains: query,
      mode: "insensitive",
    };
  }

  const data = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const dataCount = await prisma.user.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / PAGE_SIZE),
  };
}

// delete user
export async function deleteUser(userId: string) {
  try {
    const session = await auth();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    await prisma.user.delete({
      where: { id: userId },
    });

    // delete user's cart
    await prisma.cart.deleteMany({
      where: { userId: userId },
    });

    // log user out if current user
    if (session?.user?.id === userId) {
      await signOut();
    }

    // delete user's session
    await prisma.session.deleteMany({
      where: { userId: userId },
    });

    revalidatePath("/admin/users");

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

// update user
export async function updateUser(
  userId: string,
  data: z.infer<typeof updateUserSchema>
) {
  try {
    const user = await getUserById(userId);

    if (!user) throw new Error("User not found");

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });

    revalidatePath("/admin/users");

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}
