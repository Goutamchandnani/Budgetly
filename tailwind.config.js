/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                budgetly: {
                    base: '#0A2A1F',    // Deep Forest
                    mid: '#1B4D3E',     // Studio Green
                    accent: '#CCFF00',  // Electric Lime
                    white: '#F5F5F5',   // Pristine White
                    sage: '#88A096',    // Sage Mist
                },
                primary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    500: '#CCFF00', // Electric Lime as primary 500
                    600: '#a3cc00',
                    700: '#1B4D3E', // Studio Green as dark primary
                },
                dark: {
                    900: '#0A2A1F',
                    800: '#1B4D3E',
                    700: '#2A5C4D',
                },
                success: {
                    500: '#22c55e',
                    600: '#16a34a',
                },
                warning: {
                    500: '#f59e0b',
                    600: '#d97706',
                },
                danger: {
                    500: '#ef4444',
                    600: '#dc2626',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
