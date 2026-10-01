# Manim Node Studio

<div align="center">
  <h3>A Cross-Platform Desktop Node-Graph Editor for Manim Community Edition</h3>
  <p>Create mathematical animations visually by dragging, dropping, and connecting nodes, then render them directly with local Python Manim CE.</p>
</div>

---

## 🌟 Highlights & Features

- **Intuitive Visual Node Canvas**: Powered by `@xyflow/react` (React Flow) with zoom/pan, minimap, snap-to-grid, multi-selection, comment grouping boxes, and port color-coding.
- **Data-Driven Node Library**: Complete initial library covering Scene Root, 2D/3D Mobjects (Circle, Square, Rectangle, Triangle, Line, Arrow, Dot, Text, MathTex LaTeX, Axes, NumberPlane, Function Graph Plots, VGroups), Animations (Create, FadeIn, FadeOut, Write, Transform, ReplacementTransform, Rotate, Shift, Scale, Indicate, GrowFromCenter, DrawBorderThenFill), Flow Composition (Play, Wait, AnimationGroup, LaggedStart, Succession), Modifiers (SetColor, SetFill, SetStroke, NextTo, Position), Values, and Camera movements.
- **Topological Compiler & Cycle Detection**: Live topological sort ordering, automatic dependency graph resolution, port connection validation, and cycle detection. Offending nodes are immediately badged with diagnostics on the canvas.
- **Live Monaco Code Generation**: Real-time read-only Python code panel syntax-highlighted using Monaco Editor. See the generated Manim CE Python `Scene` class update as you connect wires.
- **Local Python Subprocess Execution**: Zero cloud or web server dependencies. Spawns `python -m manim render` via secure argument arrays with live terminal log streaming and regex progress parsing.
- **Safe Media Protocol (`app://media/`)**: Renders are served into the HTML5 video preview player via an Electron custom scheme supporting range requests and timeline scrubbing without compromising web security (`contextIsolation: true`, `sandbox: true`).
- **Comprehensive Python Health Checker**: Automated detection of Python 3.9+, Manim Community, FFmpeg, and LaTeX with pass/fail indicators, custom virtualenv path overrides, and install assistance.
- **Complete Project File Management**: Save & open versioned `.mnproj` JSON project files, autosave crash recovery, standalone `.py` export, and pre-built interactive examples.
- **Undo / Redo History**: Full undo/redo snapshots with keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).

---

## 🛠 Tech Stack

