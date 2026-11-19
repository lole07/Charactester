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
