import { type ReactNode } from 'react';

type ButtonVariant = 'blue' | 'green' | 'purple';

interface ControlButtonProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  variant?: ButtonVariant;
  showTooltip?: boolean;
  tooltipText?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  blue: 'bg-blue-500 hover:bg-blue-600',
  green: 'bg-green-500 hover:bg-green-600',
  purple: 'bg-purple-500 hover:bg-purple-600',
};

export const ControlButton = ({
  title,
  onClick,
  disabled = false,
  icon,
  variant = 'blue',
  showTooltip = false,
  tooltipText,
}: ControlButtonProps) => {
  return (
    <div className="relative">
      <button
        title={title}
        onClick={onClick}
        disabled={disabled}
        className={`flex size-9 items-center justify-center rounded p-2 text-white ${variantStyles[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
        {icon}
      </button>
      {showTooltip && tooltipText && (
        <div className="absolute top-full z-10 mt-1 w-max rounded bg-black p-1 text-xs text-white">{tooltipText}</div>
      )}
    </div>
  );
};
