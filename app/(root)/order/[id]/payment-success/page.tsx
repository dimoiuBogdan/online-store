import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";
import { Link } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PaymentSuccessPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_intent: string }>;
}) => {
  const { id } = await params;
  const { payment_intent } = await searchParams;

  const order = await getOrderById(id);

  if (!order) {
    return notFound();
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

  if (
    paymentIntent.metadata?.orderId === null ||
    paymentIntent.metadata?.orderId !== order.id.toString()
  ) {
    return notFound();
  }

  const isSuccess = paymentIntent.status === "succeeded";

  if (!isSuccess) {
    return redirect(`/order/${id}`);
  }

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="h1-bold">Thanks for your purchase</h1>
        <p className="text-center text-sm text-muted-foreground">
          Your order has been placed successfully.
        </p>
        <Button asChild>
          <Link href={`/order/${id}`}>View order</Link>
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
