import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import type { ShippingAddressType } from "@/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import OrderDetailsTable from "./order-details-table";

export const metadata: Metadata = {
  title: "Order Details",
  description: "Order Details",
};

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  const order = await getOrderById(id);

  if (!order) {
    return notFound();
  }

  const session = await auth();

  let client_secret = null;

  // Check if the order is not paid and payment method is stripe
  if (!order.isPaid && order.paymentMethod === "Stripe") {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalPrice * 100,
      currency: "usd",
      metadata: {
        orderId: order.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    client_secret = paymentIntent.client_secret;
  }

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddressType,
      }}
      stripeClientSecret={client_secret}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      isAdmin={session?.user?.role === "admin"}
    />
  );
};

export default OrderDetailsPage;
