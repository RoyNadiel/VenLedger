Actúa como un diseñador UI/UX y desarrollador Frontend senior. Diseña e implementa la interfaz de usuario completa para **VenLedger**, una aplicación PWA mobile-first de gestión financiera personal adaptada al entorno económico venezolano.

---

### Contexto y Descripción del Producto
**VenLedger** es una PWA *mobile-first* diseñada para controlar finanzas personales y deudas en Venezuela. Administra saldos multidivisa (USD, EUR, USDT, Bs) y navega la brecha cambiaria entre la tasa oficial del Banco Central de Venezuela (BCV) y el mercado P2P (Binance).

#### Objetivos Principales:
1. **Consolidación Multidivisa:** Centralizar fondos de bancos locales (Bs), efectivo (USD/EUR) y criptoactivos (Binance USDT) en una sola vista.
2. **Gestión de Brecha Cambiaria:** Calcular en tiempo real el valor del patrimonio convertido automáticamente a:
   - USDT totales.
   - Bolívares a tasa oficial BCV.
   - Bolívares a tasa P2P (Binance).
3. **Control de Deudas Dinámicas:** Registrar créditos y préstamos por cobrar y pagar, asociando abonos parciales con la cotización de la tasa del día.
4. **Operatividad Offline-First:** Registrar operaciones de forma instantánea localmente sin depender de conexión a internet.

---

### Estilo Visual y Lenguaje de Diseño (Inspirado en Vercel ACME Store)
- **Estética Minimalista y Monocromática:** Paleta limpia basada en blancos, grises neutros y negros profundos (`zinc` / `neutral`), con bordes sutiles de 1px (`border-neutral-200` / `border-neutral-800`), alto contraste y espaciado holgado.
- **Tipografía:** Moderna y limpia (Geist, Inter o Roboto), priorizando jerarquía clara, legibilidad de números y contraste directo.
- **Tarjetas y Componentes:** Diseños planos con bordes finos, esquinas suavizadas (`rounded-lg`), sin sombras recargadas ni degradados estridentes.
- **Micro-interacciones:** Transiciones suaves en hover y focus, estados de carga elegantes (skeletons) e indicadores de estado minimalistas.

---

### Módulos y Pantallas a Diseñar

#### 1. Resumen de Bóvedas (Dashboard General)
- **Bloque de Conversión Global:** Tarjeta principal que exhibe el saldo consolidado transformado dinámicamente a **USDT**, **Bs (BCV)** y **Bs (Binance P2P)**.
- **Grid de Bóvedas Individuales:**
  - *Bóveda Binance* (USDT)
  - *Bóveda Efectivo* (USD / EUR)
  - *Bóveda Banco Local / Pago Móvil* (Bs)
- **Indicador de Sincronización:** Badge sutil en la barra superior que indique estado ("Sincronizado" / "Cambios locales pendientes").

#### 2. Registro de Transacciones
- Formulario modal o vista integrada limpia para registrar:
  - Tipo: Compra/Venta de Divisas, Gasto, Ingreso, Deuda por Cobrar, Deuda por Pagar.
  - Campos: Monto, divisa base, bóveda origen/destino, categoría (Servicios, Comida, Préstamos, Ahorro) y notas.
- Listado de movimientos recientes con filtros sutiles por categoría y bóveda.

#### 3. Módulo de Deudas, Abonos y Comprobantes
- Lista de contactos con deudas activas (por cobrar / por pagar).
- Vista detallada por deuda con historial de abonos parciales, mostrando fecha, monto abonado y tasa del día utilizada.
- **Generador de Comprobante Visual:** Componente tipo ticket compacto y elegante listo para exportar a imagen (`html-to-image`) y compartir por WhatsApp.

#### 4. Analítica y Salud Financiera
- **Distribución de Gastos:** Gráfico de dona o barras monocromáticas por categorías (usando Recharts).
- **Termómetro de Poder de Compra:** Indicador visual que evalúa el diferencial cambiario y la evolución del patrimonio frente a la devaluación acumulada.

---

### Detalles Técnicos y Arquitectura de Referencia
- **Stack:** React 19, TypeScript, Vite, TailwindCSS v4, Zustand, Lucide Icons, Recharts, `html-to-image`, `vite-plugin-pwa`.
- **Persistencia Local:** Dexie.js (IndexedDB) con IDs UUID v4 (`crypto.randomUUID()`).
- **Patrón de Arquitectura:** Clean Architecture y Screaming Architecture modular bajo `src/modules/` (`domain`, `application`, `infrastructure`, `presentation`).
- **Sincronización:** Patrón Outbox Event Queue (`outbox_events`) preparado para Supabase (PostgreSQL + RLS).
- **Modo PWA:** Instalable con navegación adaptativa (Bottom Navigation en móvil, barra lateral limpia en escritorio).
