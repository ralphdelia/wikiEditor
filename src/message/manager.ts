import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

type Exchange = {
  userMessage: ChatCompletionMessageParam;
  llmResponse: ChatCompletionMessageParam | null;
};

export default class MessageManager {
  private exchanges: Exchange[] = [];
  private conversation: ChatCompletionMessageParam[] = [];

  addMessages(messages: ChatCompletionMessageParam[]) {
    let start = 0;
    if (messages[0]?.role === "system") {
      this.conversation.push(messages[0]);
      start = 1;
    }
    for (let i = start; i < messages.length; i += 2) {
      const userMessage = messages[i];
      const llmResponse = messages[i + 1] || null;
      this.exchanges.push({ userMessage, llmResponse });
    }
  }

  hasUnprocessedMessages(): boolean {
    return this.exchanges.length > 0;
  }

  getNextConversationStep(): ChatCompletionMessageParam[] {
    const exchange = this.exchanges.shift();
    if (exchange) {
      this.conversation.push(exchange.userMessage);
      if (exchange.llmResponse) {
        this.conversation.push(exchange.llmResponse);
      }
    }
    return this.conversation;
  }
}
