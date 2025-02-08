// script.js

// Global variables
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let gridSize = parseInt(document.getElementById('gridSizeSlider').value);
let speed = parseInt(document.getElementById('speedSlider').value);
let cellSize = canvas.width / gridSize;

let board = createEmptyBoard(gridSize);
let simulationInterval = null;
let isRunning = false;
let currentStep = 0;
let simulationSteps = []; // stores a clone of the board for each generation
let liveCounts = [];      // stores live cell counts per generation
let simulationHistory = []; // simulation history objects

// --- Utility Functions ---

function createEmptyBoard(size) {
  let arr = [];
  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) {
      row.push(0); // 0 = dead, 1 = alive
    }
    arr.push(row);
  }
  return arr;
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function drawBoard(boardState) {
  cellSize = canvas.width / gridSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (boardState[i][j]) {
        ctx.fillStyle = '#00e676';
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }
}

function countLiveCells(boardState) {
  let count = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (boardState[i][j]) count++;
    }
  }
  return count;
}

function countLiveNeighbors(boardState, x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      let nx = x + i;
      let ny = y + j;
      if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
        if (boardState[nx][ny]) count++;
      }
    }
  }
  return count;
}

function computeNextBoard(current) {
  let newBoard = createEmptyBoard(gridSize);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let liveNeighbors = countLiveNeighbors(current, i, j);
      if (current[i][j]) {
        // Live cell survives if 2 or 3 neighbors live.
        newBoard[i][j] = (liveNeighbors === 2 || liveNeighbors === 3) ? 1 : 0;
      } else {
        // Dead cell becomes alive if exactly 3 neighbors live.
        newBoard[i][j] = (liveNeighbors === 3) ? 1 : 0;
      }
    }
  }
  return newBoard;
}

// --- Timeline Chart (using Chart.js) ---

let timelineCtx = document.getElementById('timelineChart').getContext('2d');
let timelineChart = new Chart(timelineCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Live Cells',
      data: [],
      fill: false,
      borderColor: 'rgba(0, 230, 118, 1)',
      tension: 0.4
    }]
  },
  options: {
    scales: {
      x: { title: { display: true, text: 'Generation' } },
      y: { title: { display: true, text: 'Live Cells' }, beginAtZero: true }
    },
    plugins: {
      tooltip: { mode: 'index' }
    },
    onClick: (e) => {
      const points = timelineChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);
      if (points.length) {
        const index = points[0].index;
        jumpToGeneration(index);
      }
    }
  }
});

function updateTimelineChart() {
  timelineChart.data.labels = liveCounts.map((_, index) => index);
  timelineChart.data.datasets[0].data = liveCounts;
  timelineChart.update();
}

function jumpToGeneration(index) {
  if (index < 0 || index >= simulationSteps.length) return;
  currentStep = index;
  board = cloneBoard(simulationSteps[index]);
  drawBoard(board);
}

// --- Simulation Step ---

function simulationStep() {
  board = computeNextBoard(board);
  simulationSteps.push(cloneBoard(board));
  currentStep++;
  liveCounts.push(countLiveCells(board));
  updateTimelineChart();
  drawBoard(board);
}

// --- UI Event Handlers ---

// Grid Size change
document.getElementById('gridSizeSlider').addEventListener('input', function () {
  gridSize = parseInt(this.value);
  document.getElementById('gridSizeValue').innerText = gridSize;
  document.getElementById('gridSizeValue2').innerText = gridSize;
  board = createEmptyBoard(gridSize);
  simulationSteps = [];
  liveCounts = [];
  currentStep = 0;
  drawBoard(board);
  updateTimelineChart();
});

// Speed change
document.getElementById('speedSlider').addEventListener('input', function () {
  speed = parseInt(this.value);
  document.getElementById('speedValue').innerText = speed;
  if (isRunning) {
    clearInterval(simulationInterval);
    simulationInterval = setInterval(simulationStep, speed);
  }
});

