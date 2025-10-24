import flowerBouquets from "@/assets/flower-bouquets.jpg";
import comboGifts from "@/assets/combo-gifts.jpg";
import flowerArrangements from "@/assets/flower-arrangements.jpg";
import crystalTrays from "@/assets/crystal-trays.jpg";
import chocolateBoxes from "@/assets/chocolate-boxes.jpg";
import patisserie from "@/assets/patisserie.jpg";

const categories = [
  {
    id: 1,
    title: "FLOWER BOUQUETS",
    image: flowerBouquets,
    description: "Stunning fresh flower arrangements"
  },
  {
    id: 2,
    title: "FLOWERS & CHOCOLATE",
    image: comboGifts,
    description: "Perfect combination gifts"
  },
  {
    id: 3,
    title: "PREMIUM ARRANGEMENTS",
    image: flowerArrangements,
    description: "Elegant floral displays"
  },
  {
    id: 4,
    title: "CHOCOLATE TRAYS",
    image: crystalTrays,
    description: "Artisan chocolate collections"
  },
  {
    id: 5,
    title: "CHOCOLATE BOXES",
    image: chocolateBoxes,
    description: "Premium chocolate assortments"
  },
  {
    id: 6,
    title: "PATISSERIE",
    image: patisserie,
    description: "Fine chocolate desserts"
  },
];

const ProductGrid = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <h3 className="text-2xl font-playfair font-bold text-foreground mb-2 tracking-wide group-hover:text-primary transition-colors duration-300">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  {category.description}
                </p>
              </div>

              {/* Border Effect */}
              <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-xl transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
