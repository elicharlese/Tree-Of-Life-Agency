import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium uppercase tracking-wide transition-all duration-200 rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-leaf-600 text-white hover:bg-leaf-700 focus:ring-leaf-500 shadow-organic',
      secondary: 'bg-bark-700 text-white hover:bg-bark-800 focus:ring-bark-500 shadow-organic',
      outline: 'border border-bark-400 bg-transparent text-bark-800 hover:bg-bark-50 focus:ring-bark-400',
      ghost: 'text-bark-700 hover:bg-bark-100 focus:ring-bark-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    } as const;

    const sizeClasses = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-4 py-1.5 text-sm',
      lg: 'px-5 py-2 text-base',
    } as const;

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
