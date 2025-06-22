import OpenAI from "openai";
import readline from "readline";
import type { ChatCompletionMessageParam } from "openai/resources";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in the environment
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const conversation: ChatCompletionMessageParam[] = [
  { role: "system", content: "You are a helpful assistant." },
];

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function chatLoop() {
  console.log("Welcome to the chat! Type 'exit' to quit.");
  while (true) {
    const userInput = await askQuestion("You: ");
    if (userInput.toLowerCase() === "exit") break;

    conversation.push({ role: "user", content: userInput });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
    });

    const assistantMessage = response.choices[0].message.content;
    console.log(`Assistant: ${assistantMessage}`);

    conversation.push({ role: "assistant", content: assistantMessage });
  }
  rl.close();
}

chatLoop().catch(console.error);
