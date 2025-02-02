"use client";

import { Badge } from "@/components/ui/badge";
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
import {
  approvePaypalOrder,
  createPaypalOrder,
  deliverOrder,
  updateCashOnDeliveryOrderToPaid,
} from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, shortenUuid } from "@/lib/utils";
import type { OrderType } from "@/types";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import StripePayment from "./stripe-payment";

type Props = {
  order: OrderType;
  paypalClientId: string;
  isAdmin: boolean;
  stripeClientSecret: string | null;
};

const OrderDetailsTable = ({
  order,
  paypalClientId,
  stripeClientSecret,
  isAdmin,
}: Props) => {
  const { toast } = useToast();

  const {
    isDelivered,
    isPaid,
    itemsPrice,
    orderItems,
    paymentMethod,
    shippingAddress,
    shippingPrice,
    taxPrice,
    totalPrice,
    paidAt,
    deliveredAt,
  } = order;

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    return isPending ? (
      <div>Loading PayPal...</div>
    ) : isRejected ? (
      <div>Error loading PayPal</div>
    ) : null;
  };

  const handleCreatePaypalOrder = async () => {
    const response = await createPaypalOrder(order.id);

    if (!response.success) {
      toast({
        title: "Error creating PayPal order",
        description: response.message,
        variant: "destructive",
      });
    }

    return response.data;
  };

  const handleApprovePaypalOrder = async (paypalOrderId: string) => {
    const response = await approvePaypalOrder(order.id, paypalOrderId);

    if (!response.success) {
      toast({
        title: "Error capturing payment",
        description: response.message,
        variant: "destructive",
      });
    }

    toast({
      title: "Payment captured successfully",
      description: "Order has been updated to paid",
    });
  };

  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleMarkAsPaid = async () => {
      startTransition(async () => {
        const response = await updateCashOnDeliveryOrderToPaid(order.id);

        if (!response.success) {
          toast({
            title: "Error marking order as paid",
            description: response.message,
            variant: "destructive",
          });

          return;
        }

        toast({
          title: "Order marked as paid",
          description: "Order has been updated to paid",
        });
      });
    };

    return (
      <Button type="button" disabled={isPending} onClick={handleMarkAsPaid}>
        {isPending ? "Marking as Paid..." : "Mark as Paid"}
      </Button>
    );
  };

  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleMarkAsDelivered = async () => {
      startTransition(async () => {
        const response = await deliverOrder(order.id);

        if (!response.success) {
          toast({
            title: "Error marking order as delivered",
            description: response.message,
            variant: "destructive",
          });

          return;
        }

        toast({
          title: "Order marked as delivered",
          description: "Order has been updated to delivered",
        });
      });
    };

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={handleMarkAsDelivered}
      >
        {isPending ? "Marking as Delivered..." : "Mark as Delivered"}
      </Button>
    );
  };

  return (
    <>
      <h1 className="py-4 text-2xl">Order {shortenUuid(order.id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-y-4 overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not Paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.streetAddress}, {shippingAddress.city},
                {shippingAddress.postalCode} {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not Delivered</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
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
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{item.qty}</TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(+item.price * +item.qty)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>

              {/* Paypal Payment */}
              {!isPaid && order.paymentMethod === "Paypal" && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />

                    <PayPalButtons
                      createOrder={handleCreatePaypalOrder}
                      onApprove={async (data) => {
                        await handleApprovePaypalOrder(data.orderID);
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {/* Stripe Payment */}
              {!isPaid &&
                order.paymentMethod === "Stripe" &&
                stripeClientSecret && (
                  <StripePayment
                    priceInCents={Number(totalPrice) * 100}
                    clientSecret={stripeClientSecret}
                    orderId={order.id}
                  />
                )}

              {/* Cash On Delivery */}
              {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" && (
                <MarkAsPaidButton />
              )}

              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
