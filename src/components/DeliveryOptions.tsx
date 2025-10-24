import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DeliveryOptions = () => {
  const [selectedOption, setSelectedOption] = useState<"delivery" | "pickup">("delivery");

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4 animate-scale-in">
      {/* Delivery/Pickup Toggle */}
      <div className="flex gap-3">
        <Button
          variant={selectedOption === "delivery" ? "default" : "outline"}
          className="flex-1 rounded-lg"
          onClick={() => setSelectedOption("delivery")}
        >
          Delivery
        </Button>
        <Button
          variant={selectedOption === "pickup" ? "default" : "outline"}
          className="flex-1 rounded-lg"
          onClick={() => setSelectedOption("pickup")}
        >
          Pickup
        </Button>
      </div>

      {/* Location Selector */}
      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <Select defaultValue="location1">
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Choose location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="location1">Kuwait City</SelectItem>
            <SelectItem value="location2">Salmiya</SelectItem>
            <SelectItem value="location3">Hawalli</SelectItem>
            <SelectItem value="location4">Jabriya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Earliest Arrival */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Clock className="h-5 w-5 flex-shrink-0" />
        <span>Earliest arrival: Today, 2:00 PM</span>
      </div>
    </div>
  );
};

export default DeliveryOptions;
