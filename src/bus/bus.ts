interface EventMap {
  "message-incoming": { id: string; message: string };
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

  export function publish<K extends keyof EventMap>(
    eventType: string,
    payload: EventMap[K],
  ): void {
    const evt = new CustomEvent(eventType, { detail: payload });
    eventBus.dispatchEvent(evt);
  }
}
