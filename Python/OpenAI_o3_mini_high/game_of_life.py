# game_of_life.py
import copy
import random

class GameOfLife:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.grid = [[0 for _ in range(cols)] for _ in range(rows)]
        self.history = []       # stores past states for backward stepping
        self.max_history = 600  # maximum number of generations stored
        self.generation = 0

    def count_live_neighbors(self, i, j):
        count = 0
        for x in range(max(0, i - 1), min(self.rows, i + 2)):
            for y in range(max(0, j - 1), min(self.cols, j + 2)):
                if (x, y) != (i, j):
                    count += self.grid[x][y]
        return count

    def step(self):
        new_grid = [[0 for _ in range(self.cols)] for _ in range(self.rows)]
        for i in range(self.rows):
            for j in range(self.cols):
                live_neighbors = self.count_live_neighbors(i, j)
                if self.grid[i][j] == 1:
                    if live_neighbors in [2, 3]:
                        new_grid[i][j] = 1
                    else:
                        new_grid[i][j] = 0
                else:
                    if live_neighbors == 3:
                        new_grid[i][j] = 1
        self.add_history(self.grid)
        self.grid = new_grid
        self.generation += 1

    def add_history(self, state):
        # Save a deep copy of the current state
        self.history.append(copy.deepcopy(state))
        if len(self.history) > self.max_history:
            self.history.pop(0)

    def randomize(self, density):
        # Use density (a value up to 250) to set a probability threshold.
        # Here we map density to a probability between 0.04 and 1.0.
        probability = density / 250.0
        for i in range(self.rows):
            for j in range(self.cols):
                self.grid[i][j] = 1 if random.random() < probability else 0
        self.history = []
        self.generation = 0

    def clear_board(self):
        self.grid = [[0 for _ in range(self.cols)] for _ in range(self.rows)]
        self.history = []
        self.generation = 0

    def toggle_cell(self, i, j):
        if 0 <= i < self.rows and 0 <= j < self.cols:
            self.grid[i][j] = 0 if self.grid[i][j] == 1 else 1

    def set_board(self, board):
        self.grid = board
        self.history = []
        self.generation = 0

    def load_pattern(self, pattern_name):
        # Clears the board and loads a preset pattern
        self.clear_board()
        if pattern_name.lower() == "glider":
            # Place a glider in the middle of the board
            mid_i = self.rows // 2
            mid_j = self.cols // 2
            glider_coords = [(0, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
            for dx, dy in glider_coords:
                if 0 <= mid_i + dx < self.rows and 0 <= mid_j + dy < self.cols:
                    self.grid[mid_i + dx][mid_j + dy] = 1
        elif pattern_name.lower() == "pulsar":
            # A simplified pulsar pattern
            mid_i = self.rows // 2 - 3
            mid_j = self.cols // 2 - 3
            pulsar_coords = [
                (0, 2), (0, 3), (0, 4),
                (5, 2), (5, 3), (5, 4),
                (2, 0), (3, 0), (4, 0),
                (2, 5), (3, 5), (4, 5)
            ]
            for dx, dy in pulsar_coords:
                if 0 <= mid_i + dx < self.rows and 0 <= mid_j + dy < self.cols:
                    self.grid[mid_i + dx][mid_j + dy] = 1

    def count_live_cells(self):
        return sum(sum(row) for row in self.grid)
