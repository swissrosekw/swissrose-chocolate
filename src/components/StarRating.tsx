import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const stars = Array.from({ length: maxRating }, (_, index) => index + 1);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stars.map((star) => {
        const isFilled = star <= rating;
        const isPartial = star - 0.5 <= rating && star > rating;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={cn(
              "relative transition-transform",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default"
            )}
          >
            {isPartial ? (
              <div className="relative">
                <Star className={cn(sizeClasses[size], "text-muted")} />
                <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star className={cn(sizeClasses[size], "text-yellow-500 fill-yellow-500")} />
                </div>
              </div>
            ) : (
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled ? "text-yellow-500 fill-yellow-500" : "text-muted"
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
