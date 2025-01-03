"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="flex-center h-screen flex-col gap-y-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <Button variant="outline">
        <Link href="/">Go to Home</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
