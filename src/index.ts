import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const buffer: string[] = [];

rl.setPrompt("> ");
rl.prompt();
rl.on("line", async (input) => {
  if (input === "") {
    if (buffer.length === 0) {
      rl.prompt();
      return;
    }
    const message = buffer.join("\n");
    buffer.length = 0;
    rl.setPrompt("> ");
    rl.prompt();
    try {
      const res = await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [message] }),
      });
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
    return;
  }
  buffer.push(input);
  rl.setPrompt("... ");
  rl.prompt();
});
