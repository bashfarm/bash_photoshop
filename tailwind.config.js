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
            colors: {
                ...defaultTheme.colors,
                white: '#ffffff',
                'gray-lightest': '#f9f8fa',
                'gray-lighter': '#e5e4e6',
                'gray-light': '#d1d1d2',
                gray: '#bfbec0',
                'gray-dark': '#979698',
                'gray-darker': '#6f6f70',
                'gray-darkest': '#49484a',
                black: '#212122',

                'brand-light': '#e5d2ff',
                brand: '#7e4dfb',
                'brand-dark': '#422a76',

                'cta-light': '#fff4d4',
                cta: '#fbd54d',
                'cta-dark': '#76652b',

                'info-light': '#ddf0ff',
                info: '#59c2ff',
                'info-dark': '#335d77',

                'warning-light': '#ffefd7',
                warning: '#f3bf5f',
                'warning-dark': '#735b32',

                'success-light': '#ddf4dc',
                success: '#6cd175',
                'success-dark': '#38633b',

                'danger-light': '#ffd2d7',
                danger: '#f13769',
                'danger-dark': '#732535',
            },
        },
    },
    plugins: [],
};