- **Desktop Framework**: [Electron 34](https://www.electronjs.org/) + [Vite 6](https://vitejs.dev/) via `electron-vite`
- **UI Framework**: [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Node Canvas**: [@xyflow/react](https://reactflow.dev/) (React Flow v12)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) (Dark Mode)
- **Packaging**: [electron-builder](https://www.electron.build/)
- **Test Runner**: [Vitest](https://vitest.dev/)
- **Math Animation Engine**: Python 3.9+ with [Manim Community Edition](https://www.manim.community/) and FFmpeg

---

## 📋 System Prerequisites

1. **Node.js**: v18.0.0 or higher (v20+ recommended)
2. **Python**: v3.9 or higher
3. **Manim Community Edition**:
   ```bash
   pip install manim
   ```
4. **FFmpeg**:
   - **Windows**: `winget install Gyan.FFmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg`
5. **LaTeX (Optional)**:
   - Only required if using `MathTex` LaTeX formula nodes. Standard `Text` nodes do not require LaTeX.
   - Recommended: [MiKTeX](https://miktex.org/) (Windows) or [MacTeX](https://tug.org/mactex/) (macOS) or `texlive-full` (Linux).

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/manim-node-studio.git
cd manim-node-studio
npm install
```

### 2. Development Mode
Start Electron with Hot Module Replacement (HMR):
```bash
npm run dev
```

### 3. Running Tests
Run unit tests for the graph compiler, cycle detection, port validator, and Python syntax compilation:
```bash
npm test
```

### 4. Production Build
Compile TypeScript and bundle renderer assets:
```bash
npm run build
```

### 5. Packaging Executables
Package desktop application binaries for Windows (`.exe`/`.zip`), macOS (`.dmg`), or Linux (`.AppImage`):
```bash
npm run package
```

---

## 🧩 Node Reference

### 1. Scene
- **Scene Root**: The entry point defining the scene name, background color, target frame rate, and render quality profile. Outputs the root `Scene-Flow` wire.

### 2. Mobjects
- **Circle**: Radius, color, fill opacity, stroke width.
- **Square**: Side length, color, fill opacity, stroke width.
- **Rectangle**: Width, height, color, fill opacity, stroke width.
- **Triangle**: Regular triangle polygon with radius, color, and fill.
- **Line**: 3D segment between start point and end point with stroke width.
- **Arrow**: Directional pointer vector with arrow head and buffer.
- **Dot**: Coordinate point indicator with radius and color.
- **Text**: Standard typography string without LaTeX dependencies.
- **MathTex / LaTeX**: Mathematical equations formatted in LaTeX (e.g. `e^{i\pi} + 1 = 0`).
- **Axes**: 2D coordinate system with customizable X/Y ranges, dimensions, and arrow tips.
- **NumberPlane**: Coordinate grid plane with grid lines.
- **Graph Plot**: Function expression curve (e.g. `np.sin(x)`) evaluated on connected `Axes`.
- **VGroup**: Collects multiple vector mobjects into a unified group.

### 3. Animations
- **Create**: Traces perimeter and materializes mobject.
- **FadeIn / FadeOut**: Opacity transition with optional directional shift.
- **Write**: Simulates handwriting text or vector curves.
- **Transform / ReplacementTransform**: Morphs source mobject shape into target mobject.
- **Rotate**: Angular rotation around axis.
- **Shift / MoveTo**: Vector translation or relocation to target coordinate.
- **Scale**: Uniform or proportional scaling factor.
- **Indicate**: Pulsing highlight to draw visual attention.
- **GrowFromCenter**: Expands mobject outward from center.
- **DrawBorderThenFill**: Draws outline first, then fills interior color.

### 4. Composition & Flow
- **Play**: Executes one or more simultaneous animations in sequence along the `Scene-Flow` wire.
- **Wait**: Pauses the animation sequence for a specified duration in seconds.
- **AnimationGroup**: Groups multiple animations with optional lag ratio.
- **LaggedStart**: Staggers animation start times one after another.
- **Succession**: Executes animations sequentially within a single animation container.

### 5. Modifiers
- **SetColor / SetFill / SetStroke**: Customizes stroke color, fill color, opacity, and line thickness.
- **NextTo**: Positions a mobject adjacent to another reference mobject along any cardinal direction.
- **Position**: Places mobjects at screen edges (`to_edge`) or offsets them.

### 6. Values
- **Number**: Constant float scalar.
- **Vector3**: 3D `[X, Y, Z]` coordinate array.
- **Color Picker**: Color selection with hex values and presets.
- **Math Expression**: Python formula expression (e.g. `2 * PI`).
- **Slider**: Bounded interactive numeric range.

### 7. Camera
- **Camera Move / Zoom**: Animates camera zooming and panning (automatically switches base class to `MovingCameraScene`).

---

## 🔒 Security Architecture

1. **Sandboxed Renderer**: `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`. The renderer process cannot directly execute OS commands or read arbitrary files.
2. **Strongly-Typed Context Bridge**: Preload exposes a minimal, strictly typed `window.manimStudio` API communicating via explicit IPC channels (`src/shared/ipc-types.ts`).
3. **No Shell String Concatenation**: Python child processes are spawned directly using argument arrays via `child_process.spawn(pythonExe, args, { windowsHide: true })`, eliminating shell injection risks.
4. **Safe Custom Media Protocol**: Videos rendered in temporary directories are streamed into `<video>` tags via registered `app://media?path=...` handlers supporting HTTP range byte requests (HTTP 206) without disabling CORS or web security.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` / `Right Click` | Open Quick Add Node Menu at cursor |
| `Ctrl+Enter` | Quick Preview Render (`-ql`, low quality) |
| `Ctrl+S` | Save Project (`.mnproj`) |
| `Ctrl+O` | Open Project |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Delete` / `Backspace` | Delete Selected Node or Edge |
| Double Click Node in Palette | Add node directly to center of canvas |

---

## 📁 Project File Format (`.mnproj`)

Projects are saved as JSON files conforming to `schemaVersion: 1`:
```json
{
  "schemaVersion": 1,
  "name": "My Animation",
  "createdAt": 1790785000000,
  "updatedAt": 1790785000000,
  "settings": {
    "sceneName": "GeneratedScene",
    "quality": "low",
    "resolution": [854, 480],
    "fps": 30,
    "backgroundColor": "#0d1117",
    "transparent": false
  },
  "nodes": [...],
  "edges": [...],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

---

## 📄 License

MIT License. Built for the mathematical animation community.
