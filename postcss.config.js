export default {
  plugins: {
    'postcss-import': {
      from: undefined // Explicitly set to fix the warning
    },
    tailwindcss: {},
    autoprefixer: {},
  },
}
