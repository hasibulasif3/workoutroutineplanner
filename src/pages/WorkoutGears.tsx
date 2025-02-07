import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ExternalLink, ShieldCheck, Star, Package, Search, Filter } from "lucide-react";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface WorkoutGear {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  affiliateLink: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

const workoutGears: WorkoutGear[] = [
  {
    id: "1",
    name: "Premium Yoga Mat",
    description: "High-density foam mat perfect for yoga and floor exercises",
    price: "$29.99",
    imageUrl: "/placeholder.svg",
    affiliateLink: "https://example.com/yoga-mat",
    rating: 4.8,
    reviews: 128,
    stock: 45,
    category: "yoga",
    difficulty: "beginner"
  },
  {
    id: "2",
    name: "Resistance Bands Set",
    description: "5-piece resistance bands set for strength training",
    price: "$24.99",
    imageUrl: "/placeholder.svg",
    affiliateLink: "https://example.com/resistance-bands",
    category: "strength",
    difficulty: "intermediate"
  },
  {
    id: "3",
    name: "Adjustable Dumbbell Set",
    description: "Space-saving adjustable dumbbells from 5-52.5 lbs",
    price: "$299.99",
    imageUrl: "/placeholder.svg",
    affiliateLink: "https://example.com/dumbbells",
    category: "strength",
    difficulty: "advanced"
  }
];

const WorkoutGears = () => {
  const { scrollY } = useScroll();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  const backgroundY = useTransform(scrollY, [0, 500], [0, 100]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const handlePurchase = async (gear: WorkoutGear) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    window.open(gear.affiliateLink, '_blank');
  };

  const filteredGears = workoutGears.filter(gear => {
    const matchesSearch = gear.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gear.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || gear.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || gear.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div 
        className="absolute inset-0 -z-10"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1f2c_0%,_#0f1117_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(155,135,245,0.1)_0%,_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(14,165,233,0.1)_0%,_transparent_40%)]" />
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 title-gradient"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Essential Workout Gear
        </motion.h1>
        
        <motion.p 
          className="text-gray-400 text-center mb-8 max-w-2xl mx-auto text-lg md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Enhance your workout experience with our carefully selected fitness equipment. 
          Each item is chosen for quality, durability, and value for money.
        </motion.p>

      {/* Advanced Filtering Section */}
      <div className="mb-8 glass-card p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="yoga">Yoga</SelectItem>
              <SelectItem value="strength">Strength Training</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

        <motion.div 
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "none" : "translateY(20px)"
          }}
        >
          {filteredGears.map((gear, index) => (
            <motion.div
              key={gear.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="group relative"
            >
              <div className="glass-card p-4 rounded-lg transition-all duration-300 
                             hover:scale-[1.02] hover:shadow-2xl
                             bg-gradient-to-br from-white/10 to-white/5
                             border border-white/10 backdrop-blur-md
                             relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-0 
                               group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="aspect-video mb-3 bg-gray-800/50 rounded-md overflow-hidden">
                  <motion.img 
                    src={gear.imageUrl} 
                    alt={gear.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white/90 line-clamp-1">{gear.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{gear.description}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    {gear.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-300">{gear.rating}</span>
                      </div>
                    )}
                    {gear.stock && (
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-300">{gear.stock}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-bold text-white">{gear.price}</span>
                    <Button
                      onClick={() => handlePurchase(gear)}
                      disabled={isLoading}
                      className="relative overflow-hidden group bg-gradient-to-r from-primary via-secondary to-accent 
                                hover:opacity-90 transition-all duration-300"
                    >
                      {isLoading ? (
                        <Progress value={100} className="w-full absolute inset-0" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Buy
                          <ExternalLink size={16} />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WorkoutGears;
