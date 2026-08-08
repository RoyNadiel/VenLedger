# VenLedger - Propuesta de Arquitectura y Concepto (PWA)

## 1. Visión General

- **Nombre de la App:** VenLedger
- **Propósito:** Aplicación PWA RESPONSIVE mobile-first para el control financiero personal y gestión de deudas en Venezuela, administrando la brecha entre tasas oficiales (BCV) y P2P (Binance).
- **Enfoque:** Uso personal organizado por **Bóvedas**, categorización de gastos, historial de deudas con abonos parciales y generación de comprobantes visuales.
- **Ecosistema:** PWA independiente enfocada en gestión financiera profunda, consumiendo la API existente de tasas en tiempo real de Tasa Actual.

---

## 2. Estructura y Módulos Principales

### A. Sistema de Bóvedas (Ubicación de Fondos)

Permite separar el capital según la plataforma o medio físico donde residen los fondos:

- **Bóveda Binance (USDT)**
- **Bóveda Efectivo (USD / EUR)**
- **Bóveda Banco Local / Pago Móvil (Bs)**

**Métrica en vivo:** VenLedger muestra el saldo total consolidado convertido automáticamente en tiempo real a:

1. USDT totales.
2. Bolívares a Tasa BCV.
3. Bolívares a Tasa P2P (Binance).

---

### B. Registro Detallado de Transacciones

Campos requeridos por movimiento:

- **Monto y Divisa base.**
- **Bóveda de Origen/Destino.**
- **Tipo de Operación:** Compra/Venta de Divisas, Gasto, Ingreso, Deuda por Cobrar, Deuda por Pagar.
- **Categoría Personalizable:** Comida, Servicios, Préstamos, Ahorro, etc.
- **Fecha y Nota/Contacto.**

---

### C. Módulo de Deudas y Abonos Parciales

- **Historial dinámico:** Permite asociar una deuda a un contacto.
- **Abonos Parciales:** Cada abono guarda el monto pagado, la fecha y la tasa del día consultada mediante la API.
- **Recálculo de Saldo:** Ajuste automático de la brecha pendiente en bolívares o dólares según el tipo de acuerdo (monto congelado en USDT o flotante en Bs).
- **Comprobante de WhatsApp:** Generación automática de un comprobante visual (tipo ticket/imagen) con el desglose del abono y el saldo pendiente para compartir en un clic.

---

### D. Gráficos y Salud Financiera

- **Distribución de Gastos:** Gráfico de pastel por categorías personalizadas.
- **Termómetro de Poder de Compra:** Muestra si los ahorros guardados en USDT han ganado o perdido capacidad de compra frente a la inflación y la devaluación acumulada.

---

## 3. Especificaciones de Diseño UI/UX

- **Estilo Visual:** Minimalista limpio con paleta en tonos pastel suave sobre fondos claros/neutros.
- **Paleta de Colores Pastel:**
  - **Azul Pastel:** Bóvedas, métricas generales de saldo y acentos primarios.
  - **Rosa Pastel:** Registros de gastos, salidas de caja y deudas por pagar.
  - **Verde / Amarillo Pastel:** Indicadores de ganancias, estado neutral de cuentas o avisos de brecha cambiaria.
  - **Rojo Pastel:** Alertas de vencimiento, pérdida de poder adquisitivo o saldos negativos.
- **Indicador de Estado de Sincronización:** Ícono visual discreto en la barra superior (verde = sincronizado / amarillo = cambios locales pendientes en cola por subir a la nube).

---

## 4. Estrategia de Persistencia Local a Nube (Dexie.js -> Supabase)

### A. Identificadores Unívocos (UUID v4)

- **Criterio Técnico:** Se usarán **UUIDs (string)** generados en local desde la creación en Dexie.js (`crypto.randomUUID()`) en lugar de autoincrementales numéricos. Esto evita colisiones de IDs al migrar o sincronizar datos locales hacia Supabase PostgreSQL.

### B. Arquitectura Offline-First con Event Queue

- **Fase 1 (Desarrollo MVP Local):** Operaciones CRUD escritas directamente en Dexie.js (IndexedDB).
- **Fase 2 (Acoplamiento de Supabase):**
  - Creación de la tabla `outbox_events` en Dexie.js para registrar eventos pendientes (`INSERT`, `UPDATE`, `DELETE`).
  - Worker de sincronización en segundo plano que procesa la cola de eventos enviándolos a Supabase cuando se detecta conexión a internet.

