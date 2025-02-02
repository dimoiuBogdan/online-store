import { auth } from "@/auth";
import AddToCart from "@/components/shared/product/add-to-cart";
import ProductImages from "@/components/shared/product/product-images";
import ProductPrice from "@/components/shared/product/product-price";
import Rating from "@/components/shared/product/rating";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ReviewList from "./review-list";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;

  const cart = await getMyCart();

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="col-span-2">
            <ProductImages images={product.images} />
          </div>
          <div className="col-span-2">
            <div className="col-span-2 p-5">
              <div className="flex flex-col gap-6">
                <p>
                  {product.brand} {product.category}
                </p>
                <h1 className="h3-bold">{product.name}</h1>
                <Rating value={product.rating} />
                <p>{product.numReviews} Reviews</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ProductPrice
                    price={Number(product.price)}
                    className="text-green-700 px-5 py-2 bg-green-100 rounded-full"
                  />
                </div>
              </div>
              <div className="mt-10">
                <p className="font-semibold">Description</p>
                <div>{product.description}</div>
              </div>
            </div>
          </div>
          <div>
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex justify-between">
                  <div>Price</div>
                  <div>
                    <ProductPrice price={Number(product.price)} />
                  </div>
                </div>
                <div className="mb-2 flex justify-between">
                  <div>Status</div>
                  {product.stock > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700"
                    >
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
                {product.stock > 0 && (
                  <AddToCart
                    cart={cart}
                    item={{
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      qty: 1,
                      image: product.images[0],
                      slug: product.slug,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section>
        <h2 className="h2-bold">Customer Reviews</h2>
        <ReviewList
          userId={userId || ""}
          productId={product.id}
          productSlug={product.slug}
        />
      </section>
    </>
  );
};

export default ProductDetailsPage;
