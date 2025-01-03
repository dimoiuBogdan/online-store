"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
};

const ProductImages = ({ images }: Props) => {
  const [currentImage, setCurrentImage] = useState(images[0]);

  const handleImageClick = (image: string) => {
    setCurrentImage(image);
  };

  return (
    <div className="flex flex-col gap-3">
      <Image src={currentImage} alt="product image" width={800} height={800} />
      <div className="flex gap-2">
        {images.map((image) => (
          <Image
            key={image}
            src={image}
            alt="product image"
            width={80}
            height={80}
            className="rounded-md cursor-pointer"
            onClick={() => handleImageClick(image)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
