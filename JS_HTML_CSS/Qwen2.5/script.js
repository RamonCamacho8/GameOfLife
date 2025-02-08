const board = document.getElementById('simulation-board');
const densitySlider = document.getElementById('density');
const speedSlider = document.getElementById('speed');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const restartButton = document.getElementById('restart');
const stepForwardButton = document.getElementById('step-forward');
const stepBackwardButton = document.getElementById('step-backward');
const randomInitButton = document.getElementById('random-init');
const proceduralInitButton = document.getElementById('procedural-init');
const patternsDropdown = document.getElementById('patterns');
const historyList = document.getElementById('history-list');
const generateGifButton = document.getElementById('generate-gif');
const saveGifButton = document.getElementById('save-gif');

let gridSize = parseInt(densitySlider.value);
let timeStep = parseInt(speedSlider.value);
let intervalId = null;
let currentBoard = [];
let history = [];
let stepIndex = 0;

// Initialize the board
function createBoard(size) {
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  currentBoard = Array.from({ length: size }, () => Array(size).fill(0));
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.addEventListener('click', toggleCellState);
    board.appendChild(cell);
  }
}

createBoard(gridSize);

// Update board size when slider changes
densitySlider.addEventListener('input', () => {
  gridSize = parseInt(densitySlider.value);
  createBoard(gridSize);
});

function toggleCellState(event) {
    const cell = event.target;
    const index = Array.from(board.children).indexOf(cell);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    currentBoard[row][col] = currentBoard[row][col] ? 0 : 1;
    cell.style.backgroundColor = currentBoard[row][col] ? '#4caf50' : '#212121';
  }
  
  function computeNextGeneration() {
    const newBoard = JSON.parse(JSON.stringify(currentBoard));
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const neighbors = countNeighbors(row, col);
        if (currentBoard[row][col] && (neighbors < 2 || neighbors > 3)) {
          newBoard[row][col] = 0;
        } else if (!currentBoard[row][col] && neighbors === 3) {
          newBoard[row][col] = 1;
        }
      }
    }
    currentBoard = newBoard;
    renderBoard();
  }
  
  function countNeighbors(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          count += currentBoard[r][c];
        }
      }
    }
    return count;
  }
  
  function renderBoard() {
    board.innerHTML = '';
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.style.backgroundColor = currentBoard[row][col] ? '#4caf50' : '#212121';
        cell.addEventListener('click', toggleCellState);
        board.appendChild(cell);
      }
    }
  }

  startButton.addEventListener('click', () => {
    if (!intervalId) {
      intervalId = setInterval(computeNextGeneration, timeStep);
    }
  });
  
  pauseButton.addEventListener('click', () => {
    clearInterval(intervalId);
    intervalId = null;
  });
  
  restartButton.addEventListener('click', () => {
    clearInterval(intervalId);
    intervalId = null;
    createBoard(gridSize);
  });
  
  stepForwardButton.addEventListener('click', computeNextGeneration);
  
  stepBackwardButton.addEventListener('click', () => {
    if (stepIndex > 0) {
      stepIndex--;
      currentBoard = history[stepIndex];
      renderBoard();
    }
  });