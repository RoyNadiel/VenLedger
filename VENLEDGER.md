# VenLedger - Documentación de la Aplicación

## 1. Descripción
**VenLedger** es una aplicación PWA *mobile-first* de gestión financiera personal diseñada para el entorno económico venezolano. Permite administrar saldos multidivisa (USD, EUR, USDT, Bs) navegando la brecha cambiaria entre tasas oficiales (BCV) y paralelas/P2P (Binance).

---

## 2. Objetivos Principales
- **Consolidación Multidivisa:** Unificar cuentas bancarias locales, efectivo y activos crypto en una vista centralizada.
- **Gestión de Brecha Cambiaria:** Calcular en tiempo real el valor del patrimonio convertido a USDT, Bs BCV y Bs P2P.
- **Control de Deudas Dinámicas:** Seguir préstamos por cobrar y pagar con abonos parciales y registro de tasa aplicada.
- **Funcionalidad Offline-First:** Registrar operaciones de forma instantánea sin requerir conexión a internet.

---

## 3. Funcionalidades Clave
- **Sistema de Bóvedas (Vaults):**
  - Segmentación de fondos (Binance USDT, Efectivo USD/EUR, Banco/Pago Móvil Bs).
  - Métricas globales consolidadas en tiempo real.
- **Registro de Transacciones:**
  - Categorías personalizables de gastos e ingresos.
  - Conversión automática y compra/venta de divisas.
- **Módulo de Deudas y Comprobantes:**
  - Historial de deudas por contacto.
  - Abonos parciales vinculados a la cotización del día.
  - Generación de comprobantes en imagen para envío directo por WhatsApp (`html-to-image`).
- **Analítica y Salud Financiera:**
  - Gráficos de distribución de gastos por categoría (Recharts).
  - Termómetro de poder de compra y diferencial cambiario.
- **PWA & Offline:**
  - Instalación como app nativa en móvil y escritorio.
  - Persistencia local en IndexedDB mediante Dexie.js.

---

## 4. Detalles Técnicos y Arquitectura
- **Stack:** React 19, TypeScript, Vite, TailwindCSS v4, Zustand.
- **Persistencia Local:** Dexie.js (IndexedDB) con IDs UUID v4.
- **Arquitectura:** Clean Architecture y Screaming Architecture en `src/modules/` (`domain`, `application`, `infrastructure`, `presentation`).
- **Sincronización Nube (Planificada):** Cola de eventos Outbox hacia Supabase (PostgreSQL + RLS).

---

## 5. Estado Actual y Limitaciones
- **Modo de Operación:** Operación local basada en IndexedDB.
- **Sincronización Backend:** La sincronización remota con Supabase está estructurada a nivel de arquitectura pero no está conectada activamente a un backend remoto.
- **Actualización de Cotizaciones:** Requiere consulta a la API de tasas cuando hay conexión a internet disponible.
