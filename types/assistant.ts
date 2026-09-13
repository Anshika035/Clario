export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type AssistantConversation = {
  threadId: string | null;
  messages: AssistantMessage[];
};
