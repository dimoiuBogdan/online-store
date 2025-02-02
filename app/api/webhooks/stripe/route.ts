import { updateOrderToPaid } from "@/lib/actions/order.actions";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const event = await Stripe.webhooks.constructEventAsync(
    await request.text(),
    request.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  switch (event.type) {
    // Check for a successful payment
    case "charge.succeeded": {
      const { object } = event.data;

      await updateOrderToPaid(object.metadata.orderId, {
        id: object.id,
        status: "COMPLETED",
        email_address: object.billing_details.email as string,
        price_paid: (object.amount / 100).toString(),
      });

      return NextResponse.json({
        success: true,
        message: "Order paid successfully",
      });
    }

    default:
      return NextResponse.json({
        success: false,
        message: "Unhandled event type",
      });
  }
}
