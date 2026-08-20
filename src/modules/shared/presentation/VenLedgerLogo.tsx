import React from 'react';

interface VenLedgerLogoProps {
  className?: string;
  size?: number;
}

export const VenLedgerLogo: React.FC<VenLedgerLogoProps> = ({
  className = '',
  size = 32,
}) => {
  return (
    <div
      className={`rounded-md bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current"
      >
        {/* Isotipo V estilizado mínimo estilo Vercel / ACME */}
        <path
          d="M4 5L12 19L20 5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 5L12 11L15.5 5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        />
      </svg>
    </div>
  );
};
