const barsContainer = document.getElementById("barsContainer");
const algoSelect = document.getElementById("algoSelect");
const speedSlider = document.getElementById("speedSlider");
const speedLabel = document.getElementById("speedLabel");
const generateBtn = document.getElementById("generateBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

let data = [];
let delay = 50; // ms, will be updated by slider
let isSorting = false;
let paused = false;

// Sleep helper using Promise + setTimeout
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Update delay when slider changes
speedSlider.addEventListener("input", () => {
  const value = Number(speedSlider.value);
  speedLabel.textContent = value;
  // Map 1–100 slider to 500–5 ms delay (slower to faster)
  delay = 505 - value * 5;
});

// Generate random array and render bars
function generateArray(size = 40) {
  data = [];
  for (let i = 0; i < size; i++) {
    data.push(Math.floor(Math.random() * 100) + 5); // 5–104
  }
  renderArray();
}

function renderArray(highlightIndices = [], sortedIndices = []) {
  barsContainer.innerHTML = "";
  const maxVal = Math.max(...data, 100);
  data.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    const heightPercent = (value / maxVal) * 100;
    bar.style.height = `${heightPercent}%`;

    if (highlightIndices.includes(index)) {
      bar.classList.add("comparing");
    }
    if (sortedIndices.includes(index)) {
      bar.classList.add("sorted");
    }

    barsContainer.appendChild(bar);
  });
}

// Disable / enable controls while sorting
function setControlsDisabled(disabled) {
  isSorting = disabled;
  generateBtn.disabled = disabled;
  startBtn.disabled = disabled;
  algoSelect.disabled = disabled;
  // Pause button only makes sense while sorting
  pauseBtn.disabled = !disabled;
  if (!disabled) {
    // reset paused state when not sorting
    paused = false;
    pauseBtn.textContent = "Pause";
  }
  resetBtn.disabled = !disabled;
}

// Sleep that respects pause and stop (isSorting) state
async function sleepWhile(ms) {
  const step = 20;
  let elapsed = 0;
  while (elapsed < ms) {
    if (!isSorting) return;
    if (paused) {
      await sleep(step);
      continue;
    }
    const next = Math.min(step, ms - elapsed);
    await sleep(next);
    elapsed += next;
  }
}

// Bubble Sort visualization
async function bubbleSort() {
  const n = data.length;
  let sortedIndices = [];
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (!isSorting) return;
      renderArray([j, j + 1], sortedIndices);
      await sleepWhile(delay);

      if (data[j] > data[j + 1]) {
        [data[j], data[j + 1]] = [data[j + 1], data[j]];
        swapped = true;
        renderArray([j, j + 1], sortedIndices);
        await sleepWhile(delay);
      }
    }
    sortedIndices.push(n - i - 1);
    renderArray([], sortedIndices);
    await sleepWhile(delay);
    if (!swapped) break;
  }
  // Mark all as sorted at end
  renderArray(
    [],
    data.map((_, i) => i)
  );
}

// Selection Sort visualization
async function selectionSort() {
  const n = data.length;
  let sortedIndices = [];
  for (let i = 0; i < n; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (!isSorting) return;
      renderArray([minIndex, j], sortedIndices);
      await sleepWhile(delay);

      if (data[j] < data[minIndex]) {
        minIndex = j;
        renderArray([minIndex, j], sortedIndices);
        await sleepWhile(delay);
      }
    }
    if (minIndex !== i) {
      [data[i], data[minIndex]] = [data[minIndex], data[i]];
      renderArray([i, minIndex], sortedIndices);
      await sleepWhile(delay);
    }
    sortedIndices.push(i);
    renderArray([], sortedIndices);
    await sleepWhile(delay);
  }
}
renderArray(
  [],
  data.map((_, i) => i)
);

// Decide which algorithm to run
async function runSelectedAlgorithm() {
  if (isSorting) return;
  setControlsDisabled(true);

  const algo = algoSelect.value;
  if (algo === "bubble") {
    await bubbleSort();
  } else if (algo === "selection") {
    await selectionSort();
  }

  setControlsDisabled(false);
}

// Hook up buttons
generateBtn.addEventListener("click", () => {
  if (isSorting) return;
  generateArray();
});

startBtn.addEventListener("click", () => {
  runSelectedAlgorithm();
});

pauseBtn.addEventListener("click", () => {
  if (!isSorting) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
});

resetBtn.addEventListener("click", () => {
  if (isSorting) {
    isSorting = false; // This will signal sorting to stop
    paused = false;
    pauseBtn.textContent = "Pause";
    generateArray();
  }
});

// Initial setup
generateArray();
speedSlider.dispatchEvent(new Event("input"));
// Pause button starts disabled until sorting begins
pauseBtn.disabled = true;
resetBtn.disabled = true;
