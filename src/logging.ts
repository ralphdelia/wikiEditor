import { Bus } from "./bus";
import { Service } from "./services";

namespace Log {
  function truncate(text: string, max = 200): string {
    return text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
  }

  function logEvent(
    title: string,
    lines: Record<string, string | number>,
  ): void {
    console.log(`\n${title}`);
    for (const [label, value] of Object.entries(lines)) {
      console.log(`  ${label.padEnd(12)} ${value}`);
    }
    console.log("");
  }

  Service.register("log", () => {
    Bus.subscribe("message-incoming", ({ detail }) => {
      logEvent("📥 Message Incoming", {
        Run: detail.id,
        Message: truncate(detail.message, 200),
      });
    });

    Bus.subscribe("todo-publish", ({ detail }) => {
      logEvent("✅ Todos Published", {
        Run: detail.id,
        Prompt: truncate(detail.prompt, 80),
        Todos: detail.todos.length,
      });

      detail.todos.forEach((todo, i) => {
        console.log(
          `  ${(i + 1).toString().padStart(2)}. ${todo.action} [${todo.status}]`,
        );
      });

      console.log("");
    });

    Bus.subscribe("service-init", ({ detail }) => {
      logEvent(`${detail.name} service initialized`, {});
    });

    Bus.subscribe("agent-event", ({ detail }) => {
      logEvent(`${detail.agent} event:`, {
        eventType: detail.type,
        description: detail.desc || "",
      });
    });
  });
}

export { Log };
