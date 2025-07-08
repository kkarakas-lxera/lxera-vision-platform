import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
  srcSet?: string;
  style?: React.CSSProperties;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  objectFit = 'cover',
  sizes,
  srcSet,
  style,
  onError,
  placeholder = 'empty',
  blurDataURL,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Calculate aspect ratio for responsive sizing
  const aspectRatio = (height / width) * 100;

  // Use eager loading for priority images
  const actualLoading = priority ? 'eager' : loading;

  // Base styles that help prevent CLS
  const baseStyle: React.CSSProperties = {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    ...style,
  };

  // Wrapper styles for aspect ratio preservation
  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom: `${aspectRatio}%`,
    overflow: 'hidden',
    backgroundColor: placeholder === 'blur' && blurDataURL ? undefined : '#f3f4f6',
  };

  const imageStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoading ? 0 : 1,
  };

  // If there's an error, show a placeholder
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ ...baseStyle, aspectRatio: `${width}/${height}` }}
        role="img"
        aria-label={alt}
      >
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div style={wrapperStyle} className={className}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && blurDataURL && isLoading && (
        <img
          src={blurDataURL}
          alt=""
          aria-hidden="true"
          style={{
            ...imageStyle,
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={actualLoading}
        decoding={priority ? 'sync' : 'async'}
        sizes={sizes}
        srcSet={srcSet}
        onError={handleError}
        onLoad={handleLoad}
        style={imageStyle}
        draggable={false}
      />
    </div>
  );
};

export default OptimizedImage;