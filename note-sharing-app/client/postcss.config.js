module.exports = {
  plugins: {
    // This correctly runs the Tailwind engine with its own config.
    '@tailwindcss/postcss': { config: './tailwind.config.js' },
    // Autoprefixer is often necessary to avoid vendor prefix warnings.
    'autoprefixer': {},
  },
};