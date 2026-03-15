import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 32, text = 'Chargement...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 size={size} className="animate-spin text-accent" />
      <p className="text-text-secondary text-sm">{text}</p>
    </div>
  );
}
