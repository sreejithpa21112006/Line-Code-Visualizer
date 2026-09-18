const lineData = document.getElementById("lineData");
const lineGenerate = document.getElementById("lineGenerate");
const lineError = document.getElementById("lineError");
const lineCharts = document.getElementById("lineCharts");
const lineSummary = document.getElementById("lineSummary");

const dsssData = document.getElementById("dsssData");
const dsssPn = document.getElementById("dsssPn");
const dsssGenerate = document.getElementById("dsssGenerate");
const dsssError = document.getElementById("dsssError");
const dsssCharts = document.getElementById("dsssCharts");
const dsssSummary = document.getElementById("dsssSummary");

function validBits(s) {
  return /^[01]+$/.test(s.trim());
}

function nrz(bits, map) {
  const t = [], y = [];
  bits.split("").forEach((b, i) => {
    const v = map(b, i);
    t.push(i, i + 1);
    y.push(v, v);
  });
  return [t, y];
}

function unipolarNRZ(bits) {
  return nrz(bits, b => Number(b));
}

function polarNRZL(bits) {
  return nrz(bits, b => b === "1" ? 1 : -1);
}

function polarNRZI(bits) {
  const t = [], y = [];
  let level = 1;
  bits.split("").forEach((b, i) => {
    if (b === "1") level = -level;
    t.push(i, i + 1);
    y.push(level, level);
  });
  return [t, y];
}

function polarRZ(bits) {
  const t = [], y = [];
  bits.split("").forEach((b, i) => {
    const v = b === "1" ? 1 : -1;
    t.push(i, i + 0.5, i + 0.5, i + 1);
    y.push(v, v, 0, 0);
  });
  return [t, y];
}

function manchester(bits) {
  const t = [], y = [];
  bits.split("").forEach((b, i) => {
    const first = b === "1" ? 1 : -1;
    const second = -first;
    t.push(i, i + 0.5, i + 0.5, i + 1);
    y.push(first, first, second, second);
  });
  return [t, y];
}

function differentialManchester(bits) {
  const t = [], y = [];
  let level = 1;
  bits.split("").forEach((b, i) => {
    if (b === "0") level = -level;
    t.push(i, i + 0.5);
    y.push(level, level);
    level = -level;
    t.push(i + 0.5, i + 1);
    y.push(level, level);
  });
  return [t, y];
}

function ami(bits) {
  const t = [], y = [];
  let polarity = 1;
  bits.split("").forEach((b, i) => {
    const v = b === "1" ? polarity : 0;
    t.push(i, i + 1);
    y.push(v, v);
    if (b === "1") polarity = -polarity;
  });
  return [t, y];
}

function drawChart(cardTitle, values, duration, labels, mode) {
  const card = document.createElement("div");
  card.className = "chart-card";
  const canvas = document.createElement("canvas");
  card.appendChild(canvas);

  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(680, card.parentElement ? card.parentElement.clientWidth - 20 : 900);
  const height = 155;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = "100%";
  canvas.style.height = height + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const left = 75;
  const right = 18;
  const top = labels ? 31 : 17;
  const bottom = 20;
  const plotW = width - left - right;
  const count = values.length;
  const step = plotW / count;

  const levels = mode === "signed" ? {high: top + 14, zero: top + 61, low: top + 108}
                                  : {high: top + 14, zero: top + 108, low: top + 108};

  ctx.clearRect(0, 0, width, height);

  if (labels) {
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#111";
    ctx.textAlign = "center";
    values.forEach((v, i) => {
      const label = typeof v === "number" ? v : String(v);
      ctx.fillText(label, left + step * (i + 0.5), 12);
    });
  }

  ctx.strokeStyle = "rgba(128,128,128,0.5)";
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;

  for (let i = 0; i <= count; i++) {
    const x = left + step * i;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, height - bottom);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  const y = v => {
    if (v > 0) return levels.high;
    if (v < 0) return levels.low;
    return levels.zero;
  };

  ctx.strokeStyle = "#777";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, levels.zero);
  ctx.lineTo(left + plotW, levels.zero);
  ctx.stroke();

  ctx.fillStyle = "#333";
  ctx.font = "12px Arial";
  ctx.textAlign = "right";
  ctx.fillText("1", left - 9, levels.high);
  ctx.fillText("0", left - 9, levels.zero);
  if (mode === "signed") ctx.fillText("-1", left - 9, levels.low);

  ctx.strokeStyle = "#1f77b4";
  ctx.lineWidth = 2.5;
  ctx.beginPath();

  values.forEach((v, i) => {
    const x1 = left + step * i;
    const x2 = left + step * (i + 1);
    const yy = y(v);

    if (i === 0) {
      ctx.moveTo(x1, yy);
    } else {
      const previous = y(values[i - 1]);
      if (previous !== yy) {
        ctx.lineTo(x1, previous);
        ctx.lineTo(x1, yy);
      }
      ctx.moveTo(x1, yy);
    }
    ctx.lineTo(x2, yy);
  });

  ctx.stroke();

  ctx.fillStyle = "#222";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.fillText(cardTitle, 8, height / 2);

  return card;
}

