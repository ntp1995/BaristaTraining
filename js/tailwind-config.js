tailwind.config = {
    theme: {
        extend: {
            fontFamily: { sans: ['Prompt', 'sans-serif'] },
            colors: {
                brand: {
                    50: '#fdf8f6', 100: '#f2e8e5', 400: '#d4a373',
                    500: '#b87c67', 600: '#8c5a46', 800: '#5c3a2d', 900: '#3d251d',
                }
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '50%': { transform: 'translateX(5px)' },
                    '75%': { transform: 'translateX(-5px)' },
                },
                popIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9) translateY(10px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
                },
                pulse: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                },
                liquidFill: {
                    '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
                    '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
                },
                dropIn: {
                    '0%': { transform: 'translateY(-50px) scale(0.5)', opacity: '0' },
                    '70%': { transform: 'translateY(10px) scale(1.1)', opacity: '1' },
                    '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                slideOutRight: {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(150%)', opacity: '0' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-150%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideDownDiscard: {
                    '0%': { transform: 'translateY(0)', opacity: '1' },
                    '100%': { transform: 'translateY(150%) scale(0.8)', opacity: '0' },
                }
            },
            animation: {
                shake: 'shake 0.4s ease-in-out',
                popIn: 'popIn 0.3s ease-out forwards',
                pulseFast: 'pulse 0.5s ease-in-out',
                liquidFill: 'liquidFill 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                dropIn: 'dropIn 0.5s ease-out forwards',
                float: 'float 3s ease-in-out infinite',
                slideOutRight: 'slideOutRight 0.6s ease-in forwards',
                slideInLeft: 'slideInLeft 0.6s ease-out forwards',
                slideDownDiscard: 'slideDownDiscard 0.6s ease-in forwards',
            }
        }
    }
}
