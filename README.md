# Dados D&D

App móvil (PWA) para guardar y hacer tiradas de D&D: pruebas, salvaciones, hechizos con sus tiradas de ataque y daño, ventaja/desventaja e historial. Todo se guarda en el propio dispositivo, sin servidor.

## Arrancar

```bash
npm install
npm run dev      # desarrollo; muestra una URL de red para abrirla desde el móvil
npm test         # pruebas del motor de dados
npm run build    # genera la carpeta dist/
npm run preview  # sirve dist/ para probar la PWA
```

Requiere Node 18 o superior.

## Instalarla en el móvil

Una PWA solo se puede instalar desde una dirección HTTPS. Sube la carpeta `dist/` a cualquier hosting estático (Netlify, Vercel, Cloudflare Pages, GitHub Pages) y abre la URL en el móvil:

- Android (Chrome): menú ⋮ → "Instalar aplicación".
- iPhone (Safari): botón compartir → "Añadir a pantalla de inicio".

Una vez instalada funciona sin conexión.

## Atajos en las fórmulas

En los hechizos y en la fórmula libre puedes escribir atajos que se calculan con el personaje activo, así las tiradas se actualizan solas al subir de nivel o cambiar una característica:

| Atajo | Valor |
| --- | --- |
| `@atq` | competencia + mod. de la característica de conjuros |
| `@mod` | mod. de la característica de conjuros |
| `@prof` | bonificador de competencia |
| `@nivel` | nivel del personaje |
| `@fue` `@des` `@con` `@int` `@sab` `@car` | modificador de cada característica |

Ejemplos: `1d20+@atq` (ataque de conjuro), `8d6` (bola de fuego), `2d10+@mod`, `3d4+3`.

Ventaja y desventaja se eligen arriba del todo y afectan al primer `1d20` de la tirada.

## Estructura

```
src/
  dice.js          motor de dados (parseo y tiradas)
  character.js     atajos @, salvaciones y habilidades
  data.js          características, habilidades y mago de ejemplo
  store.js         estado + guardado en localStorage
  App.jsx          cabecera, navegación y lógica de tirada
  components/      pantallas (Personaje, Conjuros, Dados, Historial) y hoja de resultado
```

## Copia de seguridad

Los datos viven en `localStorage` bajo la clave `dados-dnd:v1`. Si borras los datos del sitio en el navegador, se pierden.
