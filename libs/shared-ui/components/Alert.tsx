import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'feather-icons-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-500" />,
      title: 'text-blue-800',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: 'text-green-800',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      title: 'text-yellow-800',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: 'text-red-800',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`border p-4 ${styles.container} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        
        {onClose && (
          <div className="flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                variant === 'info' ? 'text-blue-500 hover:bg-blue-600 focus:ring-blue-500' :
                variant === 'success' ? 'text-green-500 hover:bg-green-600 focus:ring-green-500' :
                variant === 'warning' ? 'text-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' :
                'text-red-500 hover:bg-red-600 focus:ring-red-500'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { Alert };
export type { AlertProps };
