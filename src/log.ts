import { Bus } from "./bus";
import { Service } from "./services";

namespace Log {
  function logBlock(title: string, lines: Record<string, string | number>) {
    console.log(`\n${title}`);
    for (const [label, value] of Object.entries(lines)) {
      console.log(`  ${label.padEnd(12)} ${value}`);
    }
    console.log("");
  }

  export function create(service: string) {
    function info(title: string, data: Record<string, string | number> = {}) {
      logBlock(`ℹ️  [${service}] ${title}`, data);
    }

    function warn(title: string, data: Record<string, string | number> = {}) {
      logBlock(`⚠️  [${service}] ${title}`, data);
    }

    function error(title: string, data: Record<string, string | number> = {}) {
      logBlock(`❌ [${service}] ${title}`, data);
    }

    return { info, warn, error };
  }

  Service.register("log", () => {});
}

export { Log };
