# gif_generator.py
import os
import time
from PIL import Image
import pygame

def generate_gif(frames, output_dir='./generated_gifs/'):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f'{output_dir}/gol_sim_{timestamp}.gif'

    pil_frames = []
    for frame in frames:
        # Convert the pygame.Surface to a string buffer, then to a PIL image
        frame_str = pygame.image.tostring(frame, 'RGB')
        pil_image = Image.frombytes('RGB', frame.get_size(), frame_str)
        pil_frames.append(pil_image)

    # Save all frames as an animated GIF
    pil_frames[0].save(filename, save_all=True, append_images=pil_frames[1:], duration=100, loop=0)
    return filename
