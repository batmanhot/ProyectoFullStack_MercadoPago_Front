import type { ReactNode } from 'react';

// ============================================================
// UI — Card
// ============================================================

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hoverable?: boolean;
}

export const Card = ({
  children,
  className = '',
  onClick,
  selected = false,
  hoverable = false,
}: CardProps) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick
        ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }
        : undefined}
      className={[
        'bg-white rounded-xl border shadow-sm',
        'transition-all duration-150',
        selected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200',
        hoverable && !selected ? 'hover:border-blue-300 hover:shadow-md cursor-pointer' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
}: { children: ReactNode; className?: string }) => (
  <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({
  children,
  className = '',
}: { children: ReactNode; className?: string }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);

export const CardFooter = ({
  children,
  className = '',
}: { children: ReactNode; className?: string }) => (
  <div className={`px-5 py-4 border-t border-gray-100 ${className}`}>
    {children}
  </div>
);
