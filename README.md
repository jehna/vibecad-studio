# VibeCAD Studio

A browser-based CAD modeling workbench built on [replicad](https://replicad.xyz) and OpenCASCADE. Write JavaScript code to create parametric 3D models, visualize them in real-time, and export to STEP, STL, and other formats.

Forked from [Replicad Studio](https://studio.replicad.xyz/) by QuaroTech Sarl.

## Features

- **Code-driven CAD** -- Write replicad JavaScript to define parametric 3D models
- **Live 3D preview** -- Real-time visualization with Three.js
- **Model library** -- Browse and open models from the built-in gallery
- **Export** -- Download models as STEP, STL, SVG, or JSON
- **Parametric editing** -- Adjust model parameters via a GUI without changing code
- **Auto-reload** -- Optionally watch a local file for changes
- **PWA** -- Installable as a progressive web app for offline use
- **Dark mode** -- Automatic theme based on system preference

## Getting Started

```bash
git clone <repo-url> vibecad-studio
cd vibecad-studio
npm install
```

Run the dev server:

```bash
npm start
```

Build for production:

```bash
npm run build
```

The output goes to `dist/`. Serve it with any static file server:

```bash
npm run serve
```

## Adding Models

Create a new folder under `src/models/` with a `model.ts` file containing your replicad code and an `index.ts` that exports the model metadata:

```
src/models/my-model/
  model.ts    # replicad JavaScript code
  index.ts    # exports { name, description, slug, code }
```

See `src/models/example-vase/` for reference. Models are automatically discovered and shown on the landing page.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 7** with PWA plugin
- **Tailwind CSS v4**
- **Three.js** / React Three Fiber for 3D rendering
- **Monaco Editor** for code editing
- **MobX State Tree** for state management
- **replicad** + OpenCASCADE.js for CAD operations

## License

MIT -- see [LICENSE](LICENSE) for details.
