
import { Dumbbell } from "lucide-react";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return <Dumbbell className={className} />;
}
