# Bennlärk - Landing Page

## Descripción
Landing page corporativa para **Bennlärk**, una startup de emprendedores que ofrece:

1. **Formación sobre inversiones** para gente normal (no financiera), usando estadística y matemáticas aplicadas
2. **Gestión de inversiones** para clientes que quieren delegar la administración de su capital

## Tecnologías
- HTML5, CSS3, JavaScript vanilla
- Fuentes: Inter, Space Grotesk, Cormorant Garamond (Google Fonts)
- Iconos: Font Awesome 6.5
- Sin frameworks ni dependencias

## Estructura
```
ProyectoBenlärk/
├── index.html           # Página principal (landing)
├── aviso-legal.html     # Aviso legal, devoluciones, términos
├── style.css            # Estilos completos
├── script.js            # JS: preloader, scroll reveals, FAQ accordion, navbar, contadores, menú móvil
├── CONTEXT.md           # Este archivo
├── archivo.txt          # Contenido fuente de "Sobre nosotros" y catálogo de servicios
├── assets/
│   ├── Logo Bennlärk.jpeg
│   └── fondo.mp4        # Video de fondo del hero
└── (briefing.html copiado a Documents/)
```

## Archivos de contenido fuente
- `archivo.txt` → Contiene el texto de "Sobre Nosotros" y el catálogo de servicios. Ya integrado en la landing.
- `briefing.html` → Se copió a `C:\Users\segol\Documents\briefing.html` (no está en el proyecto).

## Referencias
- 📎 Ejemplo de referencia (estilo que gusta): https://www.lathos.es/
- 🌐 Página anterior: https://www.bennlark.com/

### Análisis de lathos.es (inspiración)

**Secciones que tiene:**
1. Hero con video bg, overlay gradient, texto grande, marquee de logo+texto en bucle
2. "This is Lathos" - sección about con texto destacado
3. Trust bar con logos de empresas en marquee infinito (con mask-image fade edges)
4. Stats/contadores (alumnos, renovación, profesionales, soporte 24/7)
5. Casos de éxito (slider con quote principal + testimonios en thumbnail slider)
6. Formaciones/servicios (slider horizontal con cards de imagen bg, glass blur overlay, badge, bullets, CTA)
7. Pilares/valores (grid 5 columnas con número, título y descripción + video decorativo)
8. Peel reveal section (eventos/workshops con efecto visual y mix-blend-mode)
9. FAQ (acordeón en 2 columnas: contacto + preguntas)
10. Contacto con imagen parallax y CTA a WhatsApp
11. Footer multi-columna con video logo, enlaces legales

**Animaciones/efectos clave a copiar:**
| Efecto | Cómo lo hace lathos |
|---|---|
| Glassmorphism | `backdrop-filter: blur(15px)` en navbar, botones, cards, sliders |
| Marquee logos | `mask-image: linear-gradient(90deg, transparent, black 10% 90%, transparent)` en rows |
| Hero overlay | `linear-gradient(transparent, black)` sobre video |
| Testimonial slider | `mask-image: linear-gradient(90deg, black 0% 70%, transparent 100%)` fade edge |
| Cards formación | Imagen bg + `backdrop-filter: blur(25px)` overlay + gradient oscuro |
| Botones | `transform: scale(0.95)` en active, `backdrop-filter: blur(12px)` en variantes |
| Mix blend mode | `mix-blend-mode: difference` en cursor personalizado y peel section |
| Transiciones | `cubic-bezier(0.22, 1, 0.36, 1)` en hover cards y botones |
| Escala en hover | `transform: scale(1.05)` en imágenes de cards |
| Rotación icono | `transform: rotate(-45deg)` en icono botón card hover |
| FAQ transición | `max-height` y `padding` animados con `cubic-bezier(0.16, 1, 0.3, 1)` |
| Typografía fluida | Todo con `clamp()` para escalado seamless |

**CSS de lathos (colores):**
```css
--base-100: #1a1a1a;  /* texto oscuro */
--base-200: #333;
--base-300: #666;
--base-400: #888;
--base-500: #aaa;
--base-600: #f7f7f7;
--base-700: #fff;
```
Usan **tema oscuro** con mucho blanco sobre negro, glassmorphism, y fondos con blur.

**Fonts lathos:** Suisse Int'l (custom, 4 variantes)
**Fonts Bennlärk:** Inter, Space Grotesk, Cormorant Garamond (Google Fonts)

