class GameOfLife {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 5;
        this.rows = Math.floor(canvas.height / this.cellSize);
        this.cols = Math.floor(canvas.width / this.cellSize);
        this.grid = this.createGrid();
        this.running = false;
        this.history = [];
        this.currentStep = -1;
        this.speed = 300;
        this.initEventListeners();
        this.draw();
    }

    createGrid() {
        return Array(this.rows).fill().map(() => 
            Array(this.cols).fill(false));
    }

    randomize() {
        this.grid = this.grid.map(row => 
            row.map(() => Math.random() > 0.5));
    }

    perlinNoise(seed) {
        const noise = new SimplexNoise(seed);
        this.grid = this.grid.map((row, i) => 
            row.map((_, j) => noise.noise2D(i/10, j/10) > 0));
    }

    addPattern(pattern) {
        const midX = Math.floor(this.cols/2);
        const midY = Math.floor(this.rows/2);
        pattern.forEach(([dx, dy]) => {
            this.grid[midY + dy][midX + dx] = true;
        });
    }

    computeNext() {
        const next = this.createGrid();
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const neighbors = this.countNeighbors(i, j);
                next[i][j] = neighbors === 3 || (this.grid[i][j] && neighbors === 2);
            }
        }
        return next;
    }

    countNeighbors(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const xi = (x + i + this.rows) % this.rows;
                const yj = (y + j + this.cols) % this.cols;
                count += this.grid[xi][yj] ? 1 : 0;
            }
        }
        return count;
    }

    step() {
        if (this.currentStep < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentStep + 1);
        }
        const next = this.computeNext();
        this.history.push(JSON.stringify(next));
        this.currentStep++;
        this.grid = next;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.grid.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell) {
                    this.ctx.fillStyle = '#bb86fc';
                    this.ctx.fillRect(
                        j * this.cellSize,
                        i * this.cellSize,
                        this.cellSize - 1,
                        this.cellSize - 1
                    );
                }
            });
        });
    }

    initEventListeners() {
        let painting = false;
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.running) {
                painting = true;
                this.toggleCell(e);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (painting) this.toggleCell(e);
        });
        
        window.addEventListener('mouseup', () => painting = false);
    }

    toggleCell(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.grid[row][col] = !this.grid[row][col];
            this.draw();
        }
    }
}

// Initialize game
const canvas = document.getElementById('board');
const game = new GameOfLife(canvas);

// UI Controls
document.getElementById('start').addEventListener('click', () => {
    game.running = true;
    const interval = setInterval(() => {
        game.step();
        game.draw();
    }, game.speed);
    document.getElementById('pause').addEventListener('click', () => {
        clearInterval(interval);
        game.running = false;
    });
});

// Additional event listeners for other controls would be added here