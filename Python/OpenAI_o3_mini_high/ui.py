# ui.py
import pygame
import pygame_gui

class GameUI:
    def __init__(self, rect, manager):
        self.rect = rect
        self.manager = manager
        self.ui_elements = {}
        self.create_ui_elements()

    def create_ui_elements(self):
        padding = 10
        element_width = self.rect.width - 2 * padding
        current_y = padding

        # Density slider (for board randomization density)
        self.ui_elements['density_slider'] = pygame_gui.elements.UIHorizontalSlider(
            relative_rect=pygame.Rect((padding, current_y), (element_width, 30)),
            start_value=50, value_range=(10, 250),
            manager=self.manager)
        current_y += 40

        # Time-step speed slider (0–600 ms)
        self.ui_elements['speed_slider'] = pygame_gui.elements.UIHorizontalSlider(
            relative_rect=pygame.Rect((padding, current_y), (element_width, 30)),
            start_value=300, value_range=(0, 600),
            manager=self.manager)
        current_y += 40

        # Start/Pause Button
        self.ui_elements['start_pause_button'] = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((padding, current_y), (element_width, 30)),
            text='Start',
            manager=self.manager)
        current_y += 40

        # Restart Button
        self.ui_elements['restart_button'] = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((padding, current_y), (element_width, 30)),
            text='Restart',
            manager=self.manager)
        current_y += 40

        # Step Forward Button
        self.ui_elements['step_forward_button'] = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((padding, current_y), (element_width, 30)),
            text='Step Forward',
            manager=self.manager)
        current_y += 40

        # Step Backward Button
        self.ui_elements['step_backward_button'] = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((padding, current_y), (element_width, 30)),
            text='Step Backward',
            manager=self.manager)
        current_y += 40

        # Random Initialization Button
        self.ui_elements['random_button'] = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((padding, current_y), (element_width, 30)),
            text='Random Init',
            manager=self.manager)
        current_y += 40

        # Procedural (Perlin) Generation Button
        self.ui_elements['perlin_button'] = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((padding, current_y), (element_width, 30)),
            text='Procedural Generation',
            manager=self.manager)
        current_y += 40

        # Pattern Presets Dropdown (Glider, Pulsar, etc.)
        self.ui_elements['pattern_dropdown'] = pygame_gui.elements.UIDropDownMenu(
            options_list=['Select Pattern', 'Glider', 'Pulsar'],
            starting_option='Select Pattern',
            relative_rect=pygame.Rect((padding, current_y), (element_width, 30)),
            manager=self.manager)

    def update(self, time_delta):
        self.manager.update(time_delta)

    def draw(self, surface):
        self.manager.draw_ui(surface)

class HistoryPanel:
    def __init__(self, rect, manager):
        self.rect = rect
        self.manager = manager
        padding = 10
        element_width = self.rect.width - 2 * padding
        self.history_list = pygame_gui.elements.UISelectionList(
            relative_rect=pygame.Rect((self.rect.x + padding, self.rect.y + padding),
                                      (element_width, self.rect.height - 60)),
            item_list=[],  # This can be updated with simulation history items
            manager=self.manager)
        self.gif_button = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((self.rect.x + padding, self.rect.y + self.rect.height - 45),
                                      (element_width, 30)),
            text='Generate GIF',
            manager=self.manager)

    def update_history(self, history_items):
        self.history_list.set_item_list(history_items)
