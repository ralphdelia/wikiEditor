import { Todo } from "../todo";

export namespace Bus {
  export interface EventMap {
    "message-incoming": { id: string; message: string };
    "todo-publish": { id: string; todos: Todo.TodoInfo[]; prompt: string };
    "service-init": { name: string };
    "agent-event": { agent: string; type: string; desc?: string };
  }
  const eventBus = new EventTarget();

  export function subscribe<K extends keyof EventMap>(
    eventType: K,
    handler: (event: CustomEvent<EventMap[K]>) => void,
  ): () => void {
    const listener = handler as EventListener;
    eventBus.addEventListener(eventType, listener);
    return () => eventBus.removeEventListener(eventType, listener);
  }

  export function publish<K extends keyof EventMap>(
    eventType: K,
    payload: EventMap[K],
  ): void {
    const evt = new CustomEvent(eventType, { detail: payload });
    eventBus.dispatchEvent(evt);
  }
}
