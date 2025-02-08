# noise_generation.py
import opensimplex
import random

def generate_noise_board(rows, cols, seed=None, scale=10.0):
    if seed is None:
        seed = random.randint(0, 10000)
    # Establece la semilla para OpenSimplex Noise
    opensimplex.seed(seed)
    
    board = [[0 for _ in range(cols)] for _ in range(rows)]
    for i in range(rows):
        for j in range(cols):
            # Se genera el ruido usando las coordenadas escaladas
            n = opensimplex.noise2(x=i / scale, y=j / scale)
            board[i][j] = 1 if n > 0 else 0
    return board
