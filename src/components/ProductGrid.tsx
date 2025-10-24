import deluxGifts from "@/assets/delux-gifts.jpg";
import crystalTrays from "@/assets/crystal-trays.jpg";
import silverTrays from "@/assets/silver-trays.jpg";
import ceramicTrays from "@/assets/ceramic-trays.jpg";
import chocolateBoxes from "@/assets/chocolate-boxes.jpg";
import patisserie from "@/assets/patisserie.jpg";

const categories = [
  {
    id: 1,
    title: "DELUX GIFTS",
    image: deluxGifts,
    description: "Exquisite gift collections for special moments"
  },
  {
    id: 2,
    title: "CRYSTAL TRAYS",
    image: crystalTrays,
    description: "Elegant crystal presentations"
  },
  {
    id: 3,
    title: "SILVER TRAYS",
    image: silverTrays,
    description: "Luxurious silver service"
  },
  {
    id: 4,
    title: "CERAMIC TRAYS",
    image: ceramicTrays,
    description: "Artisanal ceramic collections"
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
