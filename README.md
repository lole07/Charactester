# Cyborg — versión modular v4

Esta carpeta contiene la separación modular del proyecto, actualizada a la **v4** (agarre de bordes, subida, buceo y mando). Se conserva una copia intacta del HTML de un solo archivo v4 en `legacy/`.

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

## Publicar y abrir en línea (GitHub Pages)

El proyecto no necesita `localhost`: son archivos estáticos que usan rutas relativas.

1. Sube **el contenido de esta carpeta** a la raíz del repositorio (`index.html`, `assets/`, `src/`, `config/`, `docs/`, `legacy/`, `.nojekyll`). `index.html` debe quedar en la raíz del repo.
2. En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Espera 1–2 minutos y abre `https://TU-USUARIO.github.io/TU-REPO/`.

Notas:

- No abras `index.html` desde `raw.githubusercontent.com` ni desde la vista `blob` de GitHub: esas URLs no sirven módulos ES. Tampoco con doble clic (`file://`).
- Si lo subes dentro de una subcarpeta (`CYBORG_Modular/`), la URL será `https://TU-USUARIO.github.io/TU-REPO/CYBORG_Modular/`.
- Si algo falla al cargar, la pantalla muestra el motivo en lugar de quedarse en «Cargando».
- Sin servidor ni repo: `legacy/Cyborg_-_Campo_de_pruebas_v4.html` es la versión de un solo archivo y abre con doble clic.

### Servidor local (opcional)

```bash
cd CYBORG_Modular
python -m http.server 8000
```

Abrir `http://localhost:8000`. Three.js y sus addons se cargan desde jsDelivr (versión fija 0.128.0).

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

## Agarre de esquinas, subida y buceo (v4)

- Al saltar hacia un borde alto sólido (`ledge()`), el personaje se agarra solo si el borde está a su alcance (ajuste «Alcance de agarre») y mira hacia él.
- Colgado: `A/D` desplazan, `W` o `Espacio` suben (`mantle()` con la animación `cover to stand`), `C`/`E` o empujar atrás sueltan. `H` conserva el paso a escalada.
- Buceo: `C` en la superficie = zambullida; con mando/ratón, mirar abajo/arriba sumerge o emerge. El oxígeno se recupera al respirar y la velocidad al nadar es ajustable («Velocidad al nadar»).
- Mando: zona muerta radial ajustable, selección del último mando activo, aviso de mapeo no estándar y vibración (golpes y agarre) cuando el navegador la soporta.
- Nuevos ajustes en el panel: Alcance de agarre, Velocidad al nadar, Zona muerta del mando (valores por defecto en `config/cyborg.json`: `ledge`, `swimV`, `dz`).

`src/systems/EdgeDetectionSystem.js` y `CornerTraversalSystem.js` (v2) siguen en la carpeta pero ya no se importan: la v4 resuelve el agarre dentro de `main.js`.

## Próxima fase recomendada

1. Extraer `MovementSystem`, `ClimbingSystem`, `SwimmingSystem`, `CombatSystem`, `CameraController` y `World/AI` desde `main.js`, manteniendo pruebas de regresión por estado.
2. Mover `ledge()`/`mantle()` a un sistema propio y añadir transición entre esquinas, con raycasts y transiciones de animación verificadas contra los clips que realmente contiene el GLB.
3. Completar el buceo con profundidad, flotabilidad, superficie y oxígeno, extendiendo la mecánica existente.
4. Añadir perfiles de mando Xbox/PlayStation/genérico, remapeo desde UI y vibración cuando `GamepadHapticActuator` esté disponible.