function addLineChart(title, pair, labels, signed = true) {
  const values = pair[1].filter((_, i) => i % 2 === 0);
  lineCharts.appendChild(drawChart(title, values, 1, labels, signed ? "signed" : "binary"));
}

function addDsssChart(title, values, labels, signed = false) {
  dsssCharts.appendChild(drawChart(title, values, 1, labels, signed ? "signed" : "binary"));
}

function generateLineCoding() {
  const bits = lineData.value.trim();
  lineError.textContent = "";

  if (!validBits(bits)) {
    lineError.textContent = "Enter a binary sequence containing only 0 and 1.";
    return;
  }

  const encodings = [
    ["Unipolar NRZ", unipolarNRZ(bits), false],
    ["P-NRZ-L", polarNRZL(bits), true],
    ["P-NRZ-I", polarNRZI(bits), true],
    ["Polar RZ", polarRZ(bits), true],
    ["Manchester", manchester(bits), true],
    ["Diff Manchester", differentialManchester(bits), true],
    ["AMI", ami(bits), true]
  ];

  lineCharts.innerHTML = "";
  lineSummary.innerHTML = `<div><span>Data Sequence</span><strong>${bits}</strong></div>
                           <div><span>Number of Bits</span><strong>${bits.length}</strong></div>
                           <div><span>Encodings</span><strong>7</strong></div>`;

  encodings.forEach(([title, pair, signed]) => addLineChart(title, pair, true, signed));
}

function generateDsss() {
  const data = dsssData.value.trim();
  const pn = dsssPn.value.trim();
  dsssError.textContent = "";

  if (!validBits(data)) {
    dsssError.textContent = "Data sequence must contain only 0 and 1.";
    return;
  }

  if (!validBits(pn)) {
    dsssError.textContent = "PN sequence must contain only 0 and 1.";
    return;
  }

  const required = data.length * 2;
  if (pn.length < required) {
    dsssError.textContent = `PN sequence must contain at least ${required} chips because Tb = 2Tc.`;
    return;
  }

  const usedPN = pn.slice(0, required).split("").map(Number);
  const dataChips = data.split("").flatMap(b => [Number(b), Number(b)]);
  const transmitted = dataChips.map((v, i) => v ^ usedPN[i]);
  const received = [...transmitted];
  const demod = received.map((v, i) => v ^ usedPN[i]);
  const recovered = [];
  for (let i = 0; i < demod.length; i += 2) recovered.push(demod[i]);

  const toString = a => a.join("");

  dsssSummary.innerHTML = `
    <div><span>Data Bits</span><strong>${data}</strong></div>
    <div><span>PN Sequence Bits</span><strong>${toString(usedPN)}</strong></div>
    <div><span>Transmitted Bits</span><strong>${toString(transmitted)}</strong></div>
    <div><span>Received Bits</span><strong>${toString(received)}</strong></div>
    <div><span>Demodulator Output</span><strong>${toString(demod)}</strong></div>
    <div><span>Recovered Data</span><strong>${toString(recovered)}</strong></div>
  `;

  dsssCharts.innerHTML = "";

  addDsssChart("Data Bits", data.split("").map(Number), true);
  addDsssChart("PN Sequence Bits", usedPN, true);
  addDsssChart("Transmitted Bit", transmitted, true);
  addDsssChart("Received Bit", received, true);
  addDsssChart("Local PN Template", usedPN, true);
  addDsssChart("Demodulator Output", demod, true);
}

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
  });
});

lineGenerate.addEventListener("click", generateLineCoding);
dsssGenerate.addEventListener("click", generateDsss);

generateLineCoding();
generateDsss();
