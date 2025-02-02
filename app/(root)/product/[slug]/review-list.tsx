"use client";

import Rating from "@/components/shared/product/rating";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getReviews } from "@/lib/actions/review.actions";
import { formatDateTime } from "@/lib/utils";
import type { ReviewType } from "@/types";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewForm from "./review-form";

type Props = {
  userId: string;
  productId: string;
  productSlug: string;
};

const ReviewList = ({ userId, productId, productSlug }: Props) => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);

  const refetchReviews = () => {
    setReviews(reviews);
  };

  const fetchReviews = async () => {
    const reviews = await getReviews(productId);
    setReviews(reviews);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet</p>
      ) : userId ? (
        <ReviewForm
          productId={productId}
          userId={userId}
          onSubmit={refetchReviews}
        />
      ) : (
        <div>
          Please{" "}
          <Link
            className="text-blue-700 px-1"
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            sign in
          </Link>{" "}
          to review this product
        </div>
      )}
      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <Card className="p-4" key={review.id}>
            <CardHeader>
              <div className="flex-between">
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <Rating value={review.rating} />
              <div className="flex items-center">
                <User className="mr-1 h-3 w-3" />
                <p>{review.user ? review.user.name : "Deleted User"}</p>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                <p>{formatDateTime(review.createdAt).dateOnly}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
