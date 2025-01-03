export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Udemy Store";

export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Udemy Store Project by Next.js 15";

export const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

export const LIMIT_PRODUCTS =
  Number(process.env.NEXT_PUBLIC_LIMIT_PRODUCTS) || 4;
