"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  PromptInput,
  PromptInputBody,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import { GlobeIcon } from "lucide-react";

interface StreamMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  image?: string;
}

const models = [{ name: "Gemma 2B", value: "gemma:2b" }];

const ChatBotDemo = () => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [model, setModel] = useState(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [status, setStatus] = useState<"idle" | "streaming" | "done">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: StreamMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Placeholder for streaming assistant response
    const assistantId = Date.now().toString() + "-assistant";
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", text: "" },
    ]);
    setStatus("streaming");

    const eventSource = new EventSource(
      `/api/generate?message=${encodeURIComponent(
        text
      )}&model=${model}&webSearch=${webSearch}`
    );

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        setStatus("done");
        eventSource.close();
        return;
      }

      try {
        const chunk = JSON.parse(event.data);

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== assistantId) return msg;

            // Append text if exists
            const updatedText = chunk.response
              ? (msg.text || "") + chunk.response
              : msg.text;

            // Add image if exists
            const updatedImage = chunk.image ? chunk.image : msg.image;

            return { ...msg, text: updatedText, image: updatedImage };
          })
        );
      } catch (err) {
        console.error("Failed to parse SSE chunk:", err);
      }
    };

    eventSource.onerror = () => eventSource.close();
  };

  return (
    <div className="max-w-4xl mx-auto h-screen p-6 flex flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-xl bg-neutral-950 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
      >
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <Fragment key={message.id}>
                <Message from={message.role}>
                  <MessageContent>
                    {message.text && <Response>{message.text}</Response>}
                    {message.image && (
                      <img
                        src={message.image}
                        alt="AI response"
                        className="mt-2 rounded-lg border dark:border-gray-700 max-w-full"
                      />
                    )}
                  </MessageContent>
                </Message>
              </Fragment>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <PromptInput
        onSubmit={() => handleSendMessage(input)}
        className="mt-4"
        globalDrop
        multiple
      >
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
        </PromptInputBody>

        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputModelSelect
              value={model}
              onValueChange={(value) => setModel(value)}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map((m) => (
                  <PromptInputModelSelectItem key={m.value} value={m.value}>
                    {m.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>

          <PromptInputSubmit
            disabled={!input.trim() || status === "streaming"}
            //@ts-ignore
            status={
              status === "streaming"
                ? "streaming"
                : status === "done"
                ? "success"
                : "idle"
            }
          />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
};

export default ChatBotDemo;
