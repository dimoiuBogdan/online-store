import { clsx, type ClassValue } from "clsx";
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
