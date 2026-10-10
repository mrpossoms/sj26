# sj26
SpookyJam 26

## Setup

**Requirements**
1. python3
1. [nodejs (>= 20)](https://nodejs.org/en/download)
1. [gitman (pip)](https://pypi.org/project/gitman/)

```sh
gitman install       # Installs g.js as a git submodule in deps/g.js
npm install          # links deps/g.js into node_modules and installs its dependencies
npm run dev          # http://localhost:3001
npm run bake         # Bake as a self-contained html doc dist/my-game.html
```
