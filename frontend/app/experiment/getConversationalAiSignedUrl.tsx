"use server";

import { useConversation } from "@11labs/react";
import supabase from "../supabaseClient";
console.log("supabase", supabase);

export const getConversationalAiSignedUrl = async () => {
  if (!process.env.ELEVENLABS_AGENT_ID || !process.env.ELEVENLABS_API_KEY) {
    throw new Error("Missing required environment variables");
  }
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${process.env.ELEVENLABS_AGENT_ID}`,
    {
      method: "GET",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get signed URL");
  }

  const data = await response.json();
  return data.signed_url;
};


// Note: steps
// 1. set up conversational AI
// const url = await getConversationalAiSignedUrl();

// 2. set tools

// 3. call the conversational AI
// const conversation = await Conversation.startSession({
//   clientTools: gameHostTools,
// });
// conversation.start();