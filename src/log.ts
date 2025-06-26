export namespace Log {
  function logBlock(title: string, lines: Record<string, string | number>) {
    console.log(`${title}`);
    for (const [label, value] of Object.entries(lines)) {
      console.log(`  ${label.padEnd(12)} ${value}`);
    }
  }

  export function create(service: string) {
    function info(title: string, data: Record<string, string | number> = {}) {
      logBlock(`[${service}] ${title}`, data);
    }

    function warn(title: string, data: Record<string, string | number> = {}) {
      logBlock(`[${service}] ${title}`, data);
    }

    function error(title: string, data: Record<string, string | number> = {}) {
      logBlock(`[${service}] ${title}`, data);
    }

    return { info, warn, error };
  }
}
