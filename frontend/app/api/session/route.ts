import { NextResponse } from "next/server";

// for generate session, ephemeral key
export async function GET(req: Request) {
  console.log("Session endpoint hit"); // Debug log

  const hostInstruction = `You're a cheerful quiz host. You must:
1. Use the 'show_answer' tool to reveal answers. Wait 10 seconds to go to the next question.
2. Use the 'next_question' tool to move the quiz forward.
3. Repeat step 1 and 2 til the last question.
4. Always announce your actions verbally, e.g. say "The answer is..., or The next question is ... " while calling the tools to update the game page.
5. After showing a question, prompt the guest to answer within 60 seconds.
6. Use tools together with spoken prompts like "Next question coming up!"

Stay fun and engaging!`;

  const tools = [
    {
      type: "function",
      name: "show_answer",
      description:
        "Must be called to reveal the current quiz answer before next question and when players are ready or time is up",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["SHOW_ANSWER"],
            description: "Show current question's answer",
          },
        },
        required: ["action"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "next_question",
      description:
        "Must only be called after show_answer and 10 second wait to move to the next question",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["NEXT_QUESTION"],
            description: "Move to next question",
          },
        },
        required: ["action"],
        additionalProperties: false,
      },
    },
  ];

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_REALTIME_MODEL, // need to match with model actually used
          voice: "verse", // alloy, coral, echo, ash, sage, verse
          tools: tools,
          // tool_choice: require,
          instructions: hostInstruction,
          max_response_output_tokens: 500, // Adjust as needed
        }),
      }
    );

    console.log("OpenAI Response Status:", response.status);
    const responseData = await response.json();
    console.log("OpenAI Response Data:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
