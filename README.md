# Game of Life Trails

An interactive Conway's Game of Life simulation with random seeds, colored generation trails, configurable population culling, and selectable palettes.

## Run it

Open `index.html` in a modern web browser:

```bash
open index.html
```

No dependencies or build step are required.

## Features

- 50 by 50 wrapping Game of Life grid
- Fresh random seed on page load and when clearing
- Generation-specific color shades with fading trails
- Palette picker: Rose, Ocean, Forest, Sunset, and Violet
- Configurable population cull: every X generations, remove X random live cells
- Click cells to toggle them before starting the simulation

## Controls

| Control | Description |
| --- | --- |
| Generations to run | Number of generations to simulate |
| Cull every X generations | Frequency and number of randomly removed live cells |
| Palette | Color scheme used for live cells and trails |
| Run Simulation | Starts the selected number of generations |
| Clear | Removes the current state and generates a new random seed |
