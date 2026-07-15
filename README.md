# Life Trails

An interactive cellular automaton featuring random seeds, curated patterns, generation-colored trails, population culling, spontaneous growth, and multiple color palettes.

## About This Implementation

Life Trails starts with Conway's original birth, survival, and death rules, then adds optional environmental forces. It is no longer a strict Conway's Game of Life implementation.

- **Generation trails** – When a live cell dies, it leaves behind a fading colored trail. Trails are purely visual and never affect future generations.
- **Population culling** – Every _X_ generations, up to _X_ randomly selected live cells are removed. Culling never directly removes the final live cell, and `0` disables it. Culled cells briefly flash black.
- **Spontaneous growth** – Each empty cell has the configured per-generation chance to sprout, from `0%` to `1%`. A `0%` sprout chance disables this force, preserving selected patterns. New sprouts briefly flash bright yellow.
- **Pattern library** – Glider, Pulsar, and Gosper Glider Gun patterns can replace the current board.

These forces model a more resilient world: disturbance removes cells, while occasional spontaneous growth gives empty terrain a chance to become alive again.

The baseline cellular rules run on a wrapping (toroidal) 50 × 50 grid.

## Run It

Open `index.html` in a modern web browser:

```bash
open index.html
