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
import { KUWAIT_LOCATIONS, type Governorate } from "@/constants/kuwaitLocations";

const DeliveryOptions = () => {
  const [selectedOption, setSelectedOption] = useState<"delivery" | "pickup">("delivery");
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | "">("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  const cities = selectedGovernorate ? KUWAIT_LOCATIONS[selectedGovernorate] : [];

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

      {selectedOption === "delivery" ? (
        <>
          {/* Governorate Selector */}
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Select 
              value={selectedGovernorate} 
              onValueChange={(value) => {
                setSelectedGovernorate(value as Governorate);
                setSelectedCity("");
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose governorate" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(KUWAIT_LOCATIONS).map((gov) => (
                  <SelectItem key={gov} value={gov}>
                    {gov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Selector */}
          {selectedGovernorate && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Earliest Arrival */}
          {selectedCity && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-5 w-5 flex-shrink-0" />
              <span>Earliest arrival: Today, 2:00 PM</span>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Pickup Location Info */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium">Our Branch in Awaq Al Qurain</p>
              <p className="text-sm text-muted-foreground">Mubarak Al-Kabeer Governorate</p>
            </div>
          </div>

          {/* Pickup Hours */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-5 w-5 flex-shrink-0" />
            <span>Available: Saturday-Thursday 9:00 AM - 8:00 PM, Friday 2:00 PM - 8:00 PM</span>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryOptions;
