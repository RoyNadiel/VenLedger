import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { VenLedgerLogo } from './VenLedgerLogo';
import { ThemeToggle } from './ThemeToggle';
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  Handshake,
  BarChart3,
} from 'lucide-react';

export const Header: React.FC = () => {
  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      path: '/vaults',
      label: 'Bóvedas',
      icon: <Landmark className="w-4 h-4" />,
    },
    {
      path: '/transactions',
      label: 'Movimientos',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      path: '/debts',
      label: 'Deudas',
      icon: <Handshake className="w-4 h-4" />,
    },
    {
      path: '/analytics',
      label: 'Salud Financiera',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 py-3 px-4 transition-colors">
      <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
        {/* Logo & Marca */}
        <Link
          to="/"
          className="flex items-center space-x-3 cursor-pointer text-left focus:outline-none group select-none"
          title="Ir al Resumen / Dashboard"
        >
          <VenLedgerLogo size={32} />
          <div>
            <h1 className="text-lg font-title-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
              VenLedger
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block font-subtitle">
              FINANCE PWA
            </p>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center space-x-1 p-1 rounded-lg">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-subtitle transition-all duration-150 select-none cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-title-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/50'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Lado Derecho Header */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
