/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bat: {
          bg: '#0B0D12',
          panel: '#141821',
          elevated: '#1C2230',
          border: '#242C3D',
          borderLight: '#323E54',
          text: '#F3F5F7',
          muted: '#9AA4B2',
          amber: '#E0B34C',
          amberDark: '#B88B2A',
          blue: '#6AA9FF',
          green: '#5BC69A',
          red: '#E36C70'
        }
      },
      fontFamily: {
        tactical: ['Chakra Petch', 'Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        'bat-glow': '0 0 15px -3px rgba(224, 179, 76, 0.25)',
        'bat-glow-lg': '0 0 25px -2px rgba(224, 179, 76, 0.35)',
        'panel-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.7)'
      }
    },
  },
  plugins: [],
}
