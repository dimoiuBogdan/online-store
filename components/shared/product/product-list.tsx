import { PAGE_SIZE } from "@/lib/constants";
import type { ProductType } from "@/types";
import type { FC } from "react";
import ProductCard from "./product-card";

type Props = {
  data: ProductType[];
  title: string;
  limit?: number;
};

const ProductList: FC<Props> = ({ data, title, limit = PAGE_SIZE }) => {
  const limitedData = data.slice(0, limit);

  return (
    <div className="my-10">
      <h2 className="h2-bold mb-4">{title}</h2>
      <div className="flex flex-wrap gap-4">
        {limitedData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {limitedData.map((product: ProductType) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div>No products found</div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
