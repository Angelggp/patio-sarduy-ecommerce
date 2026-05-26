# Botanical Park Design System

Version: 1.0
Product: E-commerce de plantas y accesorios
Visual direction: Organic premium retail

## 1. Brand Concept

### Core idea
Un vivero contemporaneo que combina frescura natural con precision editorial.

### Personality
- Sereno
- Curado
- Vital
- Cercano

### Signature memory
El usuario debe recordar tres cosas: verdes vivos sobre base neutra, contenedores amplios con bordes redondeados y fotografia inmersiva de naturaleza.

## 2. Art Direction

### Aesthetic keywords
Organic, airy, soft depth, premium utility, tactile calm.

### Composition rules
- Secciones con mucho aire y separaciones amplias.
- Bloques grandes con radio alto (hero, newsletter, cards).
- Jerarquia clara: titulo fuerte, subtitulo suave, CTA verde brillante.
- Contraste por masa: fondos claros extensos y modulos oscuros puntuales.

## 3. Color System

## 3.1 Core Tokens
Definir estas variables en :root.

- --bg-canvas: #f1f2f1
- --bg-surface: #ffffff
- --bg-soft-mint: #dfe9e2
- --bg-deep-forest: #082715
- --bg-overlay-dark: rgba(0, 0, 0, 0.30)

- --brand-primary: #22d35f
- --brand-primary-hover: #14bd4f
- --brand-primary-press: #0f9f42
- --brand-primary-soft: #b6f3ca

- --text-strong: #0e1110
- --text-body: #4e5651
- --text-muted: #808983
- --text-on-dark: #f5f8f5

- --border-subtle: #d9dfdb
- --border-soft: #e6ebe8

- --status-success: #27bb63
- --status-warning: #eabf47
- --status-danger: #db5f5f

## 3.2 Gradient Tokens
- --gradient-newsletter: linear-gradient(115deg, #03210f 0%, #06331a 45%, #082a17 100%)
- --gradient-hero-vignette: linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.50) 100%)

## 3.3 Usage Ratios
- 70% neutrales claros
- 20% verdes oscuros y tonos de profundidad
- 10% acento verde brillante

## 4. Typography

## 4.1 Font Pairing
- Display: Clash Display (700, 600)
- Body/UI: Plus Jakarta Sans (400, 500, 600)

Fallback stack recomendada:
- Display: Clash Display, Satoshi, Segoe UI, sans-serif
- Body: Plus Jakarta Sans, Manrope, Segoe UI, sans-serif

## 4.2 Type Scale
- Display XL: 68/0.95/700
- Display L: 56/1.0/700
- H1: 46/1.05/700
- H2: 36/1.1/700
- H3: 28/1.15/600
- H4: 22/1.2/600
- Lead: 20/1.45/500
- Body M: 16/1.55/400
- Body S: 14/1.5/500
- Caption: 12/1.45/500

## 4.3 Typographic Behavior
- Headlines en color --text-strong o --text-on-dark.
- Subtitulos en --text-body con max-width para lectura comoda.
- Labels en mayusculas con tracking amplio para categorias.

## 5. Spacing and Layout

## 5.1 Spacing Scale
- 4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96

## 5.2 Containers
- Max width desktop: 1240px
- Horizontal padding desktop: 32px
- Horizontal padding tablet: 24px
- Horizontal padding mobile: 16px

## 5.3 Vertical Rhythm
- Seccion a seccion: 72px desktop, 56px tablet, 40px mobile
- Encabezado a contenido interno: 24px

## 6. Shape Language

### Radius tokens
- --radius-xs: 8px
- --radius-sm: 12px
- --radius-md: 16px
- --radius-lg: 22px
- --radius-xl: 28px
- --radius-pill: 999px

### Rules
- Hero y newsletter usan --radius-xl.
- Product cards usan --radius-md.
- Botones primarios y chips usan --radius-pill.

## 7. Elevation and Effects

### Shadow tokens
- --shadow-soft: 0 8px 24px rgba(12, 25, 16, 0.08)
- --shadow-card: 0 10px 28px rgba(8, 20, 12, 0.10)
- --shadow-float: 0 14px 38px rgba(5, 14, 8, 0.16)

### Overlays and textures
- En hero usar gradiente de viñeta para legibilidad de texto.
- En cards de categoria usar overlay oscuro al 20%-35% para texto blanco.

## 8. Motion System

