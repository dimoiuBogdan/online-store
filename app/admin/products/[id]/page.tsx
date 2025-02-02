import ProductForm from "@/components/admin/product-form";
import { getProductById } from "@/lib/actions/product.actions";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Product Update",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const AdminProductUpdatePage = async ({ params }: Props) => {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    return notFound();
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold text-dark-200">Update Product</h1>
      <ProductForm type="update" productId={product.id} product={product} />
    </div>
  );
};

export default AdminProductUpdatePage;
