import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08111f',
        tide: '#0d1b2a',
        foam: '#dff6ff',
        strike: '#1dd3b0',
        warning: '#ffb703',
        danger: '#fb7185',
      },
      boxShadow: {
        glow: '0 10px 40px rgba(29, 211, 176, 0.18)',
      },
      backgroundImage: {
        'mesh-ocean': 'radial-gradient(circle at top, rgba(29,211,176,0.18), transparent 42%), linear-gradient(180deg, #08111f 0%, #0d1b2a 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
