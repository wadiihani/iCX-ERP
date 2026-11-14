import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				brand: {
					blue: '#037ef3',
					navy: '#0a325c',
					teal: '#00c0b5',
					amber: '#f39c12',
					emerald: '#2ecc71',
					crimson: '#e74c3c',
				},
				surface: {
					0: 'rgb(var(--surface-0) / <alpha-value>)',
					1: 'rgb(var(--surface-1) / <alpha-value>)',
					2: 'rgb(var(--surface-2) / <alpha-value>)',
					3: 'rgb(var(--surface-3) / <alpha-value>)',
					border: 'rgb(var(--surface-border) / <alpha-value>)',
				},
				content: {
					primary: 'rgb(var(--content-primary) / <alpha-value>)',
					secondary: 'rgb(var(--content-secondary) / <alpha-value>)',
					muted: 'rgb(var(--content-muted) / <alpha-value>)',
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			}
		}
	},
	plugins: []
} satisfies Config;
