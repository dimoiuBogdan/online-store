import { APP_NAME, SENDER_EMAIL } from "@/lib/constants";
import type { OrderType } from "@/types";
import { Resend } from "resend";
import PurchaseReceipt from "./purchase-receipt";
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPurchaseReceipt = async ({ order }: { order: OrderType }) => {
  const { data, error } = await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Purchase Receipt for ${order.id}`,
    react: <PurchaseReceipt order={order} />,
  });

  if (error) {
    console.error(error);
    throw new Error("Failed to send email");
  }

  return data;
};
