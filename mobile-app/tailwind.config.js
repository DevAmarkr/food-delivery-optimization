module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './App.{js,jsx,ts,tsx}', // Main entry point
    './app/**/*.{js,jsx,ts,tsx}', // Include all files in the app folder
    './src/**/*.{js,jsx,ts,tsx}', // Include all files in the src folder (if applicable)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};