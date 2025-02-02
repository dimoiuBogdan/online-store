import { getMyCart } from "@/lib/actions/cart.actions";
import type { Metadata } from "next";
import CartTable from "./cart-table";

export const metadata: Metadata = {
  title: "Cart",
  description: "Cart page",
};

const CartPage = async () => {
  const cart = await getMyCart();

  if (!cart) {
    return <div>No cart found</div>;
  }

  return <CartTable cart={cart} />;
};

export default CartPage;
