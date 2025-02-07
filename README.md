# ramoncamacho8-gameoflife

This repository contains multiple implementations of Conway's Game of Life, built according to the specifications outlined in `prompt.txt`.  The implementations leverage JavaScript, HTML, and CSS to create interactive simulations within a browser environment.  Different large language models (LLMs) were used to generate the code, resulting in varying approaches and levels of completeness.

## Directory Structure

```
Directory structure:
└── ramoncamacho8-gameoflife/
    ├── prompt.txt
    ├── DeepSeek/
    │   ├── index.html
    │   ├── script.js
    │   └── styles.css
    ├── Gemini/
    │   ├── index.html
    │   ├── script.js
    │   ├── style.css
    │   └── lib/
    │       ├── chart.js
    │       ├── gif.js
    │       ├── gif.worker.js
    │       └── perlin.js
    ├── OpenAI_o3_mini_high/
    │   ├── index.html
    │   ├── script.js
    │   └── style.css
    └── Qwen2.5/
        ├── index.html
        ├── script.js
        ├── style.css
        └── assets/
            ├── chart.js
            ├── gif.js
            └── perlin.js

```






## Files Content Summary

*   **prompt.txt:** Contains the comprehensive prompt provided to the LLMs.  It details the desired features of the Game of Life simulation, including layout, core simulation features, history management, GIF generation, timeline visualization, and implementation details.

*   **DeepSeek/:**  A basic implementation.  Includes HTML, CSS, and JavaScript files to create the Game of Life simulation. Event listeners are only partially implemented. Does not include GIF generation, Simulation History, or timeline visualization. The included simplex-noise library appears unused.

*   **Gemini/:**  A more complete implementation compared to DeepSeek.  Includes HTML, CSS, JavaScript, and supporting libraries (`gif.js`, `gif.worker.js`, `perlin.js`).  It offers features such as adjustable cell density and time steps, random initialization, Perlin noise generation, and GIF generation. It implements simulation history. The char.js library is included but commented out.

*   **OpenAI\_o3\_mini\_high/:** Another complete implementation with HTML, CSS, and JavaScript.  It includes features such as adjustable grid size and time step, random initialization, Perlin noise, predefined patterns, simulation history, and GIF generation. Uses CDN for libraries.

*   **Qwen2.5/:** A basic implementation.  It features adjustable cell density and time steps, start/pause/restart controls, and random/procedural initialization.  Includes required assets (Perlin Noise, GIF, Chart.js). However, many functions are incomplete and the provided chart.js and gif.js snippets are improperly used.

## Usage

To run any of the implementations:

1.  Clone this repository: `git clone <repository_url>`
2.  Navigate to the desired implementation's directory (e.g., `cd Gemini/`).
3.  Open the `index.html` file in your web browser.

## Features (Based on `prompt.txt`)

The prompt requested the following features:

*   **Layout & Design:** Fullscreen layout, sidebars (configuration & history/GIF), dark Material-like theme.
*   **Core Simulation:** Fixed board size, adjustable cell density & time steps, drawing mode, start/pause/restart/step controls, initial conditions (random, Perlin Noise, presets).
*   **History & State:** Client-side storage, loading past simulations.
*   **GIF Generation:** Client-side GIF creation, save/download.
*   **Timeline Visualization:** Line graph showing live cells per step, interactive navigation.

Each implementation achieves different subsets of these features with varying levels of completeness.

## Notes

*   Each implementation was generated automatically by an LLM based on `prompt.txt`.  The quality and completeness vary.
*   Performance may vary based on browser and hardware.  The `prompt.txt` limits the board size to 250x250 and the timeline to 600 steps to mitigate performance issues.
*   Some implementations may require a local web server to properly load assets or handle GIF generation.
*   The provided code may need further refinement and testing to ensure full compliance with `prompt.txt`.