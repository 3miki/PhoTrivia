import { NextResponse } from "next/server";

// for generate session, ephemeral key
export async function GET(req: Request) {
  console.log("Session endpoint hit"); // Debug log

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
          model: "gpt-4o-mini-realtime-preview-2024-12-17", // need to match with model actually used
          voice: "verse",
        }),
      }
    );

    // Add debug logs
    console.log("OpenAI Response Status:", response.status);
    const responseData = await response.json();
    console.log("OpenAI Response Data:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
