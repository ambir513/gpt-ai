import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const message = req.nextUrl.searchParams.get("message");
  if (!message) {
    return NextResponse.json({ message: "Prompt is empty" }, { status: 404 });
  }

  const prompt = `You are a helpful, friendly assistant that responds like ChatGPT with a modern tone.
Use **Markdown formatting** (headings, lists, code blocks, bold, italics) and add appropriate emojis 😄✨ to make the response lively.
Be concise and easy to read.

User: ${message}`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma:2b",
      prompt,
      stream: true,
    }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  return new NextResponse(
    new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          // split by newlines in case Ollama sends multiple JSON objects
          const lines = chunk.split("\n").filter(Boolean);
          for (const line of lines) {
            // Wrap each line as SSE
            controller.enqueue(`data: ${line}\n\n`);
          }
        }
        // Send a final [DONE] message
        controller.enqueue(`data: [DONE]\n\n`);
        controller.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
}