// Start Simulation
document.getElementById('startBtn').addEventListener('click', function () {
  if (!isRunning) {
    isRunning = true;
    // Record initial state if not already saved.
    if (simulationSteps.length === 0) {
      simulationSteps.push(cloneBoard(board));
      liveCounts.push(countLiveCells(board));
      updateTimelineChart();
    }
    simulationInterval = setInterval(simulationStep, speed);
  }
});

// Pause Simulation
document.getElementById('pauseBtn').addEventListener('click', function () {
  if (isRunning) {
    clearInterval(simulationInterval);
    isRunning = false;
  }
});

// Restart Simulation (and save history)
document.getElementById('restartBtn').addEventListener('click', function () {
  if (isRunning) {
    clearInterval(simulationInterval);
    isRunning = false;
  }
  if (simulationSteps.length > 0) {
    let simRecord = {
      timestamp: new Date().toISOString(),
      gridSize: gridSize,
      speed: speed,
      steps: simulationSteps.map(s => s), // deep copy
      liveCounts: liveCounts.slice()
    };
    simulationHistory.push(simRecord);
    saveHistoryToLocalStorage();
    updateHistoryUI();
  }
  board = createEmptyBoard(gridSize);
  simulationSteps = [];
  liveCounts = [];
  currentStep = 0;
  drawBoard(board);
  updateTimelineChart();
});

// Step Forward (only when paused)
document.getElementById('stepForwardBtn').addEventListener('click', function () {
  if (!isRunning) {
    simulationStep();
  }
});

// Step Backward (only when paused)
document.getElementById('stepBackwardBtn').addEventListener('click', function () {
  if (!isRunning && currentStep > 0) {
    currentStep--;
    board = cloneBoard(simulationSteps[currentStep]);
    drawBoard(board);
  }
});

// Random Initialization
document.getElementById('randomInitBtn').addEventListener('click', function () {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      board[i][j] = Math.random() > 0.5 ? 1 : 0;
    }
  }
  drawBoard(board);
});

// Procedural Generation (using Perlin Noise)
document.getElementById('proceduralGenBtn').addEventListener('click', function () {
  let seed = parseFloat(document.getElementById('noiseSeedInput').value) || Math.random();
  noise.seed(seed);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Scale coordinates and threshold noise value to decide cell state.
      let value = noise.perlin2(i / gridSize * 5, j / gridSize * 5);
      board[i][j] = value > 0 ? 1 : 0;
    }
  }
  drawBoard(board);
});

// Predefined Patterns
document.getElementById('addPatternBtn').addEventListener('click', function () {
  let pattern = document.getElementById('patternSelect').value;
  if (pattern) {
    let centerX = Math.floor(gridSize / 2);
    let centerY = Math.floor(gridSize / 2);
    addPattern(pattern, centerX, centerY);
    drawBoard(board);
  }
});

function addPattern(pattern, centerX, centerY) {
  if (pattern === 'glider') {
    // Glider pattern (relative offsets)
    const glider = [
      [0, 1],
      [1, 2],
      [2, 0], [2, 1], [2, 2]
    ];
    glider.forEach(offset => {
      let x = centerX + offset[0] - 1;
      let y = centerY + offset[1] - 1;
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        board[x][y] = 1;
      }
    });
  } else if (pattern === 'pulsar') {
    // A very simplified pulsar pattern
    const pulsarOffsets = [
      [-6, -4], [-6, -3], [-6, -2],
      [-1, -4], [-1, -3], [-1, -2],
      [-4, -6], [-3, -6], [-2, -6],
      [-4, -1], [-3, -1], [-2, -1],
      [1, -4], [1, -3], [1, -2],
      [6, -4], [6, -3], [6, -2],
      [4, -6], [3, -6], [2, -6],
      [4, -1], [3, -1], [2, -1],
      [-6, 2], [-6, 3], [-6, 4],
      [-1, 2], [-1, 3], [-1, 4],
      [-4, 6], [-3, 6], [-2, 6],
      [-4, 1], [-3, 1], [-2, 1],
      [1, 2], [1, 3], [1, 4],
      [6, 2], [6, 3], [6, 4],
      [4, 6], [3, 6], [2, 6],
      [4, 1], [3, 1], [2, 1]
    ];
    pulsarOffsets.forEach(offset => {
      let x = centerX + offset[0];
      let y = centerY + offset[1];
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        board[x][y] = 1;
      }
    });
  }
}

