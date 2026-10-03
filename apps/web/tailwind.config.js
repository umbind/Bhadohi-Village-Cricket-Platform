/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bvcp-primary': '#1E7A4C',
        'bvcp-primary-dark': '#165a38',
        'bvcp-forest': '#123B2A',
        'bvcp-cream': '#F6F8F3',
        'bvcp-amber': '#F4B942',
        'bvcp-error': '#C74D4D',
        'bvcp-border': '#E1E8E1',
        'bvcp-text': '#172019',
        'bvcp-muted': '#68756C',
      },
      fontFamily: {
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      }
    },
  },
  plugins: [],
};
