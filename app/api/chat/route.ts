import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { aiAnalysisSchema } from "./schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { document } = await req.json();
    console.log("Document received:", document);

    const result = streamObject({
      model: google("gemini-2.0-flash"),
      schema: aiAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate AI analysis for whether the pharmaceutical document is compliant with ICH guidelines. Be specific and detailed.`,
            },
            {
              type: "file",
              data: document.url,
              mimeType: "application/pdf",
            },
          ],
        },
      ],
    });

    console.log("StreamObject result created");
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
