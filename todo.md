# Pendientes de Lógica y Arquitectura - VenLedger

- [x] **Vincular Abonos de Deudas a Bóvedas de Fondos**
  - Permitir seleccionar una bóveda al registrar un abono/pago de deuda.
  - Generar automáticamente una transacción de Ingreso (para deudas por cobrar) o Gasto (para deudas por pagar) afectando el saldo real de la bóveda.

- [ ] **Transacciones Atómicas ACID en IndexedDB**
  - Envolver la creación/eliminación de movimientos y actualización de bóvedas en bloques `db.transaction('rw', ...)` de Dexie para evitar inconsistencias si ocurre un fallo de ejecución.

- [ ] **Edición de Movimientos Existentes**
  - Implementar formulario de actualización para movimientos registrados, recalculando el saldo diferencial de las bóvedas involucradas.

- [ ] **Categorías Personalizadas de Gastos e Ingresos**
  - Crear modelo y selector de categorías (Alimentos, Servicios, Honorarios, etc.) en lugar de texto plano libre.

- [ ] **Exportación e Importación de Respaldo Local (Backup JSON)**
  - Implementar exportación completa del estado local en JSON y restauración para evitar pérdida de datos si el navegador borra el almacenamiento local.
