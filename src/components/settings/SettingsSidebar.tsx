
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Settings2, CreditCard } from 'lucide-react';

export function SettingsSidebar() {
  return (
    <div className="space-y-1">
      <NavLink to="/settings/profile" className="w-full block">
        {({ isActive }) => (
          <Button 
            variant={isActive ? 'default' : 'ghost'} 
            className="w-full justify-start"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
        )}
      </NavLink>
      
      <NavLink to="/settings/account" className="w-full block">
        {({ isActive }) => (
          <Button 
            variant={isActive ? 'default' : 'ghost'} 
            className="w-full justify-start"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
        )}
      </NavLink>
      
      <NavLink to="/settings/plan" className="w-full block">
        {({ isActive }) => (
          <Button 
            variant={isActive ? 'default' : 'ghost'} 
            className="w-full justify-start"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Plans & Billing
          </Button>
        )}
      </NavLink>
    </div>
  );
}
