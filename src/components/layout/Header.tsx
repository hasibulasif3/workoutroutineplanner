
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

export const Header = () => {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/50 border-b border-white/10 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/67d077d7-d8d5-4af9-998e-39d5db6ec54e.png" 
            alt="Workout Routine Planner Logo" 
            className="h-10"
          />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/workout-gears" className="text-sm font-medium transition-colors hover:text-primary">
            Workout Gears
          </Link>
          <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/auth/login">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Join
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};
