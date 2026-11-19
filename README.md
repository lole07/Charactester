# Cyborg — primera entrega modular

Esta carpeta contiene una primera separación funcional del proyecto original. Se conserva una copia intacta del HTML original en `legacy/`.

## Qué se conserva

- El modelo GLB y sus animaciones originales.
- Escenario de pruebas, terreno, zonas, checkpoints y obstáculos.
- Movimiento, salto, caída, esquiva, combate, sigilo, cobertura.
- Escalada y desplazamiento colgado que ya existían.
- Natación/buceo y oxígeno que ya existían.
- Enemigos, proyectiles, objetos dinámicos y vehículos.
- Panel de ajustes, guardado local y exportación/importación de configuración.

No se han inventado ni añadido todavía mecánicas nuevas de parkour o agarre de esquinas: esta entrega prioriza extraer el modelo, desacoplar la configuración y aislar el controlador de animación y el adaptador de mando sin romper el prototipo.

## Estructura

```text
CYBORG_Modular/
├── index.html
├── assets/cyborg.glb
├── config/cyborg.json
├── src/
│   ├── main.js                 # escena y gameplay legado, aún coordinados
│   ├── CyborgController.js     # actor 3D, mixer y reproducción de animaciones
│   └── GamepadController.js    # detección, ejes, deadzones y botones
├── docs/
└── legacy/                     # HTML original intacto
```

## Ejecutar localmente

Los módulos ES y `fetch()` requieren servir el proyecto por HTTP(S); no abrir `index.html` directamente con `file://`.

Con Python instalado:

```bash
cd CYBORG_Modular
python -m http.server 8000
```

Abrir `http://localhost:8000`.

También puede alojarse en cualquier hosting estático HTTPS. Three.js y sus addons se cargan desde jsDelivr; para producción conviene fijar y alojar las dependencias localmente.

## Mando Bluetooth

1. Emparejar el mando primero desde Windows, macOS, Android o el sistema operativo correspondiente.
2. Abrir el juego en un navegador compatible y pulsar una vez sobre la escena.
3. El HUD muestra el nombre del mando cuando el navegador lo detecta.
4. El soporte usa la Gamepad API; no realiza el emparejamiento Bluetooth desde la página.

La lectura se actualiza en cada frame, conserva el mapeo de botones previo, aplica zonas muertas configurables y limpia los ejes al desconectar. Los nombres de botones pueden cambiarse en `config/cyborg.json`.

## Uso de CyborgController en otra escena Three.js

`CyborgController` recibe el modelo, la instancia `THREE`, el mapa de clips y el JSON de configuración. Expone `root`, `play(name, options)`, `update(deltaSeconds)`, `setConfig(config)`, `getAnimationNames()` y `dispose()`.

La escena que lo use debe cargar el GLB con `GLTFLoader`, preparar el modelo (escala/sombras si corresponde) y pasar `gltf.scene` y `gltf.animations` al controlador. Ejemplo orientativo:

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CyborgController } from './src/CyborgController.js';

const config = await fetch('./config/cyborg.json').then(r => r.json());
const gltf = await new GLTFLoader().loadAsync('./assets/cyborg.glb');
const clips = Object.fromEntries(gltf.animations.map(clip => [clip.name, clip]));
const actor = new CyborgController(gltf.scene, { THREE, config, clips });
scene.add(actor.root);
actor.play('Idle');
// En el bucle de render:
actor.update(deltaSeconds);
```

## Unity / Unreal

El GLB y el JSON son activos portables y pueden importarse/adaptarse en Unity o Unreal. `CyborgController.js` es un controlador JavaScript de Three.js: no se ejecuta directamente dentro de Unity/Unreal. Para esas plataformas se debe implementar un adaptador equivalente en C# (Unity) o C++/Blueprints (Unreal), reutilizando el mismo modelo, nombres de animación y parámetros de configuración.

## Agarre automático de bordes (v2)

- Al saltar hacia una plataforma, el sistema comprueba automáticamente la altura de la cornisa, la proximidad lateral y la orientación del personaje.
- Si la cornisa es alcanzable mientras el personaje cae o se aproxima al ápice del salto, entra en `hang` y alinea el cuerpo con el borde.
- En `hang`, izquierda/derecha desplazan al personaje; al llegar a una esquina compatible, `CornerTraversalSystem` cambia a la cara perpendicular sin pedir otro botón.
- `W` (o avanzar con el mando) inicia la subida; `E` permite soltarse. `H` conserva la transición manual de colgado a escalada que ya existía.
- La detección usa los AABB de `solids` que ya emplea el sistema de colisiones. No todos los elementos del escenario son automáticamente escalables: deben tener una cara y altura alcanzables.

Los umbrales están centralizados en el constructor de `EdgeDetectionSystem` y `CornerTraversalSystem`, para poder ajustarlos sin tocar el bucle de gameplay.

## Próxima fase recomendada

1. Extraer `MovementSystem`, `ClimbingSystem`, `SwimmingSystem`, `CombatSystem`, `CameraController` y `World/AI` desde `main.js`, manteniendo pruebas de regresión por estado.
2. Implementar detección de borde y esquinas como estados nuevos, con raycasts y transiciones de animación verificadas contra los clips que realmente contiene el GLB.
3. Completar el buceo con profundidad, flotabilidad, superficie y oxígeno, extendiendo la mecánica existente.
4. Añadir perfiles de mando Xbox/PlayStation/genérico, remapeo desde UI y vibración cuando `GamepadHapticActuator` esté disponible.
