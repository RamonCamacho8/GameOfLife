# charting.py
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg
import pygame

class Chart:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        # Create a Matplotlib figure with a size scaled for our surface
        self.fig, self.ax = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        self.ax.set_title("Live Cells Over Generations")
        self.ax.set_xlabel("Generation")
        self.ax.set_ylabel("Live Cell Count")
        self.live_cell_counts = []
        self.generations = []
        self.line, = self.ax.plot([], [], color='cyan')
        self.canvas = FigureCanvasAgg(self.fig)
        self.fig.tight_layout()

    def update(self, generation, live_count):
        self.generations.append(generation)
        self.live_cell_counts.append(live_count)
        self.line.set_data(self.generations, self.live_cell_counts)
        self.ax.relim()
        self.ax.autoscale_view()

        self.canvas.draw()
        renderer = self.canvas.get_renderer()
        raw_data = renderer.tostring_argb()
        size = self.canvas.get_width_height()
        chart_surface = pygame.image.fromstring(raw_data, size, "RGBA")
        return chart_surface
