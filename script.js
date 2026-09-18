const dataInput = document.getElementById("dataInput");
const generateBtn = document.getElementById("generateBtn");
const errorBox = document.getElementById("error");
const charts = document.getElementById("charts");

function validBits(bits) {
  return /^[01]+$/.test(bits);
}

function unipolarNRZ(bits) {
  const t = [];
  const y = [];

  bits.split("").forEach((bit, i) => {
    const value = Number(bit);
    t.push(i, i + 1);
    y.push(value, value);
  });

  return [t, y];
}

function polarNRZL(bits) {
  const t = [];
  const y = [];

  bits.split("").forEach((bit, i) => {
    const value = bit === "1" ? 1 : -1;
    t.push(i, i + 1);
    y.push(value, value);
  });

  return [t, y];
}

function polarNRZI(bits) {
  const t = [];
  const y = [];

  let currentLevel = -1;

  bits.split("").forEach((bit, i) => {
    if (bit === "1") {
      currentLevel = -currentLevel;
    }

    t.push(i, i + 1);
    y.push(currentLevel, currentLevel);
  });

  return [t, y];
}

function polarRZ(bits) {
  const t = [];
  const y = [];

  bits.split("").forEach((bit, i) => {
    const value = bit === "1" ? 1 : -1;

    t.push(i, i + 0.5, i + 0.5, i + 1);
    y.push(value, value, 0, 0);
  });

  return [t, y];
}

function manchester(bits) {
  const t = [];
  const y = [];

  bits.split("").forEach((bit, i) => {
    if (bit === "1") {
      t.push(i, i + 0.5, i + 0.5, i + 1);
      y.push(-1, -1, 1, 1);
    } else {
      t.push(i, i + 0.5, i + 0.5, i + 1);
      y.push(1, 1, -1, -1);
    }
  });

  return [t, y];
}

function differentialManchester(bits) {
  const t = [];
  const y = [];

  let currentLevel = 1;

  bits.split("").forEach((bit, i) => {
    if (bit === "0") {
      currentLevel = -currentLevel;
    }

    t.push(i, i + 0.5);
    y.push(currentLevel, currentLevel);

    currentLevel = -currentLevel;

    t.push(i + 0.5, i + 1);
    y.push(currentLevel, currentLevel);
  });

  return [t, y];
}

function ami(bits) {
  const t = [];
  const y = [];

  let polarity = 1;

  bits.split("").forEach((bit, i) => {
    const value = bit === "1" ? polarity : 0;

    t.push(i, i + 1);
    y.push(value, value);

    if (bit === "1") {
      polarity = -polarity;
    }
  });

  return [t, y];
}

function drawChart(title, pair, labels, signed) {
  const card = document.createElement("div");
  card.className = "chart-card";

  const canvas = document.createElement("canvas");
  card.appendChild(canvas);
  charts.appendChild(card);

  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(680, charts.clientWidth - 20);
  const height = 155;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const values = [];

  for (let i = 0; i < pair[1].length; i += 2) {
    values.push(pair[1][i]);
  }

  const left = 80;
  const right = 18;
  const top = 30;
  const bottom = 20;
  const plotWidth = width - left - right;
  const step = plotWidth / values.length;

  const high = top + 15;
  const zero = top + 62;
  const low = top + 109;

  ctx.clearRect(0, 0, width, height);

  if (labels) {
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#111";
    ctx.textAlign = "center";

    values.forEach((value, i) => {
      ctx.fillText(
        String(value),
        left + step * (i + 0.5),
        13
      );
    });
  }

  ctx.strokeStyle = "rgba(128,128,128,0.5)";
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;

  for (let i = 0; i <= values.length; i++) {
    const x = left + step * i;

    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, height - bottom);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  ctx.strokeStyle = "#777";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(left, zero);
  ctx.lineTo(left + plotWidth, zero);
  ctx.stroke();

  ctx.fillStyle = "#333";
  ctx.font = "12px Arial";
  ctx.textAlign = "right";

  ctx.fillText("1", left - 9, high);
  ctx.fillText("0", left - 9, zero);

  if (signed) {
    ctx.fillText("-1", left - 9, low);
  }

  function level(value) {
    if (value > 0) return high;
    if (value < 0) return low;
    return zero;
  }

  ctx.strokeStyle = "#1f77b4";
  ctx.lineWidth = 2.5;
  ctx.beginPath();

  values.forEach((value, i) => {
    const x1 = left + step * i;
    const x2 = left + step * (i + 1);
    const currentY = level(value);

    if (i === 0) {
      ctx.moveTo(x1, currentY);
    } else {
      const previousY = level(values[i - 1]);

      if (previousY !== currentY) {
        ctx.lineTo(x1, previousY);
        ctx.lineTo(x1, currentY);
      }

      ctx.moveTo(x1, currentY);
    }

    ctx.lineTo(x2, currentY);
  });

  ctx.stroke();

  ctx.fillStyle = "#222";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.fillText(title, 8, height / 2);
}

function generate() {
  const bits = dataInput.value.trim();

  errorBox.textContent = "";

  if (!validBits(bits)) {
    errorBox.textContent = "Enter a binary sequence containing only 0 and 1.";
    return;
  }

  document.getElementById("dataResult").textContent = bits;
  document.getElementById("countResult").textContent = bits.length;

  charts.innerHTML = "";

  const encodings = [
    ["Unipolar NRZ", unipolarNRZ(bits), false],
    ["Polar NRZ-L", polarNRZL(bits), true],
    ["Polar NRZ-I", polarNRZI(bits), true],
    ["Polar RZ", polarRZ(bits), true],
    ["Manchester", manchester(bits), true],
    ["Diff Manchester", differentialManchester(bits), true],
    ["AMI", ami(bits), true]
  ];

  encodings.forEach(([title, pair, signed]) => {
    drawChart(title, pair, true, signed);
  });
}

generateBtn.addEventListener("click", generate);

dataInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    generate();
  }
});

generate();
