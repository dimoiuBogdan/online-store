import type { CartItemType } from "@/types";
import { clsx, type ClassValue } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// convert prisma object to regular js object
export function prismaToJsObject<T>(prismaObject: T): T {
  return JSON.parse(JSON.stringify(prismaObject));
}

// format number with decimal places
export function formatNumberWithDecimalPlaces(number: number): string {
  const [integer, decimal] = number.toString().split(".");

  return decimal ? `${integer}.${decimal.padEnd(2, "0")}` : `${integer}.00`;
}

export async function formatError(error: any): Promise<string> {
  if (error.name === "ZodError") {
    const fieldErrors = Object.keys(error.errors).map((field) => {
      return error.errors[field].message;
    });

    return fieldErrors.join("\n ");
  }

  if (error.name === "PrismaClientValidationError" && error.code === "P2002") {
    const field: string = error.meta.target ? error.meta.target[0] : "Field";

    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  return typeof error.message === "string"
    ? error.message
    : JSON.stringify(error.message);
}

export function round2(number: number | string): number {
  return Math.round((Number(number) + Number.EPSILON) * 100) / 100;
}

export const calculateCartPrice = (items: CartItemType[]) => {
  const itemsPrice = items.reduce((acc, item) => {
    return acc + +item.price * +item.qty;
  }, 0);

  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export const generateUuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
};

export const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export const formatCurrency = (amount: number | string) => {
  return CURRENCY_FORMATTER.format(+amount);
};

// shorten UUID
export const shortenUuid = (uuid: string) => {
  return `..${uuid.substring(uuid.length - 6)}`;
};

// Format date and times
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// Form the pagination links
export function formURLQuery(params: string, key: string, value: string) {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl(
    { url: window.location.href, query },
    { skipNull: true }
  );
}

export const formatNumber = (number: number) => {
  return new Intl.NumberFormat("en-US").format(number);
};
