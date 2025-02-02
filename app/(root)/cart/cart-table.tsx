"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { formatCurrency } from "@/lib/utils";
import type { CartItemType, CartType } from "@/types";
import { ArrowRightIcon, Loader2, MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  cart: CartType;
};

const CartTable = ({ cart }: Props) => {
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const handleRemoveItem = (productId: string) => {
    startTransition(async () => {
      const response = await removeItemFromCart(productId);

      if (response?.success) {
        toast({
          title: "Item removed from cart",
          description: "Item has been removed from your cart",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
        });
      }
    });
  };

  const handleAddItem = (item: CartItemType) => {
    startTransition(async () => {
      const response = await addItemToCart(item);

      if (response?.success) {
        toast({
          title: "Item added to cart",
          description: "Item has been added to your cart",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
        });
      }
    });
  };

  return (
    <div>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          <p>
            No items in cart <Link href="/">Go Shopping</Link>
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="w-10 h-10 object-cover"
                        />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">{item.price}</TableCell>
                    <TableCell className="text-center flex items-center justify-center gap-2">
                      <Button
                        disabled={isPending}
                        onClick={() => handleRemoveItem(item.productId)}
                        variant="outline"
                        type="button"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span className="text-center px-1">{item.qty}</span>
                      )}
                      <Button
                        disabled={isPending}
                        onClick={() => handleAddItem(item)}
                        variant="outline"
                        type="button"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center"></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card className="h-fit">
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                Subtotal ({cart.items.length}):{" "}
                <span className="text-xl font-semibold">
                  {formatCurrency(
                    cart.items.reduce(
                      (acc, item) => acc + +item.price * +item.qty,
                      0
                    )
                  )}
                </span>
              </div>
              <Button
                className="w-full"
                disabled={isPending || cart.items.length === 0}
                onClick={() => router.push("/shipping-address")}
              >
                Proceed to Shipping{" "}
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4" />
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CartTable;
