const ROWS = 50;
const COLS = 50;
const INITIAL_LIVE_PROBABILITY = 0.25;
const TRAIL_LIFETIME = 6;
const EVENT_FLASH_DURATION = 250;
const MAX_CLUSTER_SPROUT_CHANCE = 0.1;
const CLUSTER_SPROUT_RANGE = 10;
const table = document.getElementById("lifeGrid");
const generationsInput = document.getElementById("generationsInput");
const cullIntervalInput = document.getElementById("cullIntervalInput");
const sproutChanceInput = document.getElementById("sproutChanceInput");
const sproutChanceOutput = document.getElementById("sproutChanceOutput");
const patternInput = document.getElementById("patternInput");
const paletteInput = document.getElementById("paletteInput");
const runBtn = document.getElementById("runBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const remainingCounter = document.getElementById("remainingCounter");

let isRunning = false;
let stopRequested = false;
let generationsRemaining = 0;
let generation = 0;
let grid = createEmptyGrid();
let nextGrid = createEmptyGrid();
let trailAges = createEmptyTrailAgeGrid();
const cellEls = [];
const palettes = {
  rose: { hue: 340, saturation: 72 },
  ocean: { hue: 200, saturation: 75 },
  forest: { hue: 140, saturation: 58 },
  sunset: { hue: 28, saturation: 82 },
  violet: { hue: 275, saturation: 65 },
};
const patterns = {
  glider: [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  pulsar: [
    [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
    [2, 0], [2, 5], [2, 7], [2, 12],
    [3, 0], [3, 5], [3, 7], [3, 12],
    [4, 0], [4, 5], [4, 7], [4, 12],
    [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
    [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
    [8, 0], [8, 5], [8, 7], [8, 12],
    [9, 0], [9, 5], [9, 7], [9, 12],
    [10, 0], [10, 5], [10, 7], [10, 12],
    [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10],
  ],
  gosperGliderGun: [
    [0, 24],
    [1, 22], [1, 24],
    [2, 12], [2, 13], [2, 20], [2, 21], [2, 34], [2, 35],
    [3, 11], [3, 15], [3, 20], [3, 21], [3, 34], [3, 35],
    [4, 0], [4, 1], [4, 10], [4, 16], [4, 20], [4, 21],
    [5, 0], [5, 1], [5, 10], [5, 14], [5, 16], [5, 17], [5, 22], [5, 24],
    [6, 10], [6, 16], [6, 24],
    [7, 11], [7, 15],
    [8, 12], [8, 13],
  ],
};

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(false));
}

function createEmptyTrailAgeGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function loadPattern(pattern) {
  resetGrid();
  const minRow = Math.min(...pattern.map(([row]) => row));
  const maxRow = Math.max(...pattern.map(([row]) => row));
  const minCol = Math.min(...pattern.map(([, col]) => col));
  const maxCol = Math.max(...pattern.map(([, col]) => col));
  const rowOffset = Math.floor((minRow + maxRow) / 2);
  const colOffset = Math.floor((minCol + maxCol) / 2);

  for (const [row, col] of pattern) {
    const targetRow = wrapCoordinate(Math.floor(ROWS / 2) + row - rowOffset, ROWS);
    const targetCol = wrapCoordinate(Math.floor(COLS / 2) + col - colOffset, COLS);
    grid[targetRow][targetCol] = true;
  }
  renderGrid();
}

function wrapCoordinate(value, size) {
  return ((value % size) + size) % size;
}

function seedInitialPattern() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = Math.random() < INITIAL_LIVE_PROBABILITY;
    }
  }
}

function buildTable() {
  const frag = document.createDocumentFragment();
  for (let r = 0; r < ROWS; r++) {
    const tr = document.createElement("tr");
    const rowEls = [];
    for (let c = 0; c < COLS; c++) {
      const td = document.createElement("td");
      td.dataset.r = r;
      td.dataset.c = c;
      tr.appendChild(td);
      rowEls.push(td);
    }
    frag.appendChild(tr);
    cellEls.push(rowEls);
  }
  table.appendChild(frag);
}

