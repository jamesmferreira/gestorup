
import React from 'react';
import { Icon } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  title: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

const ActionCard = ({ title, icon: Icon, color, onClick }: ActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-6 rounded-xl backdrop-blur-sm bg-white/10 border border-white/20",
        "hover:bg-white/20 transition-all duration-300",
        "flex flex-col items-center justify-center gap-4 w-full",
        "group"
      )}
    >
      <Icon size={32} className={`${color} transition-transform group-hover:scale-110`} />
      <span className="text-white font-medium text-lg">{title}</span>
    </button>
  );
};

export default ActionCard;
