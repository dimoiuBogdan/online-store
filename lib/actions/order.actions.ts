"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { sendPurchaseReceipt } from "@/email";
import type { PaymentResultType, ShippingAddressType } from "@/types";
import { insertOrderSchema } from "@/types/validators";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { PAGE_SIZE } from "../constants";
import { paypal } from "../paypal";
import { formatError, prismaToJsObject } from "../utils";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";

// Create Order

export const createOrder = async () => {
  try {
    const session = await auth();

    if (!session) {
      throw new Error("User not authenticated");
    }

    const cart = await getMyCart();
    const userId = session.user?.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: "Address is required",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "Payment method is required",
        redirectTo: "/payment-method",
      };
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // create order
      const insertedOrder = await tx.order.create({
        data: {
          ...order,
        },
      });

      // create order items
      const orderItems = await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: insertedOrder.id,
          ...item,
        })),
      });

      // clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
          shippingPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) {
      throw new Error("Failed to create order");
    }

    revalidatePath("/orders");

    return {
      success: true,
      message: "Order created successfully",
      redirectTo: `/order/${insertedOrderId}`,
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
};

// Get Order by id
export const getOrderById = async (id: string) => {
  const order = await prisma.order.findFirst({
    where: { id },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return prismaToJsObject(order);
};

// Create paypal order
export async function createPaypalOrder(orderId: string) {
  try {
    const order = await getOrderById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paypalOrder.id,
          status: paypalOrder.status,
          email_address: order.user.email,
          price_paid: order.totalPrice,
        },
      },
    });

    return {
      success: true,
      message: "Order created successfully",
      data: paypalOrder.id,
    };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

// Approve paypal order and update to paid
export async function approvePaypalOrder(
  orderId: string,
  paypalOrderId: string
) {
  try {
    const order = await getOrderById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.isPaid) {
      throw new Error("Order already paid");
    }

    const paypalOrder = await paypal.capturePayment(paypalOrderId);

    if (
      !paypalOrder ||
      paypalOrder.id !== (order.paymentResult as PaymentResultType).id ||
      paypalOrder.status !== "COMPLETED"
    ) {
      throw new Error("Error in PayPal payment");
    }

    await updateOrderToPaid(orderId, {
      id: paypalOrder.id,
      status: paypalOrder.status,
      email_address: paypalOrder.payer.email_address,
      price_paid:
        paypalOrder.purchase_units[0]?.payments?.captures[0]?.amount?.value,
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Order approved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

// update order to paid
export async function updateOrderToPaid(
  orderId: string,
  paymentResult?: PaymentResultType
) {
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.isPaid) {
    throw new Error("Order already paid");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { isPaid: true, paidAt: new Date(), paymentResult },
  });

  // Transaction to update order and stock
  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { isPaid: true, paidAt: new Date(), paymentResult },
    });
  });

  const updatedOrder = await getOrderById(orderId);

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  sendPurchaseReceipt({
    order: {
      ...updatedOrder,
      shippingAddress: updatedOrder.shippingAddress as ShippingAddressType,
      paymentResult: updatedOrder.paymentResult as PaymentResultType,
    },
  });
}

// Get orders by user id
export async function getMyOrders(page: number, limit = PAGE_SIZE) {
  const session = await auth();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const userId = session.user?.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const ordersCount = await prisma.order.count({
    where: { userId },
  });

  return { orders, totalPages: Math.ceil(ordersCount / limit) };
}

export type SalesType = {
  month: string;
  totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummary() {
  // Get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  // Get monthly sales
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesType = salesDataRaw.map((item) => ({
    month: item.month,
    totalSales: Number(item.totalSales),
  }));

  // Get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
    take: 10,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales: totalSales._sum.totalPrice,
    salesData,
    latestSales,
  };
}

// Get all orders
export async function getAllOrders(page: number, query?: string) {
  const where: Prisma.OrderWhereInput = {};

  if (query) {
    where.user = {
      name: { contains: query, mode: "insensitive" },
    };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      user: { select: { name: true } },
    },
  });

  const ordersCount = await prisma.order.count();

  return { orders, totalPages: Math.ceil(ordersCount / PAGE_SIZE) };
}

// Delete an order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });

    revalidatePath("/admin/orders");

    return { success: true, message: "Order deleted successfully" };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}

// Update cash on delivery order to paid
export async function updateCashOnDeliveryOrderToPaid(orderId: string) {
  try {
    await updateOrderToPaid(orderId);

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: "Order updated successfully" };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}

// Update cash on delivery to delivered
export async function deliverOrder(orderId: string) {
  try {
    const order = await getOrderById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (!order.isPaid) {
      throw new Error("Order is not paid");
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { isDelivered: true, deliveredAt: new Date() },
    });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: "Order delivered successfully" };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}
