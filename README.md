# TV Test Screen

A viewport-filling TV test pattern with seven color bars, grayscale steps, a circular resolution card, and occasional CRT interference. Open `site/index.html` locally or visit the [GitHub Pages site](https://mamachanko.github.io/site-test/).

With reduced motion enabled, the screen shows a still frame.

## Character background

The [Ponytail homepage](https://ponytail.dev/) exposes a pause control for its animation. Its browser scripts were unavailable from the build environment, so the glyph rendering technique here is a reconstruction of the requested character-rain effect.

The Canvas 2D renderer draws glyphs directly over the test pattern. Each column has a staggered starting row, a fall speed, and a trail length. The renderer advances the head by whole character cells, picks glyphs from a stable per-column sequence, and steps down the brightness along the trail. Scanlines, a vignette, and a brief rolling band of displaced video and static complete the CRT effect.

The site uses plain HTML, CSS, and JavaScript. The existing GitHub Actions workflow serves the `site/` directory.
