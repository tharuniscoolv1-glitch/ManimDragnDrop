/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/index.html',
    './src/renderer/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0d1117',
          850: '#161b22',
          800: '#1f242c',
          700: '#2d333b',
          600: '#373e47',
          500: '#444c56'
        },
        port: {
          flow: '#eab308',     // Yellow / Amber for Scene-Flow
          mobject: '#10b981',  // Emerald for Mobjects
          anim: '#8b5cf6',     // Violet / Purple for Animations
          number: '#0ea5e9',   // Sky for Numbers
          vec3: '#f97316',     // Orange for Vector3
          color: '#ec4899',    // Pink for Colors
          string: '#94a3b8',   // Slate for Strings
          bool: '#06b6d4'      // Cyan for Booleans
        }
      }
    }
  },
  plugins: []
}
