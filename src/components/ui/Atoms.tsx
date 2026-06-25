// ============================================================
// UI — Badge, Spinner, Divider
// ============================================================

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

export const Badge = ({
  variant = 'neutral',
  children,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) => {
  const styles: Record<BadgeVariant, string> = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export const Spinner = ({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div
      className={`${sizes[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin ${className}`}
    />
  );
};

export const Divider = ({
  label,
  className = '',
}: {
  label?: string;
  className?: string;
}) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex-1 h-px bg-gray-200" />
    {label && (
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </span>
    )}
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);
