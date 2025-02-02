"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formURLQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { name: "Newest", value: "newest" },
  { name: "Highest price", value: "highest" },
  { name: "Lowest price", value: "lowest" },
  { name: "Best rating", value: "rating" },
];

const SortingOptions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const newUrl = formURLQuery(searchParams.toString(), "sort", value);

    router.replace(newUrl);
  };

  return (
    <Select onValueChange={handleSortChange} name="sort" defaultValue="newest">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map(({ name, value }) => (
          <SelectItem key={value} value={value}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SortingOptions;
