
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-white/10 py-10 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img 
                src="/lovable-uploads/67d077d7-d8d5-4af9-998e-39d5db6ec54e.png" 
                alt="Workout Routine Planner Logo" 
                className="h-12 mb-2"
              />
            </Link>
            <p className="text-sm text-gray-400">
              Workout Routine Planner, Weekly Workout & Exercise Planner for Seamless Calendar & Smartwatch Integration
            </p>
            <p className="text-xs text-gray-500">Portfolio Product of Unfit Inc.</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/workout-gears" className="text-gray-400 hover:text-primary transition-colors">
                  Workout Gears
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-gray-400 hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} Workout Routine Planner. All rights reserved.
          </div>
          <div className="text-sm text-gray-400">
            Contact: <a href="mailto:info@workoutroutineplanner.fit" className="hover:text-primary">info@workoutroutineplanner.fit</a>, 
            Call: <a href="tel:+8801886102806" className="hover:text-primary">+8801886-102806</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
