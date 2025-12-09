// EventEmitter.ts
export class EventEmitter<T extends Record<string, (...args: any[]) => void>> {
	private listeners: { [K in keyof T]: Set<T[K]> } = {} as any;

	constructor(eventNames: (keyof T)[]) {
		for (const name of eventNames) {
			this.listeners[name] = new Set();
		}
	}

	addEventListener<K extends keyof T>(type: K, listener: T[K]): void {
		this.listeners[type].add(listener);
	}

	removeEventListener<K extends keyof T>(type: K, listener: T[K]): void {
		this.listeners[type].delete(listener);
	}

	protected emit<K extends keyof T>(type: K, ...args: Parameters<T[K]>): void {
		this.listeners[type].forEach((fn) => fn(...args));
	}

	clearEventListeners<K extends keyof T>(type?: K): void {
		if (type) this.listeners[type].clear();
		else {
			for (const key in this.listeners) this.listeners[key as keyof T].clear();
		}
	}

	removeAllListeners(): void {
		for (const key in this.listeners) this.listeners[key as keyof T].clear();
	}
}
