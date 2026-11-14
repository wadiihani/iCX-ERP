// Svelte 5 rune-based Theme Store
export class ThemeStore {
	current = $state<'dark' | 'light'>('dark');

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
			if (saved) {
				this.current = saved;
			} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
				this.current = 'light';
			}
			this.apply();
		}
	}

	toggle() {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		this.apply();
	}

	setTheme(theme: 'dark' | 'light') {
		this.current = theme;
		this.apply();
	}

	private apply() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', this.current);
			if (this.current === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}
}

export const theme = new ThemeStore();