function renderGrid() {
  const generationColor = getGenerationColor();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cellEls[r][c];
      if (grid[r][c]) {
        cell.classList.add("alive");
        cell.classList.remove("trail");
        cell.style.setProperty("--generation-color", generationColor);
        cell.style.opacity = "1";
        cell.dataset.generation = generation;
        trailAges[r][c] = 0;
      } else if (cell.classList.contains("alive")) {
        cell.classList.remove("alive");
        cell.classList.add("trail");
        cell.style.opacity = "1";
        trailAges[r][c] = 0;
      } else if (cell.classList.contains("trail")) {
        trailAges[r][c]++;

        if (trailAges[r][c] >= TRAIL_LIFETIME) {
          cell.classList.remove("trail");
          cell.style.removeProperty("--generation-color");
          cell.style.opacity = "0";
          delete cell.dataset.generation;
          trailAges[r][c] = 0;
        } else {
          cell.style.opacity = String(1 - trailAges[r][c] / TRAIL_LIFETIME);
        }
      }
    }
  }
}

function getGenerationColor(generationNumber = generation) {
  const palette = palettes[paletteInput.value];
  const lightness = 38 + ((generationNumber * 7) % 44);
  return `hsl(${palette.hue} ${palette.saturation}% ${lightness}%)`;
}

function refreshPalette() {
  for (const row of cellEls) {
    for (const cell of row) {
      if (cell.dataset.generation !== undefined) {
        cell.style.setProperty(
          "--generation-color",
          getGenerationColor(Number(cell.dataset.generation)),
        );
      }
    }
  }
}

function countAliveNeighbors(r, c) {
  let alive = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = (r + dr + ROWS) % ROWS;
      const nc = (c + dc + COLS) % COLS;
      if (grid[nr][nc]) alive++;
    }
  }
  return alive;
}

function computeNextGeneration() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const aliveNeighbors = countAliveNeighbors(r, c);
      if (grid[r][c]) {
        nextGrid[r][c] = aliveNeighbors === 2 || aliveNeighbors === 3;
      } else {
        nextGrid[r][c] = aliveNeighbors === 3;
      }
    }
  }
  [grid, nextGrid] = [nextGrid, grid];
}

function cullRandomLiveCells(count) {
  const liveCells = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) {
        liveCells.push([r, c]);
      }
    }
  }

  const cellsToCull = Math.min(count, Math.max(0, liveCells.length - 1));
  for (let i = 0; i < cellsToCull; i++) {
    const index = Math.floor(Math.random() * liveCells.length);
    const [r, c] = liveCells[index];
    liveCells[index] = liveCells[liveCells.length - 1];
    liveCells.pop();
    grid[r][c] = false;
    const cell = cellEls[r][c];
    cell.classList.remove("alive", "trail");
    cell.style.removeProperty("--generation-color");
    cell.style.opacity = "1";
    delete cell.dataset.generation;
    trailAges[r][c] = 0;
    flashCell(cell, "cull-flash", () => {
      if (!grid[r][c]) {
        cell.style.opacity = "0";
      }
    });
  }
}

function sproutRandomCells(chance) {
  const viableCells = getViableCells();
  const sproutCells = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c] && Math.random() < chance) {
        sproutCells.push([r, c]);
      }
    }
  }

  for (const [r, c] of sproutCells) {
    sproutCell(r, c);
    if (Math.random() < getClusterSproutChance(r, c, viableCells)) {
      sproutCell(r, wrapCoordinate(c + 1, COLS));
      sproutCell(wrapCoordinate(r + 1, ROWS), c);
      sproutCell(wrapCoordinate(r + 1, ROWS), wrapCoordinate(c + 1, COLS));
    }
  }
}

function getViableCells() {
  const viableCells = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const aliveNeighbors = countAliveNeighbors(r, c);
      if (grid[r][c] && (aliveNeighbors === 2 || aliveNeighbors === 3)) {
        viableCells.push([r, c]);
      }
    }
  }

  return viableCells;
}

function getClusterSproutChance(row, col, viableCells) {
  let nearestDistance = Infinity;

  for (const [viableRow, viableCol] of viableCells) {
    const rowDistance = Math.abs(row - viableRow);
    const colDistance = Math.abs(col - viableCol);
    const wrappedRowDistance = Math.min(rowDistance, ROWS - rowDistance);
    const wrappedColDistance = Math.min(colDistance, COLS - colDistance);
    nearestDistance = Math.min(nearestDistance, Math.max(wrappedRowDistance, wrappedColDistance));
  }

  if (nearestDistance > CLUSTER_SPROUT_RANGE) {
    return 0;
  }

  return MAX_CLUSTER_SPROUT_CHANCE * (1 - (nearestDistance - 1) / CLUSTER_SPROUT_RANGE);
}

