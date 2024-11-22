import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function CardCliente({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
      {children}
    </div>
  );
}