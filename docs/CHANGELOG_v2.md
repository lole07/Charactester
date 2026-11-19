# CYBORG Modular v2

## Cambios
- Agarre automático de cornisas al saltar hacia una plataforma sólida alcanzable.
- Alineación del personaje con el borde y entrada al estado `hang` existente.
- Desplazamiento lateral conservando las animaciones originales de shimmy.
- Transición automática a caras perpendiculares cercanas y de altura compatible.
- Subida al avanzar y liberación con `E`.

## Compatibilidad
- Se conserva `legacy/Cyborg_-_Campo_de_pruebas_v3.html` sin modificar.
- Se conserva el GLB y el conjunto de clips.
- Se reutilizan los estados y las funciones de colisión originales.

## Validación realizada
- `node --check` sobre `main.js` y los nuevos módulos.
- Comprobación de que el servidor HTTP entrega el HTML, los módulos, la configuración y el GLB.

## Pendiente
- Prueba visual interactiva en navegador y prueba con mando físico.
- Ajuste fino de alturas, distancias y puntos de contacto según el rig y las animaciones reales.
- Refactorización posterior de `MovementSystem`, `ClimbingSystem` y `SwimmingSystem`.
