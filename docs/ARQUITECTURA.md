# Arquitectura y límites de esta entrega

## Responsabilidades actuales

- `main.js`: mantiene la simulación original y su orden de actualización para reducir el riesgo de regresiones.
- `CyborgController.js`: encapsula jerarquía del actor, `AnimationMixer`, caché de acciones, cross-fades y ciclo de vida.
- `GamepadController.js`: encapsula Gamepad API, conexión/desconexión, selección de mando conectado, deadzones radiales, cámara y mapeo de botones.
- `config/cyborg.json`: parámetros de movimiento/cámara y configuración del mando, fuera del HTML.
- `assets/cyborg.glb`: modelo separado del documento HTML.

## Estados de gameplay existentes observados

`ground`, `air`, `swim`, `act`, `climb`, `hang`, `cover`, `dead`, `manual`, `drive`.

La mecánica actual de trepar usa objetos marcados con `climb: 'wall'` o `climb: 'rope'`; el estado `hang` desplaza al personaje lateralmente a lo largo de la cara detectada. La natación actual usa el área de agua, la posición vertical y el valor de oxígeno.

## Nota de compatibilidad

La extracción de todos los sistemas de gameplay en módulos independientes es una siguiente fase, no se declara terminada en esta entrega. La lógica de simulación permanece coordinada por `main.js` para no cambiar de forma simultánea colisiones, físicas, IA, combate y animación.


## Sistemas añadidos en v2

- `EdgeDetectionSystem`: evalúa las cajas sólidas durante el estado `air`; filtra por diferencia vertical, distancia a la cara y orientación. Si encuentra una cornisa válida, coloca al actor en `hang`, detiene su velocidad y conserva la caja y la normal de apoyo.
- `CornerTraversalSystem`: durante `hang`, busca una cara perpendicular próxima y de altura compatible en la dirección del desplazamiento lateral. Si existe, actualiza la caja y la normal para continuar el agarre alrededor de la esquina.

La detección es automática y no añade una acción de agarre al mapa del mando. `E` sigue soltando al personaje y avanzar inicia la subida. La física y la colisión general siguen usando la implementación original de `main.js`; estos módulos se integran en sus estados existentes para limitar regresiones.

## Límites conocidos de v2

- La detección está diseñada para plataformas y obstáculos representados por cajas AABB alineadas a los ejes, como los sólidos actuales del escenario. No cubre mallas arbitrarias ni superficies curvas.
- Los umbrales de altura y distancia son iniciales y requieren ajuste visual con el personaje en ejecución.
- La transición automática de esquinas funciona entre caras sólidas próximas y de altura similar; no es todavía un sistema general de parkour ni de navegación por geometría compleja.
- No se ha declarado validación visual ni con mando físico: la entrega pasa comprobación sintáctica y comprobación HTTP de sus recursos.
