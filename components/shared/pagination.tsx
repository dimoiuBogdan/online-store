"use client";

import { formURLQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({ page, totalPages, urlParamName }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (direction: "prev" | "next") => {
    const newPage = direction === "prev" ? Number(page) - 1 : Number(page) + 1;

    const newUrl = formURLQuery(
      searchParams.toString(),
      urlParamName || "page",
      newPage.toString()
    );

    router.push(newUrl);
  };

  return (
    <div className="flex gap-2">
      <Button
        size={"lg"}
        variant="outline"
        className="w-28"
        disabled={Number(page) <= 1}
        onClick={() => handleClick("prev")}
      >
        Previous
      </Button>
      <Button
        size={"lg"}
        variant="outline"
        className="w-28"
        disabled={Number(page) >= totalPages}
        onClick={() => handleClick("next")}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
