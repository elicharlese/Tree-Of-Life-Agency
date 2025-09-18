'use client';

import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  fallback,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };
  
  const baseClasses = 'inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium overflow-hidden';
  const classes = `${baseClasses} ${sizeClasses[size]} ${className}`;
  
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={classes}
        style={{ objectFit: 'cover' }}
      />
    );
  }
  
  return (
    <div className={classes}>
      {fallback || alt.charAt(0).toUpperCase() || '?'}
    </div>
  );
};

export { Avatar };
export type { AvatarProps };
