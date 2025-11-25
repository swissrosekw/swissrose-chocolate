import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "./StarRating";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ThumbsUp, User, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
  review_responses: Array<{
    response: string;
    created_at: string;
  }>;
  user_voted?: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [productId, filterRating, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase
      .from("product_reviews")
      .select(`
        *,
        profiles(full_name),
        review_responses(response, created_at)
      `)
      .eq("product_id", productId)
      .eq("is_approved", true);

    if (filterRating) {
      query = query.eq("rating", filterRating);
    }

    query = query.order(
      sortBy === "recent" ? "created_at" : "helpful_count",
      { ascending: false }
    );

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } else {
      // Check if user has voted on each review
      if (user) {
        const reviewsWithVotes = await Promise.all(
          data.map(async (review) => {
            const { data: voteData } = await supabase
              .from("review_helpful_votes")
              .select("id")
              .eq("review_id", review.id)
              .eq("user_id", user.id)
              .maybeSingle();

            return { ...review, user_voted: !!voteData };
          })
        );
        setReviews(reviewsWithVotes);
      } else {
        setReviews(data);
      }
    }
    setLoading(false);
  };

  const handleHelpfulVote = async (reviewId: string, hasVoted: boolean) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    if (hasVoted) {
      const { error } = await supabase
        .from("review_helpful_votes")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", user.id);

      if (error) {
        toast.error("Failed to remove vote");
      } else {
        toast.success("Vote removed");
        fetchReviews();
      }
    } else {
      const { error } = await supabase
        .from("review_helpful_votes")
        .insert({ review_id: reviewId, user_id: user.id });

      if (error) {
        toast.error("Failed to vote");
      } else {
        toast.success("Marked as helpful");
        fetchReviews();
      }
    }
  };

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <StarRating rating={averageRating} size="lg" />
              <div className="text-sm text-muted-foreground mt-1">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={filterRating === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(null)}
            >
              All
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filterRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRating(rating)}
              >
                {rating} <Star className="h-3 w-3 ml-1" />
              </Button>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("recent")}
            >
              Most Recent
            </Button>
            <Button
              variant={sortBy === "helpful" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("helpful")}
            >
              Most Helpful
            </Button>
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {review.profiles?.full_name || "Anonymous"}
                          </span>
                          {review.is_verified_purchase && (
                            <Badge variant="secondary">Verified Purchase</Badge>
                          )}
                        </div>
                        <StarRating rating={review.rating} size="sm" className="mb-2" />
                        <h4 className="font-semibold mb-1">{review.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>

                        {review.pros && review.pros.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-semibold text-green-600">Pros:</span>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {review.pros.map((pro, idx) => (
                                <li key={idx}>{pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {review.cons && review.cons.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-semibold text-red-600">Cons:</span>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {review.cons.map((con, idx) => (
                                <li key={idx}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHelpfulVote(review.id, review.user_voted || false)}
                          >
                            <ThumbsUp
                              className={`h-4 w-4 mr-1 ${
                                review.user_voted ? "fill-primary" : ""
                              }`}
                            />
                            Helpful ({review.helpful_count})
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {review.review_responses && review.review_responses.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-primary">
                            <div className="text-sm font-semibold mb-1">
                              Response from Swiss Rose:
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {review.review_responses[0].response}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
