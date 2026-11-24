/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0B1120',
          sidebar: '#0F172A',
          topnav: '#111C33',
          card: '#172554',
          form: '#172554',
          input: '#0F172A',
          table: '#172554',
          tableheader: '#1E3A5F',
          border: '#334155',
          primary: '#2563EB',
          accent: '#38BDF8',
          text: '#FFFFFF',
          muted: '#94A3B8',
          normal: '#E2E8F0',
          label: '#CBD5E1',
          link: '#60A5FA',
        },
      },
    },
  },
  plugins: [],
}
