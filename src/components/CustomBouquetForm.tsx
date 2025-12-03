import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Flower2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const FLOWER_TYPES = [
  "Roses",
  "Tulips",
  "Lilies",
  "Sunflowers",
  "Peonies",
  "Orchids",
  "Carnations",
  "Mixed Flowers",
  "Other (specify in notes)"
];

const COLOR_PALETTES = [
  "Red & Pink",
  "White & Cream",
  "Purple & Lavender",
  "Yellow & Orange",
  "Pastel Mix",
  "Bold & Vibrant",
  "Monochrome",
  "Custom (specify in notes)"
];

const BOUQUET_SIZES = [
  "Small (10-15 stems)",
  "Medium (20-25 stems)",
  "Large (30-40 stems)",
  "Extra Large (50+ stems)"
];

const STYLES = [
  "Classic Round",
  "Cascading",
  "Hand-tied",
  "Wrapped",
  "In a Vase",
  "In a Box",
  "Basket Arrangement"
];

const BUDGETS = [
  "Under 10 KD",
  "10-20 KD",
  "20-30 KD",
  "30-50 KD",
  "50-100 KD",
  "100+ KD"
];

const CustomBouquetForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    flowerType: "",
    colorPalette: "",
    size: "",
    style: "",
    budget: "",
    occasion: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.flowerType || !formData.size || !formData.budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    const message = `🌹 *Custom Bouquet Request*

*Name:* ${formData.name}
*Phone:* ${formData.phone}

*Flower Type:* ${formData.flowerType}
*Color Palette:* ${formData.colorPalette || "Not specified"}
*Size:* ${formData.size}
*Style:* ${formData.style || "Not specified"}
*Budget:* ${formData.budget}
*Occasion:* ${formData.occasion || "Not specified"}

*Additional Notes:*
${formData.notes || "None"}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/96522280123?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp with your request...");
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Flower2 className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-playfair text-primary">
          Design Your Custom Bouquet
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Fill out the form below and we'll create your perfect arrangement
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="+965 XXXX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Bouquet Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flowerType">Flower Type *</Label>
              <Select
                value={formData.flowerType}
                onValueChange={(value) => setFormData({ ...formData, flowerType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select flower type" />
                </SelectTrigger>
                <SelectContent>
                  {FLOWER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="colorPalette">Color Palette</Label>
              <Select
                value={formData.colorPalette}
                onValueChange={(value) => setFormData({ ...formData, colorPalette: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select colors" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_PALETTES.map((palette) => (
                    <SelectItem key={palette} value={palette}>
                      {palette}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Bouquet Size *</Label>
              <Select
                value={formData.size}
                onValueChange={(value) => setFormData({ ...formData, size: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {BOUQUET_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="style">Arrangement Style</Label>
              <Select
                value={formData.style}
                onValueChange={(value) => setFormData({ ...formData, style: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget *</Label>
              <Select
                value={formData.budget}
                onValueChange={(value) => setFormData({ ...formData, budget: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGETS.map((budget) => (
                    <SelectItem key={budget} value={budget}>
                      {budget}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Input
                id="occasion"
                placeholder="e.g., Birthday, Anniversary, Wedding"
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes or Inspiration</Label>
            <Textarea
              id="notes"
              placeholder="Describe your vision, special requests, or paste an inspiration image link..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Send className="w-5 h-5 mr-2" />
            Send Request via WhatsApp
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your request will be sent directly to our WhatsApp for quick response
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomBouquetForm;
