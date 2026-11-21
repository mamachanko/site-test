# Signal Lab

A browser-based broadcast monitor with seven color bars, grayscale steps, a circular resolution card, and a simulated CRT. Open `site/index.html` locally or visit the [GitHub Pages site](https://mamachanko.github.io/site-test/).

| Key | Control |
| --- | --- |
| R | Toggle character rain |
| M | Toggle receiver hum and interference audio |
| P | Pause or resume motion and automatic interference |
| F | Toggle fullscreen |
| G | Trigger a burst of interference |

Audio starts muted. The monitor starts paused when the device requests reduced motion.

## Character background

The [Ponytail homepage](https://ponytail.dev/) exposes a pause control for its animation. Its browser scripts were unavailable from the build environment, so the glyph rendering technique here is a reconstruction of the requested character-rain effect.

Signal Lab uses two Canvas 2D layers. Each column has a staggered starting row, a fall speed, and a trail length. The renderer advances the head by whole character cells, picks glyphs from a stable per-column sequence, and steps down the brightness along the trail. The outer field uses green glyphs, while a denser, paler layer is composited over the test card. Screen-space scanlines, a vignette, and a brief rolling band of displaced video and static complete the CRT effect.

The site uses plain HTML, CSS, and JavaScript. The existing GitHub Actions workflow serves the `site/` directory.
