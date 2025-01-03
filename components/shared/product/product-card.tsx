import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ProductType } from "@/types";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import ProductPrice from "./product-price";

type Props = {
  product: ProductType;
};

const ProductCard: FC<Props> = ({ product }) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0 items-center">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={300}
            priority
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        <div className="text-xs"> {product.brand}</div>
        <Link href={`/product/${product.slug}`}>
          <h2 className="text-sm font-medium text-nowrap">{product.name}</h2>
        </Link>
        <div className="flex-between gap-4">
          <p>{product.rating} Stars</p>
          {product.stock ? (
            <ProductPrice price={+product.price} />
          ) : (
            <p className="text-red-500">Out of Stock</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
