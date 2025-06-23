import { WikiEditor } from "../agents/wikiEditor";
import MessageManager from "./manager";

export default class MessageProcessor {
  constructor(private manager: MessageManager) {}

  async processNextExchange() {
    if (this.manager.hasUnprocessedMessages()) {
      const conversation = this.manager.getNextConversationStep();
      console.log("Processing conversation:", conversation);

      await WikiEditor.exe(JSON.stringify(conversation, null, 2));
    }
  }

  async run() {
    while (true) {
      await this.processNextExchange();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
