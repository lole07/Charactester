# CYBORG Modular v4

## Cambios respecto a v2
- Lógica de juego sincronizada con `Cyborg - Campo de pruebas v4`: agarre de bordes, subida (`mantle`), buceo, zona muerta del mando y vibración.
- Nuevos ajustes: `ledge`, `swimV`, `dz` (en `config/cyborg.json` y en el panel de ajustes).
- HUD y ayuda de controles actualizados a la v4 (`#pad`, texto de esquinas y buceo).
- `legacy/` contiene ahora la v4 de un solo archivo (sustituye a la v3).
- `index.html` muestra en pantalla el motivo si no puede arrancar y avisa si se abre con `file://`.
- Se añade `.nojekyll` y se documenta la publicación en GitHub Pages.

## Compatibilidad
- Mismo GLB (idéntico al incrustado en la v4) y mismos clips de animación.
- Estructura de carpetas sin cambios.

## Validación realizada
- `node --check` sobre `main.js`, `GamepadController.js` y `CyborgController.js`.
- Comparación línea a línea de `main.js` con el script de la v4: solo difieren el cableado modular (controlador, mando, carga del GLB).

## Pendiente
- Prueba visual en el navegador ya publicado y con mando físico.
