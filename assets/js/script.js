window.addEventListener("load", function () {
  const loader = document.getElementById("preloader");
  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
  }, 500);
});

function toggleLanguageMenu() {
  const menu = document.getElementById("languageMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function (e) {
  const menu = document.getElementById("languageMenu");
  const button = document.querySelector(".language-toggle");
  if (!menu.contains(e.target) && !button.contains(e.target)) {
    menu.style.display = "none";
  }
});
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomColor() {
  const hues = [280, 300, 320, 220, 240, 260];
  const lightness = rand(30, 70);
  const hue = hues[Math.floor(Math.random() * hues.length)];
  return `hsl(${hue}, 100%, ${lightness}%)`;
}

function createPixel(x, y, color, speed, delay, delayHide, step, boundSize) {
  const maxSizeAvailable = boundSize || 2;
  const minSize = 0.5;
  const maxSize = rand(minSize, maxSizeAvailable);

  let size = 0;
  let sizeStep = rand(0, 0.5);
  let sizeDirection = 1;

  let counter = 0;
  let counterHide = 0;

  let isHidden = false;
  let isFlicking = false;

  return {
    x,
    y,
    color,
    speed: rand(0.1, 0.9) * speed,

    show() {
      isHidden = false;
      counterHide = 0;

      if (counter <= delay) {
        counter += step;
        return;
      }

      if (size >= maxSize) {
        isFlicking = true;
      }

      if (isFlicking) {
        this.flicking();
      } else {
        size += sizeStep;
      }
    },

    hide() {
      counter = 0;

      if (counterHide <= delayHide) {
        counterHide += step;
        if (isFlicking) {
          this.flicking();
        }
        return;
      }

      isFlicking = false;

      if (size <= 0) {
        size = 0;
        isHidden = true;
        return;
      } else {
        size -= 0.05;
      }
    },

    flicking() {
      if (size >= maxSize) {
        sizeDirection = -1;
      } else if (size <= minSize) {
        sizeDirection = 1;
      }
      size += sizeDirection * this.speed;
    },

    draw(ctx) {
      const centerOffset = maxSizeAvailable * 0.5 - size * 0.5;
      ctx.fillStyle = color;
      ctx.fillRect(x + centerOffset, y + centerOffset, size, size);
    },

    get isHidden() {
      return isHidden;
    },
  };
}

const container = document.querySelector(".custom-block-container");
const canvas = document.createElement("canvas");
container.appendChild(canvas);

const ctx = canvas.getContext("2d");

let width = container.clientWidth;
let height = container.clientHeight;

canvas.width = width;
canvas.height = height;

let pixels = [];
let request;
let ticker = 0;
let direction = 1;

function getDelay(x, y) {
  let dx = x - width / 2;
  let dy = y - height / 2;
  return Math.sqrt(dx * dx + dy * dy);
}

function initPixels() {
  pixels = [];
  const gap = 10;
  const step = 1;
  const speed = rand(0.01, 0.15);
  const boundSize = 4;

  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {
      const color = getRandomColor();
      const delay = getDelay(x, y);
      const delayHide = getDelay(x, y);
      pixels.push(
        createPixel(x, y, color, speed, delay, delayHide, step, boundSize)
      );
    }
  }
}

function animate() {
  request = requestAnimationFrame(animate);

  ctx.clearRect(0, 0, width, height);

  let allHidden = true;

  pixels.forEach((p) => {
    if (direction > 0) {
      p.show();
    } else {
      p.hide();
      allHidden = allHidden && p.isHidden;
    }
    p.draw(ctx);
  });

  ticker += direction;

  if (ticker >= 300) {
    direction = -1;
  } else if (ticker <= 0 && allHidden) {
    direction = 1;
  }
}

function resizeCanvas() {
  width = container.clientWidth;
  height = container.clientHeight;
  canvas.width = width;
  canvas.height = height;
  initPixels();
}

resizeCanvas();
animate();

window.addEventListener("resize", resizeCanvas);

document.addEventListener("click", () => {
  resizeCanvas();
  ticker = 0;
  direction = 1;
});
