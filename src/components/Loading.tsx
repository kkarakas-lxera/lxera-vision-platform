
import { Loader2 } from "lucide-react";

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loading = ({ text = "Loading...", size = 'md', className = '' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-future-green`} />
      {text && (
        <span className="text-business-black/70 text-sm font-medium">
          {text}
        </span>
      )}
    </div>
  );
};

export default Loading;
