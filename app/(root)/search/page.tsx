import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllCategories, getProducts } from "@/lib/actions/product.actions";
import { cn } from "@/lib/utils";

import Link from "next/link";
import SortingOptions from "./sorting-options";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
  }>;
}) {
  const { query } = await searchParams;

  return {
    title: query ? `Search for "${query}"` : "Search for products",
    description: "Search for products",
  };
}

const PRICE_RANGES = [
  {
    name: "All",
    value: "all",
  },
  {
    name: "$1 - $100",
    value: "1-100",
  },
  {
    name: "$100 - $200",
    value: "100-200",
  },
  {
    name: "$200 - $300",
    value: "200-300",
  },
  {
    name: "$300 - $400",
    value: "300-400",
  },
  {
    name: "More than $400",
    value: "400-",
  },
];

const RATINGS = [
  {
    name: "All",
    value: "all",
  },
  {
    name: "4 Stars and above",
    value: "4",
  },
  {
    name: "3 Stars and above",
    value: "3",
  },
  {
    name: "2 Stars and above",
    value: "2",
  },
  {
    name: "1 Star and above",
    value: "1",
  },
];

const SORT_OPTIONS = [
  {
    name: "Newest",
    value: "newest",
  },
  {
    name: "Lowest price",
    value: "lowest",
  },
  {
    name: "Highest price",
    value: "highest",
  },
  {
    name: "Best rating",
    value: "rating",
  },
];

const SearchPage = async (props: {
  searchParams: Promise<{
    query?: string;
    category?: string;
    page?: string;
    price?: string;
    rating?: string;
    sort?: string;
  }>;
}) => {
  const {
    query,
    category,
    page = "1",
    price,
    rating,
    sort = "newest",
  } = await props.searchParams;

  const { products } = await getProducts({
    query: query || "",
    category: category || "all",
    page: Number(page),
    rating: rating || "",
    sort,
    price: price || "",
  });

  const categories = await getAllCategories();

  const hasAppliedFilters =
    category !== "all" || price !== "" || rating !== "" || sort !== "newest";

  const getFilterUrl = (
    category?: string,
    sort?: string,
    price?: string,
    rating?: string,
    page?: string
  ) => {
    const params = {
      query: query || "",
      category: category || "all",
      page: page || "1",
      price: price || "",
      rating: rating || "",
      sort: sort || "newest",
    };

    let url = "/search?";

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url += `${key}=${value}&`;
      }
    });

    return url;
  };

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div>
        <div className="text-xl mb-2 mt-3">Category</div>
        <div className="space-y-1 flex flex-col">
          <Link
            href={getFilterUrl(undefined, sort, price, rating, page)}
            className={cn(
              "text-sm hover:text-primary transition-colors duration-300",
              category === "all" || !category ? "font-medium" : ""
            )}
          >
            All
          </Link>
          {categories.map(({ category: c }) => (
            <Link
              href={getFilterUrl(c, sort, price, rating, page)}
              key={c}
              className={cn(
                "text-sm hover:text-primary transition-colors duration-300",
                c === category ? "font-medium" : ""
              )}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="text-xl mb-2 mt-3">Price</div>
        <div className="space-y-1 flex flex-col">
          {PRICE_RANGES.map(({ name, value }) => (
            <Link
              href={getFilterUrl(category, sort, value, rating, page)}
              key={value}
              className={cn(
                "text-sm hover:text-primary transition-colors duration-300",
                value === price ? "font-medium" : ""
              )}
            >
              {name}
            </Link>
          ))}
        </div>
        <div className="text-xl mb-2 mt-3">Rating</div>
        <div className="space-y-1 flex flex-col">
          {RATINGS.map(({ name, value }) => (
            <Link
              href={getFilterUrl(category, sort, price, value, page)}
              key={value}
              className={cn(
                "text-sm hover:text-primary transition-colors duration-300",
                value === rating ? "font-medium" : ""
              )}
            >
              {name}
            </Link>
          ))}
        </div>
        {hasAppliedFilters && (
          <Button variant="secondary" className="w-full mt-4" asChild>
            <Link href="/search">Clear filters</Link>
          </Button>
        )}
      </div>
      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col md:flex-row my-4">
          <div className="flex items-center justify-between w-full">
            <div>
              {query ? `Search results for "${query}"` : "All products"} (
              {products.length})
            </div>
            <div>
              <SortingOptions />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
