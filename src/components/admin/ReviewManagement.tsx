import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/StarRating";
import { toast } from "sonner";
import { Check, X, MessageSquare, Eye } from "lucide-react";

interface Review {
  id: string;
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  is_approved: boolean;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  profiles: { full_name: string | null } | null;
  products: { name: string } | null;
  review_responses: Array<{ response: string; created_at: string }>;
}

export const ReviewManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase
      .from("product_reviews")
      .select(`
        *,
        profiles(full_name),
        products(name),
        review_responses(response, created_at)
      `)
      .order("created_at", { ascending: false });

    if (filter === "pending") {
      query = query.eq("is_approved", false);
    } else if (filter === "approved") {
      query = query.eq("is_approved", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const updateReviewStatus = async (reviewId: string, isApproved: boolean) => {
    const { error } = await supabase
      .from("product_reviews")
      .update({ is_approved: isApproved })
      .eq("id", reviewId);

    if (error) {
      toast.error("Failed to update review");
    } else {
      toast.success(isApproved ? "Review approved" : "Review rejected");
      fetchReviews();
    }
  };

  const submitResponse = async () => {
    if (!selectedReview || !response.trim()) return;

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("review_responses").insert({
      review_id: selectedReview.id,
      admin_id: user.id,
      response: response.trim(),
    });

    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit response");
    } else {
      toast.success("Response added successfully");
      setResponse("");
      setSelectedReview(null);
      fetchReviews();
    }
  };

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => !r.is_approved).length,
    approved: reviews.filter((r) => r.is_approved).length,
    averageRating: reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating} ⭐</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Review Management</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
              >
                Pending ({stats.pending})
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("approved")}
              >
                Approved
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.products?.name}
                    </TableCell>
                    <TableCell>
                      {review.profiles?.full_name || "Anonymous"}
                      {review.is_verified_purchase && (
                        <Badge variant="secondary" className="ml-2">
                          Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} size="sm" />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-semibold text-sm">{review.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {review.comment}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.is_approved ? "default" : "secondary"}>
                        {review.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!review.is_approved && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateReviewStatus(review.id, true)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateReviewStatus(review.id, false)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        {review.is_approved && review.review_responses.length === 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedReview(review)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <div className="font-semibold">{selectedReview.products?.name}</div>
                <div className="text-sm text-muted-foreground">
                  By {selectedReview.profiles?.full_name || "Anonymous"}
                </div>
              </div>

              <StarRating rating={selectedReview.rating} size="lg" />

              <div>
                <div className="font-semibold mb-1">{selectedReview.title}</div>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>

              {selectedReview.pros && selectedReview.pros.length > 0 && (
                <div>
                  <div className="font-semibold text-green-600 mb-1">Pros:</div>
                  <ul className="text-sm list-disc list-inside">
                    {selectedReview.pros.map((pro, idx) => (
                      <li key={idx}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReview.cons && selectedReview.cons.length > 0 && (
                <div>
                  <div className="font-semibold text-red-600 mb-1">Cons:</div>
                  <ul className="text-sm list-disc list-inside">
                    {selectedReview.cons.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReview.review_responses.length > 0 ? (
                <div className="border-t pt-4">
                  <div className="font-semibold mb-2">Your Response:</div>
                  <p className="text-sm">{selectedReview.review_responses[0].response}</p>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <div className="font-semibold mb-2">Add Response:</div>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write your response..."
                    rows={4}
                  />
                  <Button
                    onClick={submitResponse}
                    disabled={submitting || !response.trim()}
                    className="mt-2"
                  >
                    {submitting ? "Submitting..." : "Submit Response"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
