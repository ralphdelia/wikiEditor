interface EventMap {
  "message-created": { message: string };
}

export namespace Bus {
  const eventBus = new EventTarget();

  export function subscribe<K extends keyof EventMap>(
    eventType: string,
    handler: (event: CustomEvent<EventMap[K]>) => void,
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
