const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 800;

let particles = [];
let currentElement = "water";
let temperature = 0;
let currentState = "solid";

const elementData = {
  water: { fusion: 0, boiling: 100, color: "#00BFFF" },
  oxygen: { fusion: -219, boiling: -183, color: "#A9A9A9" },
  argon: { fusion: -189, boiling: -186, color: "#98FB98" },
  neon: { fusion: -248, boiling: -246, color: "#FF69B4" },
};

class Particle {
  constructor(x, y, radius = 7) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
  }

  update() {
    let minX = 50, maxX = canvas.width - 50;
    let minY = 50, maxY = canvas.height - 50;
  
    if (currentState === 'liquid') {
      minX = 320; maxX = canvas.width - 320;
      minY = 320; maxY = canvas.height - 320;
    }
  
    this.x += this.vx * (1 + temperature / 100);
    this.y += this.vy * (1 + temperature / 100);
  
    if (this.x < minX + this.radius || this.x > maxX - this.radius) {
      this.vx *= -1;
    }
    if (this.y < minY + this.radius || this.y > maxY - this.radius) {
      this.vy *= -1;
    }
  }
  

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = elementData[currentElement].color;
    ctx.fill();
    ctx.closePath();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    particles.push(new Particle(x, y));
  }
}

function graduallyArrangeInGrid() {
  const cols = 10;
  const spacing = 12;
  const offsetX = (canvas.width - cols * spacing) / 2;
  const offsetY = (canvas.height - cols * spacing) / 2;

  particles.forEach((p, i) => {
    const targetX = offsetX + (i % cols) * spacing;
    const targetY = offsetY + Math.floor(i / cols) * spacing;

    const interval = setInterval(() => {
      p.x += (targetX - p.x) * 0.2;
      p.y += (targetY - p.y) * 0.2;

      if (Math.abs(p.x - targetX) < 0.5 && Math.abs(p.y - targetY) < 0.5) {
        p.x = targetX;
        p.y = targetY;
        clearInterval(interval);
      }
    }, 20);
  });
}

function updateState() {
  const data = elementData[currentElement];
  let newState = "";

  if (temperature < data.fusion) {
    newState = "solid";
  } else if (temperature >= data.fusion && temperature < data.boiling) {
    newState = "liquid";
  } else {
    newState = "gas";
  }

  if (newState !== currentState || newState === "solid") {
    currentState = newState;

    if (currentState === "solid") {
      graduallyArrangeInGrid();
    }

    if (currentState === "liquid") {
      const minX = 320, maxX = canvas.width - 320;
      const minY = 320, maxY = canvas.height - 320;

      particles.forEach(p => {
        // Reposiciona aleatoriamente dentro da área líquida
        p.x = Math.random() * (maxX - minX) + minX;
        p.y = Math.random() * (maxY - minY) + minY;
      });
    }

    document.getElementById("stateLabel").textContent =
      currentState.charAt(0).toUpperCase() + currentState.slice(1);
  }
}


function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    if (currentState !== "solid") p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

document.getElementById("temperature").addEventListener("input", (e) => {
  temperature = parseInt(e.target.value);
  document.getElementById("tempValue").textContent = temperature;
  updateState();
});

document.getElementById("element").addEventListener("change", () => {
  changeElement();
});

document.getElementById("solidBtn").addEventListener("click", () => {
  temperature = elementData[currentElement].fusion - 10;
  document.getElementById("temperature").value = temperature;
  document.getElementById("tempValue").textContent = temperature;
  updateState();
});

document.getElementById("liquidBtn").addEventListener("click", () => {
  const data = elementData[currentElement];
  temperature = data.fusion + (data.boiling - data.fusion) / 2;
  document.getElementById("temperature").value = temperature;
  document.getElementById("tempValue").textContent = temperature;
  updateState();
});

document.getElementById("gasBtn").addEventListener("click", () => {
  temperature = elementData[currentElement].boiling + 10;
  document.getElementById("temperature").value = temperature;
  document.getElementById("tempValue").textContent = temperature;
  updateState();
});

function changeElement() {
  currentElement = document.getElementById("element").value;
  const fusionPoint = elementData[currentElement].fusion;
  temperature = fusionPoint - 10;

  document.getElementById("temperature").value = temperature;
  document.getElementById("tempValue").textContent = temperature;

  updateState();
  initParticles();

  if (currentState === "solid") {
    graduallyArrangeInGrid();
  }
}

initParticles();
updateState();
animate();