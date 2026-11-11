# Reporte de Trazabilidad, Rendimiento de Servicios y Tiempos de CI

**Estudiante:** Sebastián Jurado  
**Rama base:** `practica-productos-jurado` (PR #87)  
**Rama actual:** `timing-sebastian-jurado`

## 1. Comandos implementados
- `npm run benchmark:service`: Mide latencia (`avg`, `p95`, `max`), throughput (`ops/s`), CPU y memoria (`Heap/RSS`) de cada método de `ProductStore` y del endpoint HTTP `/health`.
![alt text](<Captura de pantalla 2026-11-11 123737.png>)
- `npm run test:timing` y `npm run test:timing:productos`: Mide el tiempo total de pared (*wall time*), duración por archivo y los tests individuales con mayor tiempo de ejecución.
![alt text](<Captura de pantalla 2026-11-11 123751.png>)
- `npm run ci:timing`: Consulta la cadena de trazabilidad en GitHub Actions (`commit -> rama -> PR #87 -> run -> jobs -> steps`).
![alt text](<Captura de pantalla 2026-11-11 123802.png>)

## 2. Validación de Suites y Tiempos
- **Suite Almacén de Productos:** 32/32 tests pasaron (Calificación: 5.000).
- **Suite Principal API Express:** 4/4 tests pasaron.
- **Typecheck y Build:** Completados sin errores de TypeScript.