### Timing
- Fast: 140ms
- Standard: 220ms
- Emphasized: 360ms

### Easing
- Standard: cubic-bezier(0.2, 0.0, 0.2, 1)
- Exit: cubic-bezier(0.4, 0.0, 1, 1)
- Bounce subtle: cubic-bezier(0.18, 1.02, 0.32, 1)

### Pattern rules
- Hover de card: translateY(-4px) + sombra mayor.
- Botones: escala 0.98 en press.
- Entradas de seccion: stagger vertical de 30ms entre elementos hermanos.

## 9. Component Specifications

## 9.1 Top Navigation
- Altura: 72px desktop, 64px mobile.
- Fondo: --bg-surface.
- Search bar: fondo gris suave, pill radius, icono al inicio.
- Icon buttons: 36x36, hover con fondo --bg-soft-mint.

## 9.2 Hero Banner
- Alto: 520px desktop, 420px tablet, 340px mobile.
- Imagen full-bleed con recorte central.
- Capa de gradiente para contraste de tipografia.
- CTA principal: verde solido.
- CTA secundario: fondo transparente con borde blanco o gris claro.

## 9.3 Category Cards
- Grid: 3 columnas desktop, 2 tablet, 1 mobile.
- Alto fijo recomendado: 250-280px.
- Imagen de alta calidad + overlay oscuro.
- Titulo en esquina inferior izquierda con peso 700.

## 9.4 Product Card
- Imagen producto superior con fondo claro.
- Metadata category en caption uppercase.
- Nombre en body semibold.
- Precio destacado con alto contraste.
- Boton de carrito circular verde en esquina inferior derecha.

## 9.5 Newsletter Block
- Contenedor oscuro con gradiente.
- Icono centrado arriba del titulo.
- Input y boton en linea desktop; stacked en mobile.
- Input oscuro translúcido, texto claro.

## 9.6 Footer
- Fondo claro neutro.
- 4 columnas desktop, 2 tablet, 1 mobile.
- Titulos de columna en semibold.
- Links en tono muted con hover a --text-strong.

## 10. Responsive Rules

### Breakpoints
- Mobile: 0-767px
- Tablet: 768-1023px
- Desktop: 1024px+
- Wide: 1360px+

### Behavior highlights
- Hero CTAs se apilan en mobile.
- Categories y product grid colapsan progresivamente.
- Reducir radio maximo en mobile para evitar look inflado.

## 11. Accessibility Standards

- Contraste minimo 4.5:1 para texto normal.
- Focus ring visible: 2px en --brand-primary con offset 2px.
- Targets tactiles: minimo 44x44.
- Inputs con estados: default, hover, focus, error, disabled.

## 12. Asset Direction

### Photography
- Plantas reales, macro hojas, tonos verdes profundos.
- Evitar recortes de baja resolucion o fondos saturados artificialmente.
- Mantener iluminacion suave, sombras naturales.

### Iconography
- Trazos limpios, grosor medio.
- Estilo minimalista, sin iconos overly cartoon.

## 13. Starter CSS Variables

Copiar esta base para iniciar rapido:

:root {
  --bg-canvas: #f1f2f1;
  --bg-surface: #ffffff;
  --bg-soft-mint: #dfe9e2;
  --bg-deep-forest: #082715;
  --brand-primary: #22d35f;
  --brand-primary-hover: #14bd4f;
  --text-strong: #0e1110;
  --text-body: #4e5651;
  --text-muted: #808983;
  --text-on-dark: #f5f8f5;
  --border-subtle: #d9dfdb;
  --radius-md: 16px;
  --radius-xl: 28px;
  --radius-pill: 999px;
  --shadow-card: 0 10px 28px rgba(8, 20, 12, 0.10);
  --gradient-newsletter: linear-gradient(115deg, #03210f 0%, #06331a 45%, #082a17 100%);
}

## 14. Implementation Priorities

1. Definir variables de color y tipografia.
2. Construir layout base con container y ritmo vertical.
3. Implementar hero y categories como piezas visuales clave.
4. Crear product cards y newsletter con estados interactivos.
5. Ajustar responsive y accesibilidad antes de animaciones finas.

## 15. Non-Negotiables

- No usar morados de gradiente generico.
- No usar Arial, Roboto, Inter como tipografia principal.
- No reducir el contraste para priorizar estilo.
- No usar radios inconsistentes entre componentes hermanos.
