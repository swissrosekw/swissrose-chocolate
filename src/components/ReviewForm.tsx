import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Plus, X } from "lucide-react";

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ productId, orderId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [pros, setPros] = useState<string[]>([""]);
  const [cons, setCons] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReviewFormData>();

  const addPro = () => setPros([...pros, ""]);
  const removePro = (index: number) => setPros(pros.filter((_, i) => i !== index));
  const updatePro = (index: number, value: string) => {
    const newPros = [...pros];
    newPros[index] = value;
    setPros(newPros);
  };

  const addCon = () => setCons([...cons, ""]);
  const removeCon = (index: number) => setCons(cons.filter((_, i) => i !== index));
  const updateCon = (index: number, value: string) => {
    const newCons = [...cons];
    newCons[index] = value;
    setCons(newCons);
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    const filteredPros = pros.filter((p) => p.trim() !== "");
    const filteredCons = cons.filter((c) => c.trim() !== "");

    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      user_id: user.id,
      order_id: orderId || null,
      rating,
      title: data.title,
      comment: data.comment,
      pros: filteredPros,
      cons: filteredCons,
      is_verified_purchase: !!orderId,
      is_approved: false,
    });

    setSubmitting(false);

    if (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted! It will be visible after admin approval.");
      reset();
      setRating(0);
      setPros([""]);
      setCons([""]);
      onSuccess?.();
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please sign in to leave a review
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating *</label>
            <StarRating
              rating={rating}
              interactive
              onRatingChange={setRating}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review Title *</label>
            <Input
              {...register("title", { required: "Title is required" })}
              placeholder="Sum up your experience"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review *</label>
            <Textarea
              {...register("comment", { required: "Review is required" })}
              placeholder="Share your experience with this product"
              rows={4}
            />
            {errors.comment && (
              <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Pros (Optional)</label>
              <Button type="button" variant="ghost" size="sm" onClick={addPro}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {pros.map((pro, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={pro}
                  onChange={(e) => updatePro(index, e.target.value)}
                  placeholder="What did you like?"
                />
                {pros.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePro(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Cons (Optional)</label>
              <Button type="button" variant="ghost" size="sm" onClick={addCon}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {cons.map((con, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={con}
                  onChange={(e) => updateCon(index, e.target.value)}
                  placeholder="What could be improved?"
                />
                {cons.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCon(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
