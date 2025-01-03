import { cn } from "@/lib/utils";
import type { FC } from "react";

type Props = {
  price: number;
  className?: string;
};

const ProductPrice: FC<Props> = ({ price, className }) => {
  const stringValue = price.toString();

  const [intValue, decimalValue] = stringValue.split(".");

  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">$</span>
      {intValue}
      <span className="text-xs align-super">.{decimalValue}</span>
    </p>
  );
};

export default ProductPrice;
