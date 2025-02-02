import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface WorkoutGear {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  affiliateLink: string;
}

const workoutGears: WorkoutGear[] = [
  {
    id: "1",
    name: "Premium Yoga Mat",
    description: "High-density foam mat perfect for yoga and floor exercises",
    price: "$29.99",
    imageUrl: "/placeholder.svg",
    affiliateLink: "https://example.com/yoga-mat"
  },
  {
    id: "2",
    name: "Resistance Bands Set",
    description: "5-piece resistance bands set for strength training",
    price: "$24.99",
    imageUrl: "/placeholder.svg",
    affiliateLink: "https://example.com/resistance-bands"
  },
  {
    id: "3",
    name: "Adjustable Dumbbell Set",
    description: "Space-saving adjustable dumbbells from 5-52.5 lbs",
    price: "$299.99",
    imageUrl: "/placeholder.svg",
    affiliateLink: "https://example.com/dumbbells"
  }
];

const WorkoutGears = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 title-gradient">
        Essential Workout Gear
      </h1>
      <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        Enhance your workout experience with our carefully selected fitness equipment. 
        Each item is chosen for quality, durability, and value for money.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {workoutGears.map((gear) => (
          <motion.div
            key={gear.id}
            className="glass-card p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="aspect-square mb-4 bg-gray-800 rounded-lg overflow-hidden">
              <img 
                src={gear.imageUrl} 
                alt={gear.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">{gear.name}</h3>
            <p className="text-gray-400 mb-4">{gear.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-primary font-bold">{gear.price}</span>
              <Button
                asChild
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-opacity"
              >
                <a 
                  href={gear.affiliateLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Buy Now
                  <ExternalLink size={16} />
                </a>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutGears;