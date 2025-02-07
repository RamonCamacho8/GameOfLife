// Constants and Globals
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const timelineCanvas = document.getElementById('timeline-canvas');
const timelineCtx = timelineCanvas.getContext('2d');
const densitySlider = document.getElementById('density');
const densityValueDisplay = document.getElementById('density-value');
const timeStepSlider = document.getElementById('time-step');
const timeStepValueDisplay = document.getElementById('time-step-value');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const stepForwardBtn = document.getElementById('step-forward-btn');
const stepBackwardBtn = document.getElementById('step-backward-btn');
const randomBtn = document.getElementById('random-btn');
const perlinBtn = document.getElementById('perlin-btn');
const patternSelect = document.getElementById('pattern-select');
const addPatternBtn = document.getElementById('add-pattern-btn');
const generateGifBtn = document.getElementById('generate-gif-btn');
const downloadGifBtn = document.getElementById('download-gif-btn');
const downloadLink = document.getElementById('download-link');
const historyList = document.getElementById('history-list');

const CELL_COLOR = '#03A9F4';
const DEAD_CELL_COLOR = '#121212';

let gridSize = parseInt(densitySlider.value); // Initial grid size
let cellSize;
let timeStep = parseInt(timeStepSlider.value);
let grid; // 2D array representing the game board
let isRunning = false;
let intervalId;
let history = []; // Array to store simulation history (states of the grid)
let currentStep = -1; // Index of the current step in the history

const MAX_HISTORY_LENGTH = 600;
const SIMULATION_HISTORY_KEY = 'gameOfLifeSimulations';

// Helper Functions
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

// Initialize the grid based on gridSize
function initializeGrid() {
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
}

// Calculate cell size based on canvas dimensions and grid size
function calculateCellSize() {
    cellSize = Math.floor(Math.min(canvas.width / gridSize, canvas.height / gridSize)); // Ensure square cells
}

// Draw the grid on the canvas
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            ctx.fillStyle = grid[row][col] ? CELL_COLOR : DEAD_CELL_COLOR;
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }
}

// Game of Life Logic
function getNextGeneration() {
    const nextGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const neighbors = countLiveNeighbors(row, col);

            if (grid[row][col]) {
                // Cell is alive
                if (neighbors < 2 || neighbors > 3) {
                    nextGrid[row][col] = false; // Dies of underpopulation or overpopulation
                } else {
                    nextGrid[row][col] = true;  // Survives
                }
            } else {
                // Cell is dead
                if (neighbors === 3) {
                    nextGrid[row][col] = true;  // Becomes alive by reproduction
                } else {
                    nextGrid[row][col] = false;
                }
            }
        }
    }

    return nextGrid;
}

function countLiveNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;  // Skip the cell itself

            const neighborRow = row + i;
            const neighborCol = col + j;

            if (neighborRow >= 0 && neighborRow < gridSize && neighborCol >= 0 && neighborCol < gridSize) {
                count += grid[neighborRow][neighborCol] ? 1 : 0;
            }
        }
    }
    return count;
}

// Simulation Control Functions
function stepSimulation() {
    if (currentStep < history.length - 1) {
        // If we're stepping forward from the past, remove the future history
        history = history.slice(0, currentStep + 1);
    }
    grid = getNextGeneration();
    history.push(copyGrid(grid)); // Store the current state
    currentStep++;
    if(history.length > MAX_HISTORY_LENGTH){
        history.shift();
        currentStep--;
    }
    drawGrid();
    updateTimeline();
}

function copyGrid(sourceGrid) {
    return sourceGrid.map(row => [...row]); // Deep copy to avoid modifying the original
}

function startSimulation() {
    if (!isRunning) {
        isRunning = true;
        intervalId = setInterval(stepSimulation, timeStep);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    }
}

function pauseSimulation() {
    if (isRunning) {
        isRunning = false;
        clearInterval(intervalId);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

function restartSimulation() {
    pauseSimulation();
    initializeGrid();
    randomInitialization();
    history = [];
    currentStep = -1;
    drawGrid();
    updateTimeline();
    saveSimulationToHistory();  // Save to history upon restart
}

function stepForward() {
    pauseSimulation();
    if(history.length === 0) return; //Do nothing if there isn't a simulation yet

    if (currentStep < history.length - 1) {
        currentStep++;
        grid = copyGrid(history[currentStep]);
        drawGrid();
        updateTimeline();
    } else {
        // Step into the future (calculate next generation if at the end)
        stepSimulation();
    }
}

function stepBackward() {
    pauseSimulation();
    if(history.length === 0) return;

    if (currentStep > 0) {
        currentStep--;
        grid = copyGrid(history[currentStep]);
        drawGrid();
        updateTimeline();
    }
}

// Initial Conditions
function randomInitialization() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            grid[row][col] = Math.random() < 0.5;  // 50% chance of being alive
        }
    }
    if(history.length === 0){
        history.push(copyGrid(grid)); //Store Initial Random Condition
        currentStep = 0;
    }

    drawGrid();
}

function perlinInitialization() {
    const perlin = new PerlinNoise(); // Requires perlin.js
    const seed = Math.random(); // You can allow the user to input a seed
    perlin.seed(seed);

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const noiseValue = perlin.noise(col / 10, row / 10, 0); // Adjust the division factor for different pattern scales
            grid[row][col] = noiseValue > 0.5; // Threshold for alive/dead
        }
    }
    if(history.length === 0){
        history.push(copyGrid(grid)); //Store Initial Perlin Condition
        currentStep = 0;
    }
    drawGrid();
}

function addPattern(patternName) {
    pauseSimulation(); //Pause so that the user does not accidentally add while the simulation is running
    const pattern = getPattern(patternName);
    if (pattern) {
        const startRow = Math.floor(gridSize / 2) - Math.floor(pattern.length / 2);
        const startCol = Math.floor(gridSize / 2) - Math.floor(pattern[0].length / 2);

        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[0].length; col++) {
                const gridRow = startRow + row;
                const gridCol = startCol + col;

                if (gridRow >= 0 && gridRow < gridSize && gridCol >= 0 && gridCol < gridSize) {
                    grid[gridRow][gridCol] = pattern[row][col];
                }
            }
        }
        drawGrid();
    }
}

// Predefined Patterns (example)
function getPattern(patternName) {
    switch (patternName) {
        case 'glider':
            return [
                [false, true,  false],
                [false, false, true ],
                [true,  true,  true ]
            ];
        case 'pulsar':
            return [
                [false, false, true,  true,  true,  false, false, false, true,  true,  true,  false, false],
                [false, false, false, false, false, false, false, false, false, false, false, false, false],
                [true,  false, false, false, true,  false, false, false, true,  false, false, false, true ],
                [true,  false, false, false, true,  false, false, false, true,  false, false, false, true ],
                [true,  false, false, false, true,  false, false, false, true,  false, false, false, true ],
                [false, false, false, false, false, false, false, false, false, false, false, false, false],
                [false, false, true,  true,  true,  false, false, false, true,  true,  true,  false, false]
            ];
        default:
            return null;
    }
}

// Event Listeners
canvas.addEventListener('click', (e) => {
    if (isRunning) return; // Don't allow drawing while running
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const row = Math.floor(y / cellSize);
    const col = Math.floor(x / cellSize);

    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        grid[row][col] = !grid[row][col];
        drawGrid();
    }
});

densitySlider.addEventListener('input', () => {
    gridSize = parseInt(densitySlider.value);
    densityValueDisplay.textContent = gridSize;
    calculateCellSize();
    canvas.width = gridSize * cellSize; //Adjust Canvas width to cell size
    canvas.height = gridSize * cellSize; //Adjust Canvas height to cell size
    initializeGrid();
    drawGrid();
});

timeStepSlider.addEventListener('input', () => {
    timeStep = parseInt(timeStepSlider.value);
    timeStepValueDisplay.textContent = timeStep;
    if (isRunning) {
        clearInterval(intervalId);
        intervalId = setInterval(stepSimulation, timeStep);
    }
});

startBtn.addEventListener('click', startSimulation);
pauseBtn.addEventListener('click', pauseSimulation);
restartBtn.addEventListener('click', restartSimulation);
stepForwardBtn.addEventListener('click', stepForward);
stepBackwardBtn.addEventListener('click', stepBackward);
randomBtn.addEventListener('click', randomInitialization);
perlinBtn.addEventListener('click', perlinInitialization);
addPatternBtn.addEventListener('click', () => {
    addPattern(patternSelect.value);
});

// GIF Generation
generateGifBtn.addEventListener('click', () => {
    pauseSimulation();
    generateGIF();
});

downloadGifBtn.addEventListener('click', () => {
    downloadGIF();
});

let gif;

function generateGIF() {
  if (!history || history.length === 0) {
    alert("No simulation history to generate GIF from.");
    return;
  }

  gif = new GIF({
    workers: 2,
    quality: 10,
    width: gridSize * cellSize,
    height: gridSize * cellSize,
    workerScript: 'lib/gif.worker.js' // Path to gif.worker.js
  });

  gif.on('finished', function(blob) {
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'game_of_life.gif';
    downloadLink.style.display = 'block'; // Make the link visible briefly
    downloadLink.click();  // Programmatically click the link to trigger download
    URL.revokeObjectURL(url); // Clean up the URL object
    downloadLink.style.display = 'none';  // Hide the link again
  });

  gif.on('progress', function(p) {
    console.log('Generating GIF:', p);
  });

  // Add frames to the GIF
  history.forEach(frame => {
    // Create a temporary canvas to draw the frame onto
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = gridSize * cellSize;
    tempCanvas.height = gridSize * cellSize;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw the frame on the temporary canvas
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        tempCtx.fillStyle = frame[row][col] ? CELL_COLOR : DEAD_CELL_COLOR;
        tempCtx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }

    // Add the temporary canvas as a frame to the GIF
    gif.addFrame(tempCanvas, {delay: timeStep});
  });

  gif.render();
}

function downloadGIF() {
    // downloadLink.click() is already handled inside `gif.on('finished')`
}

// Simulation History
function saveSimulationToHistory() {
    if (history.length > 0) {
        let simulations = JSON.parse(localStorage.getItem(SIMULATION_HISTORY_KEY) || '[]');
        simulations.push(history); // Store the history array itself
        localStorage.setItem(SIMULATION_HISTORY_KEY, JSON.stringify(simulations));
        loadSimulationHistory(); // Refresh the list in the UI
    }
}

function loadSimulationHistory() {
    const simulations = JSON.parse(localStorage.getItem(SIMULATION_HISTORY_KEY) || '[]');
    historyList.innerHTML = '';  // Clear the list

    simulations.forEach((simulation, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Simulation ${index + 1} (${simulation.length} steps)`;
        listItem.addEventListener('click', () => {
            loadSimulation(index);
        });
        historyList.appendChild(listItem);
    });
}

function loadSimulation(index) {
    const simulations = JSON.parse(localStorage.getItem(SIMULATION_HISTORY_KEY) || '[]');
    if (simulations[index]) {
        history = simulations[index];
        currentStep = history.length - 1; // Load the simulation to the last step
        grid = copyGrid(history[currentStep]);
        drawGrid();
        updateTimeline();
    }
}

// Time Bar Visualization
function updateTimeline() {
    const liveCellCounts = history.map(frame => frame.reduce((count, row) => count + row.filter(cell => cell).length, 0));
    drawTimelineGraph(liveCellCounts);
}

function drawTimelineGraph(data) {
    // Calculate scaling factors to fit the data into the timeline canvas
    const maxCells = Math.max(...data);
    const yScale = timelineCanvas.height / maxCells;
    const xScale = timelineCanvas.width / data.length;

    // Clear the canvas
    timelineCtx.clearRect(0, 0, timelineCanvas.width, timelineCanvas.height);

    timelineCtx.beginPath();
    timelineCtx.strokeStyle = '#03A9F4'; // Line color
    timelineCtx.lineWidth = 1.5;

    // Draw a line connecting the data points
    for (let i = 0; i < data.length; i++) {
        const x = i * xScale;
        const y = timelineCanvas.height - data[i] * yScale;

        if (i === 0) {
            timelineCtx.moveTo(x, y);
        } else {
            timelineCtx.lineTo(x, y);
        }
    }

    timelineCtx.stroke();
    //Mark Current step
    const currentStepX = currentStep * xScale;
    timelineCtx.beginPath();
    timelineCtx.strokeStyle = 'white'; // Line color
    timelineCtx.lineWidth = 2;
    timelineCtx.moveTo(currentStepX, 0);
    timelineCtx.lineTo(currentStepX, timelineCanvas.height);
    timelineCtx.stroke();

}
timelineCanvas.addEventListener('click', (e) => {
    pauseSimulation();
    const rect = timelineCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const step = Math.floor(x / (timelineCanvas.width / history.length));
    if (step >= 0 && step < history.length) {
        currentStep = step;
        grid = copyGrid(history[currentStep]);
        drawGrid();
        updateTimeline();
    }
});

// Initialization
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.6); // Adjust as needed
    canvas.height = canvas.width; // Keep it square
    timelineCanvas.width = canvas.width;
    timelineCanvas.height = 100;
}

function initialize() {
    resizeCanvas();
    calculateCellSize(); // Calculate cell size based on the adjusted canvas size
    canvas.width = gridSize * cellSize; //Adjust Canvas width to cell size
    canvas.height = gridSize * cellSize; //Adjust Canvas height to cell size
    initializeGrid();
    randomInitialization(); // Start with a random board
    loadSimulationHistory();
}

window.addEventListener('resize', () => {
    resizeCanvas();
    calculateCellSize();
    canvas.width = gridSize * cellSize; //Adjust Canvas width to cell size
    canvas.height = gridSize * cellSize; //Adjust Canvas height to cell size
    drawGrid();
});
initialize();