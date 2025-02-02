import { auth } from "@/auth";
import { CheckoutSteps } from "@/components/shared/checkout-steps";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import type { ShippingAddressType } from "@/types";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ShippingAddressForm from "./shipping-address-form";

export const metadata: Metadata = {
  title: "Shipping Address",
  description: "Shipping Address",
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) {
    return redirect("/cart");
  }

  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) {
    return redirect(`/sign-in?callbackUrl=${encodeURIComponent("/cart")}`);
  }

  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps currentStep={1} />
      <ShippingAddressForm address={user?.address as ShippingAddressType} />
    </>
  );
};

export default ShippingAddressPage;
