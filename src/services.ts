import { Bus } from "./bus";

export namespace Service {
  const registry = new Map<string, () => void>();

  export function register(name: string, fn: () => void): void {
    if (registry.has(name)) {
      throw new Error(`Service "${name}" is already registered.`);
    }
    registry.set(name, fn);

    Bus.publish("service-init", { name });
  }

  export function init(): void {
    for (const [name, fn] of registry) {
      try {
        fn();
        console.log(`Initialized service: ${name}`);
      } catch (err) {
        console.error(`Failed to initialize service "${name}":`, err);
      }
    }
  }
}
