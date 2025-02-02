import { auth } from "@/auth";
import { CheckoutSteps } from "@/components/shared/checkout-steps";
import { getUserById } from "@/lib/actions/user.actions";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PaymentMethodForm from "./payment-method-form";

export const metadata: Metadata = {
  title: "Payment Method",
  description: "Payment Method Page",
};

const PaymentMethodPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return redirect("/login");
  }

  const currentUser = await getUserById(userId);

  return (
    <>
      <CheckoutSteps currentStep={2} />
      <PaymentMethodForm preferredPaymentMethod={currentUser?.paymentMethod} />
    </>
  );
};

export default PaymentMethodPage;
