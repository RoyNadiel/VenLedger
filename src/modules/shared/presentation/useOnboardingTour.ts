import { useEffect, useCallback } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'venledger_tour_completed';

export function useOnboardingTour() {
  const startTour = useCallback((force = false) => {
    if (!force && localStorage.getItem(TOUR_STORAGE_KEY) === 'true') {
      return;
    }

    const isMobile = window.innerWidth < 768;
    const navElement = isMobile ? '#tour-nav-mobile' : '#tour-nav-desktop';
    const navSide = isMobile ? 'top' : 'bottom';

    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(9, 9, 11, 0.75)',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      onDestroyed: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      },
      steps: [
        {
          element: '#tour-logo',
          popover: {
            title: 'Bienvenido a VenLedger',
            description:
              'Tu plataforma PWA para control de patrimonio, bóvedas y finanzas personales en Venezuela.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-rates',
          popover: {
            title: 'Tasas en Tiempo Real',
            description:
              'Monitorea la tasa oficial BCV (USD y EUR) y la tasa de referencia Binance P2P del día.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-summary',
          popover: {
            title: 'Conversión Consolidada',
            description:
              'Consulta tu patrimonio total en Bolívares y sus equivalentes automáticos en dólares y euros.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-vaults',
          popover: {
            title: 'Bóvedas de Fondos',
            description:
              'Organiza tus ahorros por ubicación y tipo: Efectivo, Zelle, Billeteras Digitales y Bancos.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: navElement,
          popover: {
            title: 'Navegación Principal',
            description:
              'Accede fácilmente a tus Movimientos, Deudas Multitasa con comprobante y Analíticas de Salud.',
            side: navSide,
            align: isMobile ? 'center' : 'end',
          },
        },
      ],
    });

    driverObj.drive();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTour(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [startTour]);

  return { startTour };
}
