# main.py
import pygame
import pygame_gui
import time

from game_of_life import GameOfLife
from ui import GameUI, HistoryPanel
from charting import Chart
from gif_generator import generate_gif
import noise_generation

# Window dimensions and layout regions
WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 720
LEFT_WIDTH = 250
RIGHT_WIDTH = 250
CENTER_WIDTH = WINDOW_WIDTH - LEFT_WIDTH - RIGHT_WIDTH

# Initial grid dimensions (can later be set by the density slider up to 250x250)
GRID_ROWS = 100
GRID_COLS = 100

def main():
    pygame.init()
    pygame.display.set_caption("Conway's Game of Life")
    window_surface = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))

    # Set up pygame_gui manager (a dark-themed JSON file can be loaded here if available)
    manager = pygame_gui.UIManager((WINDOW_WIDTH, WINDOW_HEIGHT))
    
    clock = pygame.time.Clock()
    is_running = True

    # Initialize simulation and UI objects
    game = GameOfLife(GRID_ROWS, GRID_COLS)
    simulation_running = False
    last_update_time = time.time()
    
    # Left sidebar for simulation controls
    left_panel_rect = pygame.Rect(0, 0, LEFT_WIDTH, WINDOW_HEIGHT)
    game_ui = GameUI(left_panel_rect, manager)
    
    # Right sidebar for simulation history and GIF generation
    right_panel_rect = pygame.Rect(WINDOW_WIDTH - RIGHT_WIDTH, 0, RIGHT_WIDTH, WINDOW_HEIGHT)
    history_panel = HistoryPanel(right_panel_rect, manager)
    
    # Matplotlib chart area for live cell counts (placed at the bottom of the center area)
    chart_height = 200
    chart = Chart(CENTER_WIDTH, chart_height)
    
    # Center simulation board area
    center_panel_rect = pygame.Rect(LEFT_WIDTH, 0, CENTER_WIDTH, WINDOW_HEIGHT - chart_height)
    
    # Store captured frames for GIF creation (up to max_history frames)
    gif_frames = []

    while is_running:
        time_delta = clock.tick(60) / 1000.0
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                is_running = False

            manager.process_events(event)
            
            # Handle UI button events
            if event.type == pygame_gui.UI_BUTTON_PRESSED:
                if event.ui_element == game_ui.ui_elements['start_pause_button']:
                    simulation_running = not simulation_running
                    new_text = "Pause" if simulation_running else "Start"
                    game_ui.ui_elements['start_pause_button'].set_text(new_text)
                elif event.ui_element == game_ui.ui_elements['restart_button']:
                    game.clear_board()
                    game.generation = 0
                    game.history = []
                    gif_frames = []
                elif event.ui_element == game_ui.ui_elements['step_forward_button']:
                    game.step()
                elif event.ui_element == game_ui.ui_elements['step_backward_button']:
                    if game.history:
                        game.grid = game.history.pop()
                        game.generation -= 1
                elif event.ui_element == game_ui.ui_elements['random_button']:
                    density = game_ui.ui_elements['density_slider'].get_current_value()
                    game.randomize(int(density))
                elif event.ui_element == game_ui.ui_elements['perlin_button']:
                    # Procedural generation using Perlin noise
                    board = noise_generation.generate_noise_board(game.rows, game.cols)
                    game.set_board(board)
                elif event.ui_element == game_ui.ui_elements['pattern_dropdown']:
                    selected = game_ui.ui_elements['pattern_dropdown'].selected_option
                    if selected == "Glider":
                        game.load_pattern("glider")
                    elif selected == "Pulsar":
                        game.load_pattern("pulsar")
                elif event.ui_element == history_panel.gif_button:
                    filename = generate_gif(gif_frames)
                    print("GIF saved as", filename)

            # Allow drawing mode when clicking inside the simulation board area
            if event.type == pygame.MOUSEBUTTONDOWN:
                if center_panel_rect.collidepoint(event.pos):
                    cell_width = center_panel_rect.width / game.cols
                    cell_height = center_panel_rect.height / game.rows
                    # Calculate grid coordinates (adjusting for the left sidebar offset)
                    x = int((event.pos[0] - LEFT_WIDTH) // cell_width)
                    y = int(event.pos[1] // cell_height)
                    game.toggle_cell(y, x)

        manager.update(time_delta)

        # Update simulation if running; delay between steps is governed by the speed slider
        speed = game_ui.ui_elements['speed_slider'].get_current_value() / 1000.0
        current_time = time.time()
        if simulation_running and (current_time - last_update_time >= speed):
            game.step()
            last_update_time = current_time
            # Capture the board’s image for GIF generation
            board_surface = pygame.Surface(center_panel_rect.size)
            draw_simulation_board(board_surface, game)
            gif_frames.append(board_surface.copy())
            if len(gif_frames) > game.max_history:
                gif_frames.pop(0)

        # Draw background
        window_surface.fill((30, 30, 30))
        
        # Draw simulation board in center area
        board_surface = pygame.Surface(center_panel_rect.size)
        draw_simulation_board(board_surface, game)
        window_surface.blit(board_surface, (LEFT_WIDTH, 0))
        
        # Draw left and right sidebar backgrounds
        pygame.draw.rect(window_surface, (50, 50, 50), left_panel_rect)
        pygame.draw.rect(window_surface, (50, 50, 50), right_panel_rect)
        
        # Update and draw the Matplotlib chart at the bottom of the center area
        chart_surface = chart.update(game.generation, game.count_live_cells())
        window_surface.blit(chart_surface, (LEFT_WIDTH, WINDOW_HEIGHT - chart_height))
        
        manager.draw_ui(window_surface)
        pygame.display.update()

    pygame.quit()

def draw_simulation_board(surface, game):
    """Renders the game board onto the provided surface."""
    surface.fill((20, 20, 20))
    rows = game.rows
    cols = game.cols
    cell_width = surface.get_width() / cols
    cell_height = surface.get_height() / rows

    # Draw live cells
    for i in range(rows):
        for j in range(cols):
            if game.grid[i][j] == 1:
                rect = pygame.Rect(j * cell_width, i * cell_height, cell_width, cell_height)
                pygame.draw.rect(surface, (0, 200, 0), rect)
                
    # Optionally draw grid lines for clarity
    for i in range(rows + 1):
        y = i * cell_height
        pygame.draw.line(surface, (40, 40, 40), (0, y), (surface.get_width(), y))
    for j in range(cols + 1):
        x = j * cell_width
        pygame.draw.line(surface, (40, 40, 40), (x, 0), (x, surface.get_height()))

if __name__ == "__main__":
    main()