// --- Drawing Mode on Canvas (toggle cell on click/drag) ---

let isDrawing = false;
canvas.addEventListener('mousedown', function (e) {
  if (!isRunning) {
    isDrawing = true;
    toggleCell(e);
  }
});
canvas.addEventListener('mousemove', function (e) {
  if (isDrawing && !isRunning) {
    toggleCell(e);
  }
});
canvas.addEventListener('mouseup', function () {
  isDrawing = false;
});
function toggleCell(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const i = Math.floor(y / cellSize);
  const j = Math.floor(x / cellSize);
  if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
    board[i][j] = board[i][j] ? 0 : 1;
    drawBoard(board);
  }
}

// --- Simulation History Management ---
function saveHistoryToLocalStorage() {
  localStorage.setItem('simulationHistory', JSON.stringify(simulationHistory));
}

function loadHistoryFromLocalStorage() {
  let data = localStorage.getItem('simulationHistory');
  if (data) {
    simulationHistory = JSON.parse(data);
  }
}

function updateHistoryUI() {
  const historyDiv = document.getElementById('simulationHistory');
  historyDiv.innerHTML = '';
  simulationHistory.forEach((sim, index) => {
    let div = document.createElement('div');
    div.classList.add('history-item');
    div.innerText = `${sim.timestamp} (Steps: ${sim.steps.length})`;
    div.addEventListener('click', function () {
      loadSimulationFromHistory(index);
    });
    historyDiv.appendChild(div);
  });
}

function loadSimulationFromHistory(index) {
  let sim = simulationHistory[index];
  gridSize = sim.gridSize;
  document.getElementById('gridSizeSlider').value = gridSize;
  document.getElementById('gridSizeValue').innerText = gridSize;
  document.getElementById('gridSizeValue2').innerText = gridSize;
  speed = sim.speed;
  document.getElementById('speedSlider').value = speed;
  board = cloneBoard(sim.steps[sim.steps.length - 1]);
  simulationSteps = sim.steps.map(s => s);
  liveCounts = sim.liveCounts.slice();
  currentStep = sim.steps.length - 1;
  drawBoard(board);
  updateTimelineChart();
}

// --- GIF Generation ---
document.getElementById('generateGifBtn').addEventListener('click', function () {
  generateGif();
});

document.getElementById('downloadGifBtn').addEventListener('click', function () {
  if (gifBlob) {
    let url = URL.createObjectURL(gifBlob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'simulation.gif';
    a.click();
  }
});

let gifBlob = null;
function generateGif() {
  const gifStatus = document.getElementById('gifStatus');
  gifStatus.innerText = 'Generating GIF...';
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: canvas.width,
    height: canvas.height
  });

  // Use a temporary canvas to render each saved step.
  let tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  let tempCtx = tempCanvas.getContext('2d');

  simulationSteps.forEach(state => {
    drawBoardOnContext(state, tempCtx);
    gif.addFrame(tempCtx, { copy: true, delay: speed });
  });
  gif.on('finished', function (blob) {
    gifBlob = blob;
    gifStatus.innerText = 'GIF generated!';
    document.getElementById('downloadGifBtn').disabled = false;
  });
  gif.render();
}

function drawBoardOnContext(state, context) {
  const size = gridSize;
  const cellSz = canvas.width / gridSize;
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (state[i][j]) {
        context.fillStyle = '#00e676';
        context.fillRect(j * cellSz, i * cellSz, cellSz, cellSz);
      } else {
        context.fillStyle = '#000';
        context.fillRect(j * cellSz, i * cellSz, cellSz, cellSz);
      }
    }
  }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', function () {
  loadHistoryFromLocalStorage();
  updateHistoryUI();
  drawBoard(board);
});
