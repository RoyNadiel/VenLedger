import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string;
  extraText?: string;
}

export interface CustomSelectProps<T = string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  headerTitle?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  label,
  headerTitle,
  disabled = false,
  className = '',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase font-mono tracking-wider">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-semibold transition-all duration-150 text-left outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate min-w-0">
          {selectedOption?.icon && (
            <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate text-zinc-900 dark:text-zinc-100 font-title-semibold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
              ({selectedOption.sublabel})
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 min-w-[200px]">
          {headerTitle && (
            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-800/40">
              <span className="text-[10px] font-title-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                {headerTitle}
              </span>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500 italic">
                Sin opciones disponibles
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 flex items-center justify-between transition-colors duration-150 text-left relative group ${
                      isSelected
                        ? 'bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {/* Barra de indicador activo */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-zinc-900 dark:bg-zinc-100"></div>
                    )}

                    <div className="flex items-center space-x-2.5 truncate min-w-0 pr-2">
                      {opt.icon && (
                        <span
                          className={`shrink-0 ${
                            isSelected
                              ? 'text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                          }`}
                        >
                          {opt.icon}
                        </span>
                      )}
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-title-semibold truncate">
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {opt.extraText && (
                        <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                          {opt.extraText}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