### C. Esquema de Base de Datos Relacional (PostgreSQL en Supabase)

- **`profiles`:** Datos del usuario y preferencias de bóveda principal.
- **`vaults`:** Bóvedas del usuario (`id` UUID, `user_id`, `name`, `type`, `currency`, `balance`).
- **`categories`:** Categorías de gastos e ingresos personalizadas (`id` UUID, `user_id`, `name`, `color`).
- **`transactions`:** Movimientos (`id` UUID, `user_id`, `vault_id`, `amount`, `currency`, `type`, `category_id`, `rate_used`, `created_at`).
- **`debts`:** Deudas (`id` UUID, `user_id`, `contact_name`, `total_amount`, `currency`, `type`, `status`).
- **`debt_payments`:** Abonos parciales (`id` UUID, `debt_id`, `amount`, `rate_used`, `created_at`).

---

## 5. Principios de Arquitectura Estricta: Clean & Screaming Architecture

- **Screaming Architecture:** La estructura de carpetas debe reflejar de forma explícita el **dominio de negocio** (features/módulos), no los detalles técnicos de la tecnología.
  - La estructura raíz bajo `src/modules/` o `src/features/` estará organizada por capacidades de negocio: `vaults`, `transactions`, `debts`, `rates`, `analytics`, `outbox`.
- **Clean Architecture (Capas por Dominio):**
  - **`domain/`**: Entidades puras, tipos de datos, objetos de valor e interfaces de repositorio/puertos (Pure TypeScript, sin dependencias de frameworks ni de Dexie/React).
  - **`application/`**: Casos de uso (Use Cases) e intercalación de reglas de negocio.
  - **`infrastructure/`**: Implementaciones concretas de repositorios (Dexie.js IndexedDB), adaptadores de API de tasas, cola de sincronización Outbox.
  - **`presentation/`**: Componentes React, hooks de UI y tiendas de estado (Zustand).

---

## 6. Stack Tecnológico Definido

- **Frontend & PWA:** React + Vite (SWC/Oxc) + TypeScript, `vite-plugin-pwa`, TailwindCSS.
- **Calidad de Código:** ESLint con `tseslint.configs.recommendedTypeChecked` / `strictTypeChecked`, `eslint-plugin-react-x` y `eslint-plugin-react-dom`.
- **Estado Local & Persistencia (Offline-First):** Zustand, Dexie.js (IndexedDB) con UUIDs.
- **Backend, Autenticación & Sincronización:** Supabase (PostgreSQL relacional + Auth + RLS).
- **Visualización & Comprobantes:** Recharts (SVG), `html-to-image` / `html2canvas` (generación de imagen para WhatsApp).
- **Integración API:** Vercel Serverless Functions o NestJS (Consumo y caché de API de tasas existente).

---

## 6. Skills Recomendadas para Agentes de IA

- **PWA & Frontend:** `pwa-development`, `react-vite-tailwind`.
- **Estado y Persistencia:** `dexie-indexeddb-mastery`, `zustand-state-patterns`.
- **Backend & Database:** `supabase-postgres-rls`.
- **API y Utilidades:** `api-integration-and-caching`, `html-to-image-canvas`.
- **Calidad y Finanzas:** `spec-driven-development`, `finance-math-skills`, `security-and-hardening`.

---

## 7. Hoja de Ruta para Desarrollo

1. **Desarrollo MVP Local con Dexie.js:** Modelado de esquemas en Dexie.js usando UUIDs, Zustand para estado global e interfaz completa funcional en local [cite: 3, 5].
2. **Configuración del Proyecto Base:** Inicializar React+Vite+TS con plantilla actualizada (ESLint Type-Checked, React-X, React-DOM) [cite: 3, 4], TailwindCSS con la paleta pastel y PWA manifest.
3. **Integración con API de Tasas:** Mapeo de endpoints de BCV, Euro y Binance P2P [cite: 3, 4].
4. **Desarrollo de Vistas UI/UX:** Bóvedas, formulario de transacciones, deudas con abonos, comprobantes e indicador visual de sincronización.
5. **Implementación de Sincronización Supabase:** Creación de tablas/RLS en Supabase y activación del worker para procesar la cola `outbox_events` [cite: 3, 5].
