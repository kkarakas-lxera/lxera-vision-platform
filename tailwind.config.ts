
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// LXERA Brand Colors - Enhanced with consistent opacity variants
				'smart-beige': {
					DEFAULT: '#EFEFE3',
					50: '#FAFAF8',
					100: '#F7F7F4',
					200: '#EFEFE3',
					300: '#E7E7D2',
					400: '#DFDFC1',
					500: '#D7D7B0',
					600: '#CFCF9F',
					700: '#C7C78E',
					800: '#BFBF7D',
					900: '#B7B76C'
				},
				'future-green': {
					DEFAULT: '#7AE5C6',
					50: '#F0FDF9',
					100: '#CCFBEF',
					200: '#99F6E4',
					300: '#5EEBD4',
					400: '#26D0CE',
					500: '#7AE5C6',
					600: '#0891B2',
					700: '#0E7490',
					800: '#155E75',
					900: '#164E63'
				},
				'business-black': {
					DEFAULT: '#191919',
					50: '#F8F8F8',
					100: '#E6E6E6',
					200: '#CCCCCC',
					300: '#B3B3B3',
					400: '#999999',
					500: '#808080',
					600: '#666666',
					700: '#4D4D4D',
					800: '#333333',
					900: '#191919'
				},
				'lxera-red': '#f94343',
				'lxera-blue': '#89baef',
				'light-green': '#e8fa9b',
				'emerald': '#029c55',
				// Brand accent color (previously hardcoded #BFCB80)
				'brand-accent': {
					DEFAULT: '#BFCB80',
					50: '#F5F7EC',
					100: '#EAEED8',
					200: '#D5DDB1',
					300: '#BFCB80',
					400: '#A9B95A',
					500: '#93A634',
					600: '#7A8B29',
					700: '#60701F',
					800: '#475515',
					900: '#2E3A0B'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-scale': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'slide-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'float-gentle': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'bounce-slow': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px rgba(122, 229, 198, 0.3)' },
					'50%': { boxShadow: '0 0 20px rgba(122, 229, 198, 0.6)' }
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'scale-pulse': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'fade-in-scale': 'fade-in-scale 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'float-gentle': 'float-gentle 4s ease-in-out infinite',
				'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
				'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 3s ease infinite',
				'scale-pulse': 'scale-pulse 2s ease-in-out infinite',
				'spin-slow': 'spin-slow 3s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
