"use strict";

const screen = document.getElementById("screen");
const raster = document.getElementById("raster");
const interference = document.getElementById("interference");
const video = raster.getContext("2d");
const noise = interference.getContext("2d");
const testCard = document.createElement("canvas");
const card = testCard.getContext("2d");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const random = (min, max) => min + Math.random() * (max - min);
const horizontalBars = (context, colors, x, y, width, height) => {
  const stripe = width / colors.length;
  colors.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(x + stripe * index, y, stripe + .5, height);
  });
};

function drawTestCard(width, height) {
  const colors = ["#b8c0ad", "#d9b341", "#54a9a4", "#66955a", "#a96691", "#bd574e", "#4d67a4"];
  horizontalBars(card, colors, 0, 0, width, height);
  horizontalBars(card, ["#4d67a4", "#212b25", "#a96691", "#212b25", "#54a9a4", "#212b25", "#b8c0ad"], 0, height * .69, width, height * .12);
  horizontalBars(card, ["#293e52", "#e0ddc8", "#39304c", "#141a16", "#131913", "#252e26", "#121813"], 0, height * .81, width, height * .19);

  const checker = width / 24;
  for (let column = 0; column < 24; column++) {
    card.fillStyle = column % 2 ? "#a8b1a1" : "#1b211d";
    card.fillRect(column * checker, 0, checker + .5, height * .055);
    card.fillStyle = column % 2 ? "#1b211d" : "#777f73";
    card.fillRect(column * checker, height * .945, checker + .5, height * .055);
  }

  card.strokeStyle = "#18231d42";
  card.lineWidth = 1;
  card.beginPath();
  for (let column = 1; column < 24; column++) {
    const x = column * checker;
    card.moveTo(x, 0);
    card.lineTo(x, height);
  }
  for (let row = 1; row < 12; row++) {
    const y = row * height / 12;
    card.moveTo(0, y);
    card.lineTo(width, y);
  }
  card.stroke();

  const radius = Math.min(height * .425, width * .45);
  card.save();
  card.translate(width / 2, height / 2);
  card.beginPath();
  card.arc(0, 0, radius, 0, Math.PI * 2);
  card.clip();
  card.scale(radius / 100, radius / 100);

  card.fillStyle = "#232b24";
  card.fillRect(-100, -100, 200, 200);
  horizontalBars(card, ["#332f3a", "#82877a", "#b1b3a0", "#e1ddc5", "#b1b3a0", "#82877a", "#332f3a"], -100, -100, 200, 24);
  horizontalBars(card, colors, -100, -75, 200, 42);
  horizontalBars(card, ["#151b16", "#4b5147", "#777c6d", "#9da090", "#c7c8b4", "#dedac1"], -100, -33, 200, 14);
  card.fillStyle = "#151b15";
  card.fillRect(-100, -19, 200, 38);
  horizontalBars(card, ["#dedac1", "#c7c8b4", "#9da090", "#777c6d", "#4b5147", "#151b16"], -100, 19, 200, 13);
  card.fillStyle = "#20291f";
  card.fillRect(-100, 32, 200, 39);

  for (const [left, pitch, count] of [[-91, 7, 5], [-51, 5, 7], [-11, 4, 8], [28, 3, 11], [67, 2, 16]]) {
    card.fillStyle = "#c7ccaf";
    for (let i = 0; i < count; i++) {
      card.fillRect(left + i * pitch, 36, pitch / 2, 31);
    }
  }
  horizontalBars(card, ["#a8574f", "#ac9b4f", "#d8d9c0", "#507f72", "#60658b"], -100, 72, 200, 28);

  card.lineWidth = 2;
  card.strokeStyle = "#d1d8b7";
  card.beginPath();
  card.arc(0, 0, 98.4, 0, Math.PI * 2);
  card.stroke();
  card.restore();

  card.strokeStyle = "#e1e4c9a0";
  card.lineWidth = 1;
  const tick = Math.max(5, radius * .075);
  const gap = radius + tick;
  const x = width / 2;
  const y = height / 2;
  card.beginPath();
  card.moveTo(x - gap - tick, y);
  card.lineTo(x - gap, y);
  card.moveTo(x + gap, y);
  card.lineTo(x + gap + tick, y);
  card.moveTo(x, y - gap - tick);
  card.lineTo(x, y - gap);
  card.moveTo(x, y + gap);
  card.lineTo(x, y + gap + tick);
  card.stroke();
}

const glyphs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+-×=/:;<>[]{}░▒";
const glyphAt = (key) => {
  const hash = Math.imul(key ^ (key >>> 16), 0x45d9f3b);
  return glyphs[(hash >>> 0) % glyphs.length];
};

