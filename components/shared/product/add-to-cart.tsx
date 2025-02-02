"use client";

import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import type { CartItemType, CartType } from "@/types";
import { Loader2, MinusIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  item: CartItemType;
  cart?: CartType;
};

const AddToCart = ({ item, cart }: Props) => {
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const isItemInCart = cart?.items.find(
    (cartItem) => cartItem.productId === item.productId
  );

  const handleAddToCart = async () => {
    startTransition(async () => {
      const response = await addItemToCart(item);

      if (response?.success) {
        toast({
          title: "Cart Updated",
          description: response.message,
          action: (
            <ToastAction
              altText="View Cart"
              className="bg-primary text-sm min-w-fit p-2 rounded-md shadow-sm text-white hover:bg-gray-800"
              onClick={() => router.push("/cart")}
            >
              Go to Cart
            </ToastAction>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Something went wrong",
          variant: "destructive",
        });
      }
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const response = await removeItemFromCart(item.productId);

      if (response?.success) {
        toast({
          title: "Item Removed",
          description: response.message,
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {isItemInCart ? (
        <div className="flex-center gap-4">
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={handleRemoveFromCart}
          >
            <MinusIcon className="w-2 h-2" />
          </Button>
          <div className="text-sm">
            {isPending ? (
              <Loader2 className="w-2 h-2 animate-spin" />
            ) : (
              isItemInCart.qty
            )}
          </div>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={handleAddToCart}
          >
            <PlusIcon className="w-2 h-2" />
          </Button>
        </div>
      ) : (
        <Button className="w-full mt-2" type="button" onClick={handleAddToCart}>
          {isPending ? (
            <Loader2 className="w-2 h-2 animate-spin" />
          ) : (
            <PlusIcon className="w-2 h-2" />
          )}
          Add to Cart
        </Button>
      )}
    </div>
  );
};

export default AddToCart;
