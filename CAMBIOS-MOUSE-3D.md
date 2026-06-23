# Control 3D con mouse

Se integró al proyecto final el movimiento de cámara utilizado en `graphics-visorHLines`.

## Controles

- **Arrastrar con el botón izquierdo:** rota la vista alrededor del modelo en los ejes horizontal y vertical.
- **Rueda del mouse:** acerca o aleja la cámara.
- **Doble clic:** restablece la vista frontal.
- **Shift + arrastrar horizontalmente:** mueve manualmente las manecillas del reloj.
- **Flechas del panel:** mantienen una rotación continua de la cámara mientras se sostienen.
- **Animar rotación:** inicia o detiene la animación de las manecillas.

## Archivos modificados

- `src/index.ts`: control de órbita, eventos Pointer Events, cámara sincronizada, zoom, restablecimiento y mejora del ciclo de animación.
- `index.html`: instrucciones visuales, cursor de arrastre y botón para restablecer la vista.
- `dist/src/*.js`: archivos JavaScript recompilados para ejecutar el proyecto directamente.
