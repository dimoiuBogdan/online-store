"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "../ui/input";

const AdminSearch = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const formActionUrl = pathname.includes("/admin/users")
    ? "/admin/users"
    : pathname.includes("/admin/orders")
    ? "/admin/orders"
    : "/admin/products";

  const [queryValue, setQueryValue] = useState(searchParams.get("query") || "");

  return (
    <form action={formActionUrl} method="GET">
      <Input
        type="search"
        name="query"
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        placeholder="Search..."
        className="md:w-[100px] lg:w-[300px]"
      />
      <button className="sr-only" type="submit">
        Search
      </button>
    </form>
  );
};

export default AdminSearch;
