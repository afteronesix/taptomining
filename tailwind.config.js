/** @type {import('tailwindcss').Config} */
module.exports = {
  // Pastikan Tailwind memindai file-file ini untuk kelas yang digunakan
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Termasuk file .tsx Anda
  ],
  theme: {
    // Definisi palet warna kustom Anda
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      
      // Palet Kustom NHCoin Terminal
      'nh-bg-dark': '#101715',             // Background Hitam/Dark Green sangat pekat
      'nh-card-bg': '#192621',             // Background Card/Panel (lebih terang sedikit)
      'nh-terminal-green': '#39FF14',      // Hijau Neon Utama (untuk Aksi dan Judul)
      'nh-terminal-light': '#84D874',      // Hijau Muda (untuk angka/data sekunder)
      'nh-text-muted': '#586A65',          // Abu-abu Bisu/Muted (untuk label)
      'nh-border': '#39FF1433',            // Border (Hijau Transparan)
      'yellow-400': '#FACC15',             // Emas/Kuning untuk Gems
      'gray-300': '#D1D5DB',               // Teks default hash/rantai
      // Anda bisa menambahkan warna standar Tailwind lainnya jika diperlukan
    },
    extend: {
      // Definisi custom animasi dan keyframes
      keyframes: {
        pulseGlow: {
          '0%, 100%': { 
            opacity: 1, 
            textShadow: '0 0 4px rgba(57, 255, 20, 0.5)' 
          },
          '50%': { 
            opacity: 0.8, 
            textShadow: '0 0 10px rgba(57, 255, 20, 0.8)' 
          }
        },
        bob: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-4px)' },
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        bob: 'bob 1.5s ease-in-out infinite',
      },
      // Menggunakan font Monospace secara default di sini akan terlalu luas,
      // lebih baik terapkan 'font-mono' langsung di komponen (seperti yang sudah dilakukan).
    },
  },
  plugins: [],
}