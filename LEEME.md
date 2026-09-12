# Zapienz · sitio one-page

Sitio de una sola página para Zapienz, la app de Zaps en español.
HTML + CSS + JS sin librerías. Publicado en GitHub Pages.

## De dónde salen los datos
Todo lo numérico se consultó contra la base de producción de Zapienz
(Supabase, proyecto `zapienz`) el 12-sep-2026:

- **303 Zaps publicados** (`books` con `is_published`), 311 filas en total.
- **20 minutos de promedio**, rango real de 14 a 24 (`duration_minutes`).
- **Las diez categorías y sus conteos** suman exactamente 303.
- Las **dos reseñas** son las únicas con texto en el App Store de México,
  citadas literales y rotuladas como fragmento.

No hay teléfono, domicilio ni horario porque Zapienz no los tiene: es un
producto digital. Tampoco hay precios en el sitio; se remite a la ficha de
cada tienda, que es donde está el precio vigente.

⚠️ Regla de marca: **no se usa la palabra «resumen»**. Zapienz vende Zaps,
reseñas y podcast.

## Los videos
- `assets/video/hero-169.mp4|webm` — Seedance 2.0 (`dreamina-seedance-2-0`),
  1080p nativo, 16:9. Recortado y cerrado en bucle ping-pong con ffmpeg.
- `assets/video/hero-916.mp4` — Higgsfield `kling3_0`, 9:16, escalado a
  1080x1920 con lanczos. Corrida propia, no un recorte del horizontal.
- `assets/video/scroll-zap.mp4` — Higgsfield `kling3_0`, escalado a 1080p,
  con keyframes cada 4 cuadros para que el scrub por scroll sea fluido.

## Verificar en local
    node _servidor.js        # sirve en :4321 CON soporte Range (sin Range no hay scrub)
    node _verifica.js        # Chrome headless: hero, scrub, parallax, reduced-motion, enlaces
