// File: src/components/ui/dynamic-icon.tsx
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: keyof typeof Icons;
  className?: string;
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  const IconComponent = (Icons[name] as React.ComponentType<{ className?: string }>) || Icons.HelpCircle;
  return <IconComponent className={className} />;
}