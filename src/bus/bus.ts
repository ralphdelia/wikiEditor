export namespace Bus {
  const eventBus = new EventTarget();

  export function subscribe<T = unknown>(
    eventType: string,
    handler: (event: CustomEvent<T>) => void,
  ): () => void {
    const listener = handler as EventListener;
    eventBus.addEventListener(eventType, listener);
    return () => eventBus.removeEventListener(eventType, listener);
  }

  export function publish<T = unknown>(eventType: string, payload: T): void {
    const evt = new CustomEvent<T>(eventType, { detail: payload });
    eventBus.dispatchEvent(evt);
  }
}