function makeRain(width, height, cell, density) {
  const rows = Math.ceil(height / cell);
  return {
    cell,
    rows,
    columns: Array.from({ length: Math.ceil(width / cell) }, (_, column) => {
      if (Math.random() > density) return null;
      return {
        x: (column + .5) * cell,
        length: Math.round(random(6, 19)),
        offset: Math.floor(random(0, rows + 30)),
        speed: random(4, 15),
        seed: Math.round(random(1000, 100000)),
      };
    }).filter(Boolean),
  };
}

function drawRain(context, field, time, colors) {
  context.font = `${field.cell * .8}px monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (const { x, length, offset, speed, seed } of field.columns) {
    const step = Math.floor(time * speed) + offset;
    const cycle = field.rows + length + 16;
    const head = step % cycle;
    const pass = Math.floor(step / cycle);
    for (let tail = 0; tail < length; tail++) {
      const row = head - tail;
      if (row < 0 || row >= field.rows) continue;
      const brightness = tail === 0 ? 0 : 1 + Math.floor(3 * tail / length);
      context.fillStyle = colors[brightness];
      context.fillText(glyphAt(seed + row * 131 + pass * 997 + (tail === 0 ? step : 0)), x, (row + .5) * field.cell);
    }
  }
}

const screenColors = ["#edffdbd9", "#d4ffd08a", "#c3f0ba60", "#9ed49b38"];

let width = 0;
let height = 0;
let ratio = 1;
let screenRain;
let animation = 0;
let rainTime = 0;
let lastTick = 0;
let nextGlitch = Infinity;
let glitchStart = 0;
let glitchEnd = 0;

function sizeCanvas(canvas, context, cssWidth, cssHeight) {
  canvas.width = Math.max(1, Math.round(cssWidth * ratio));
  canvas.height = Math.max(1, Math.round(cssHeight * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function resize() {
  ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = screen.clientWidth;
  height = screen.clientHeight;
  if (!width || !height) return;

  sizeCanvas(raster, video, width, height);
  sizeCanvas(interference, noise, width, height);
  sizeCanvas(testCard, card, width, height);
  drawTestCard(width, height);

  screenRain = makeRain(width, height, width < 500 ? 10 : 14, .82);
  paint(performance.now());
}

function paint(now) {
  if (!screenRain) return;
  video.drawImage(testCard, 0, 0, width, height);
  drawRain(video, screenRain, rainTime, screenColors);

  noise.clearRect(0, 0, width, height);
  if (now >= glitchEnd) return;

  const progress = (now - glitchStart) / (glitchEnd - glitchStart);
  const bandHeight = Math.max(8, height * .095);
  const bandY = Math.max(0, Math.min(height - bandHeight, height * (.12 + progress * .78)));
  const offset = width * random(-.04, .04);
  noise.fillStyle = "#101511ad";
  noise.fillRect(0, bandY, width, bandHeight);
  noise.drawImage(raster, 0, Math.round(bandY * ratio), raster.width, Math.max(1, Math.floor(bandHeight * ratio)), offset, bandY, width, bandHeight);

  for (let i = 0; i < 110; i++) {
    noise.fillStyle = i % 3 === 0 ? "#e1efcd78" : "#111a14ab";
    noise.fillRect(random(0, width), random(bandY, bandY + bandHeight), random(1, 23), random(1, 3));
  }
  for (let i = 0; i < 42; i++) {
    noise.fillStyle = i % 2 ? "#ebf4df70" : "#161c17a0";
    noise.fillRect(random(0, width), random(0, height), random(1, 5), 1);
  }
}

function startGlitch(now) {
  glitchStart = now;
  glitchEnd = now + 620;
  nextGlitch = now + random(9500, 17500);
}

function tick(now) {
  const elapsed = now - lastTick;
  if (elapsed >= 1000 / 24) {
    rainTime += Math.min(elapsed, 100) / 1000;
    lastTick = now;
    if (now >= nextGlitch) startGlitch(now);
    paint(now);
  }
  animation = requestAnimationFrame(tick);
}

function restartMotion() {
  cancelAnimationFrame(animation);
  lastTick = performance.now();
  nextGlitch = lastTick + random(7200, 11000);
  glitchEnd = 0;
  paint(lastTick);
  if (!reducedMotion.matches && !document.hidden) animation = requestAnimationFrame(tick);
}

document.addEventListener("visibilitychange", restartMotion);
reducedMotion.addEventListener("change", restartMotion);

new ResizeObserver(resize).observe(screen);
restartMotion();
