import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-lg',
  showCloseButton = true,
  closeOnOverlayClick = true 
}) => {
  useEffect(() => {
    // Não manipular overflow do body pois o layout já é fixo
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-[100] flex items-center justify-center"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100vh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute bg-black/60 backdrop-blur-sm"
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          left: 'env(safe-area-inset-left, 0px)',
          right: 'env(safe-area-inset-right, 0px)',
          bottom: 'env(safe-area-inset-bottom, 0px)'
        }}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Container com scroll interno */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div 
          className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${maxWidth} flex flex-col`}
          style={{ maxHeight: '70vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              {title && (
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          )}

          {/* Content com scroll */}
          <div className="overflow-y-auto flex-1 p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
