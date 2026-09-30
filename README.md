# 0scar07.github.io

Portafolio personal de **Oscar David Llanos Luna**, desarrollador de apps móviles y web. Publicado en https://0scar07.github.io

Sitio estático (HTML, CSS y JavaScript sin frameworks ni build) servido por GitHub Pages.

## Estructura

```
index.html        contenido completo (funciona sin JavaScript)
styles.css        estilos
main.js           movimiento: fondo vivo, revelados, contadores, lightbox
assets/img/       capturas reales de los proyectos en WebP + og.png
assets/favicon.svg
tools/            scripts de desarrollo (no se usan en la web)
.nojekyll         evita que GitHub Pages procese el sitio con Jekyll
```

## Editar

- **Sobre mí:** busca `<!-- EDITAR -->` en `index.html`.
- **Foto en lugar del monograma:** guarda `assets/img/foto.webp` y reemplaza el contenido de `<div class="mono__inner">` por
  `<img src="assets/img/foto.webp" alt="Oscar Llanos" class="mono__photo">`.
- **Íconos:** el sprite SVG va dentro de `index.html`. Para añadir uno, pon el SVG en `tools/icons/` y ejecuta `python tools/build_sprite.py`.
- Tras cambiar CSS o JS, sube el número `?v=` en `index.html` para evitar caché.

## Ver en local

```bash
python -m http.server 8790
```

Íconos de tecnologías: [Simple Icons](https://simpleicons.org) (CC0).