**Secciones que Bennlärk NO tiene y podemos añadir:**
- [ ] Casos de éxito / testimonios con slider
- [ ] Efecto glassmorphism (backdrop-filter blur) en navbar, cards y botones
- [ ] Gradient overlay más sofisticado en hero video
- [ ] Mask-image fade en marquee y sliders
- [ ] Cards de servicios con imagen de fondo y overlay blur
- [ ] Sección peel reveal o similar interactiva
- [ ] Animación scale(0.95) en botones al hacer click (active)
- [ ] Custom cursor (opcional, desktop-only)

## Paleta de colores (Bennlärk actual)
| Variable | Color | Uso |
|---|---|---|
| `--bg-primary` | `#ffffff` | Fondo principal |
| `--bg-secondary` | `#f5f7fa` | Fondo secciones alternas |
| `--bg-card` | `#ffffff` | Fondo tarjetas |
| `--bg-card-hover` | `#f0f4ff` | Hover tarjetas |
| `--text-primary` | `#162747` | Texto principal / acentos |
| `--text-secondary` | `#4a5568` | Texto secundario |
| `--text-muted` | `#94a3b8` | Texto tenue |
| `--accent` | `#162747` | Color de acento (botones, enlaces) |
| `--accent-hover` | `#1e3a6b` | Hover de acento |
| `--gradient-1` | `135deg, #162747 → #2d5a9b` | Degradado principal |

Esquema: **tema claro** con azul marino (#162747) como color corporativo.

## Requisitos
- ✅ Totalmente responsive (mobile-first, 3 breakpoints: 1024px, 640px y base)
- ✅ Animaciones reveal al scroll
- ✅ Sin frameworks, solo HTML/CSS/JS vanilla

## Estado actual
- ✅ Landing completa y funcional
- ✅ Secciones: Hero (con video + tagline "Más que enseñar, formamos profesionales"), Trust Bar, About (texto ampliado del archivo.txt), Stats, Servicios (4 cards: Formación Cuantitativa, Planificación Financiera, Sistemas de Inversión, Consultoría Empresarial), Método (4 pilares), Testimonios, FAQ, Contacto (con mapa Google Maps embebido, sin redes sociales), Footer, Disclaimer legal
- ✅ Navegación sticky con efecto scroll
- ✅ Menú móvil responsive
- ✅ Animaciones reveal al hacer scroll
- ✅ Preloader animado
- ✅ Formulario de contacto con opción "Consultoría empresarial"

## Historial de cambios relevantes
- About: texto enriquecido desde archivo.txt, luego resumido a 2 párrafos por petición del usuario (no quiere muros de texto)
- Servicios: pasó de 3 a 4 cards (se añadió Consultoría Empresarial)
- Hero: añadido tagline "Más que enseñar, formamos profesionales"
- Contacto: eliminados enlaces a Instagram/X, añadido mapa de Google Maps embed (sin API key)
- archivo.txt: fuente de contenido para About y Servicios

## Preferencias del usuario (IMPORTANTE)
- ✅ Contenido **conciso y escaneable** — nada de párrafos largos. Si puso texto extenso, resumirlo.
- ✅ Diseño **limpio y corporativo** — nada superfluo. Prefiere calidad sobre cantidad.
- ✅ Sin dependencias ni frameworks — vanilla HTML/CSS/JS.
- ✅ Inspiración en lathos.es para animaciones y glassmorphism.
- ✅ Le gusta el feedback visual (hover, active, transiciones suaves).
- ✅ Tema claro con azul marino (#162747) como color corporativo.
- ✅ No quiere logos/atribuciones de terceros visibles en la página (social links, etc.).
- ✅ Usa PowerShell en Windows — no asumir comandos Unix.

## Convenciones usadas
- ✅ Navbar idéntico en todas las páginas (Inicio, Nosotros, Servicios, Método, FAQ, Contacto, Escríbenos). Si se crean nuevas páginas, deben mantener la misma estructura de navbar.
- ✅ WhatsApp: sin flotante, sin color verde corporativo. El botón "Escríbenos" en navbar usa el mismo estilo que el botón "Contacto" (fondo azul marino).
- ✅ En páginas secundarias (como aviso-legal.html), los enlaces del navbar apuntan a secciones de index.html (ej. index.html#servicios).

## Pendientes / ideas
- (pendiente de definir)

## Contacto
- Email: info@bennlark.com
- Razón social: Bennlärk S.L.
- CIF: B26976035
- Domicilio: Av. d'Alacant, 18-2, 46701, Gandía (Valencia)
