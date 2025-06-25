import { Log } from "./log";

export namespace Service {
  const registry = new Map<string, () => void>();
  const log = Log.create("service");

  export function register(name: string, fn: () => void): void {
    if (registry.has(name)) {
      throw new Error(`Service "${name}" is already registered.`);
    }
    registry.set(name, fn);
  }

  export function init(): void {
    for (const [name, fn] of registry) {
      try {
        fn();
        log.info(`${name} service started`, {});
        console.log(`Initialized service: ${name}`);
      } catch (err) {
        log.error(`${name} service caused an error when initalizing`);
      }
    }
  }
}
