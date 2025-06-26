// export namespace Bus {
//   export interface EventMap {
//     "message-incoming": { id: string; message: string };
//     "todo-publish": { id: string; todos: TodoInfo[]; prompt: string };
//   }

//   class EventBus extends EventTarget {
//     private readonly log = Log.create("bus");

//     override dispatchEvent(event: Event): boolean {
//       const custom = event as CustomEvent<unknown>;
//       const { type, detail } = custom;

//       this.log.info("Event", {
//         Event: type,
//         ...this.format(detail),
//       });

//       return super.dispatchEvent(event);
//     }

//     private format(value: unknown): Record<string, string> {
//       if (value && typeof value === "object") {
//         const out: Record<string, string> = {};
//         for (const [k, v] of Object.entries(value)) {
//           out[k] = typeof v === "string" ? v : JSON.stringify(v);
//         }
//         return out;
//       }
//       return { value: String(value) };
//     }
//   }

//   const eventBus = new EventBus();

//   export function subscribe<K extends keyof EventMap>(
//     eventType: K,
//     handler: (event: CustomEvent<EventMap[K]>) => void,
//   ): () => void {
//     const listener = handler as EventListener;
//     eventBus.addEventListener(eventType, listener);
//     return () => eventBus.removeEventListener(eventType, listener);
//   }

//   export function publish<K extends keyof EventMap>(
//     eventType: K,
//     payload: EventMap[K],
//   ): void {
//     const evt = new CustomEvent(eventType, { detail: payload });
//     eventBus.dispatchEvent(evt);
//   }
// }
