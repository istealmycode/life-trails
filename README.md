# Game of Life Trails

An interactive implementation of Conway's Game of Life featuring random seeds, generation-colored trails, configurable population culling, and multiple color palettes.

## About This Implementation

This project follows Conway's original Game of Life rules for births, survival, and death. Two intentional enhancements have been added:

- **Generation trails** – When a live cell dies, it leaves behind a fading colored trail. Trails are purely visual and never affect future generations.
- **Population culling** – Every _X_ generations, _X_ randomly selected live cells are removed. This introduces occasional disturbances that help prevent simulations from settling into static or repetitive patterns.

Population culling exists because, in Game of Life, bad things happen to good cells. A cell can be perfectly healthy, following all the rules, and still disappear because its neighborhood changes around it. The culling mechanic embraces that idea by introducing unexpected losses that mimic the natural chaos of the simulation. These deliberate disruptions keep the world evolving, create new interactions, and prevent some simulations from quietly reaching a predictable end state.

Aside from these enhancements, each generation is computed according to Conway's original rules on a wrapping (toroidal) 50 × 50 grid.

## Run It

Open `index.html` in a modern web browser:

```bash
open index.html
