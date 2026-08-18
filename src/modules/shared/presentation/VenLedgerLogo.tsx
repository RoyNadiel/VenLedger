import React from 'react';

interface VenLedgerLogoProps {
  className?: string;
  size?: number;
}

export const VenLedgerLogo: React.FC<VenLedgerLogoProps> = ({
  className = '',
  size = 36,
}) => {
  return (
    <div
      className={`rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current text-white"
      >
        {/* Isotipo V estilizado con líneas de contabilidad / bóveda */}
        <path
          d="M4 5L12 19L20 5"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 5L12 11L15 5"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60"
        />
      </svg>
    </div>
  );
};
