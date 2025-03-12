/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard-Regular", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#6666ff",
          secondary: "#0080ff",
          accent: "#ffffff",
          neutral: "#F7F7F7",
          "base-100": "#ffffff",
          "base-content": "#333333",
          "primary-content": "#F7F7F7",
          "secondary-content": "#F7F7F7",
        },
      },
    ],
  },
};
