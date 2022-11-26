const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './dist/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            screens: {
                mini: '150px',
                ...defaultTheme.screens,
            },
        },
    },
    plugins: [],
};
