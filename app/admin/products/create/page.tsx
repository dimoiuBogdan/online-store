import ProductForm from "@/components/admin/product-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Product",
  description: "Create a new product",
};

const CreateProductPage = () => {
  return (
    <>
      <h2 className="h2-bold">Create Product</h2>
      <div className="my-8">
        <ProductForm type="create" />
      </div>
    </>
  );
};

export default CreateProductPage;