function sproutCell(row, col) {
  if (!grid[row][col]) {
    grid[row][col] = true;
    flashCell(cellEls[row][col], "sprout-flash");
  }
}

function flashCell(cell, className, onComplete) {
  cell.classList.add(className);
  setTimeout(() => {
    cell.classList.remove(className);
    onComplete?.();
  }, EVENT_FLASH_DURATION);
}

function updateSproutChanceOutput() {
  sproutChanceOutput.value = `${Number(sproutChanceInput.value)}%`;
}

function updateRemainingCounter() {
  remainingCounter.textContent = `Generations Remaining: ${generationsRemaining}`;
}

function setControlsDisabled(disabled) {
  generationsInput.disabled = disabled;
  cullIntervalInput.disabled = disabled;
  sproutChanceInput.disabled = disabled;
  patternInput.disabled = disabled;
  paletteInput.disabled = disabled;
  runBtn.disabled = disabled;
  stopBtn.disabled = !disabled;
  clearBtn.disabled = disabled;
  table.style.pointerEvents = disabled ? "none" : "auto";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSimulation() {
  if (isRunning) return;
  const parsed = generationsInput.valueAsNumber;
  if (!Number.isFinite(parsed) || parsed < 1) return;
  const cullInterval = cullIntervalInput.valueAsNumber;
  if (!Number.isInteger(cullInterval) || cullInterval < 0) {
    cullIntervalInput.setCustomValidity("Enter a whole number of 0 or greater.");
    cullIntervalInput.reportValidity();
    return;
  }
  cullIntervalInput.setCustomValidity("");
  const sproutChance = sproutChanceInput.valueAsNumber;
  if (!Number.isFinite(sproutChance) || sproutChance < 0 || sproutChance > 1) {
    sproutChanceInput.setCustomValidity("Enter a percentage from 0 to 1.");
    sproutChanceInput.reportValidity();
    return;
  }
  sproutChanceInput.setCustomValidity("");

  isRunning = true;
  stopRequested = false;
  generationsRemaining = parsed;
  updateRemainingCounter();
  setControlsDisabled(true);

  try {
    while (generationsRemaining > 0 && !stopRequested) {
      computeNextGeneration();
      generation++;
      if (cullInterval > 0 && generation % cullInterval === 0) {
        cullRandomLiveCells(cullInterval);
      }
      if (sproutChance > 0) {
        sproutRandomCells(sproutChance / 100);
      }
      renderGrid();
      generationsRemaining--;
      updateRemainingCounter();
      await sleep(500);
    }
  } finally {
    isRunning = false;
    setControlsDisabled(false);
  }
}

function stopSimulation() {
  stopRequested = true;
}

function resetGrid() {
  grid = createEmptyGrid();
  nextGrid = createEmptyGrid();
  trailAges = createEmptyTrailAgeGrid();
  generation = 0;
  generationsRemaining = 0;
  updateRemainingCounter();
  for (const row of cellEls) {
    for (const cell of row) {
      cell.classList.remove("alive", "trail", "cull-flash", "sprout-flash");
      cell.style.removeProperty("--generation-color");
      cell.style.removeProperty("opacity");
      delete cell.dataset.generation;
    }
  }
}

function clearGrid() {
  if (isRunning) return;
  const pattern = patterns[patternInput.value];
  if (pattern) {
    loadPattern(pattern);
    return;
  }
  resetGrid();
  seedInitialPattern();
  renderGrid();
}

runBtn.addEventListener("click", runSimulation);
stopBtn.addEventListener("click", stopSimulation);
clearBtn.addEventListener("click", clearGrid);
paletteInput.addEventListener("change", refreshPalette);
sproutChanceInput.addEventListener("input", updateSproutChanceOutput);
patternInput.addEventListener("change", () => {
  const pattern = patterns[patternInput.value];
  if (pattern) {
    loadPattern(pattern);
  } else {
    clearGrid();
  }
});

buildTable();
seedInitialPattern();
renderGrid();
updateRemainingCounter();
updateSproutChanceOutput();
