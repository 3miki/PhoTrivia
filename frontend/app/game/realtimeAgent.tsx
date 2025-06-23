// use webRTC

type Quiz = {
  id: number;
  question: string;
  answer: string;
  url: string;
};

type GameTools = {
  showAnswer: () => void;
  nextQuestion: () => void;
};

// Track conversation state
let conversationStarted = false;

// Get an ephemeral key from server
async function getSessionToken() {
  try {
    const response = await fetch("/api/session", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Session token fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data.client_secret.value;
  } catch (error) {
    console.error("Failed to get session token:", error);
    throw error;
  }
}

export default async function initializeRealtimeConnection(
  quizzes: Quiz[],
  gameTools: GameTools
) {
  // Create a peer connection for WebRTC
  try {
    const pc = new RTCPeerConnection();

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up to play remote audio from the model
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    pc.ontrack = (e) => {
      audioEl.srcObject = e.streams[0];
      document.body.appendChild(audioEl);
    };

    // Set up data channel for sending and receiving events
    // WebRTC data channel and WebSocket both have .send()
    // const dataChannel = new RTCDataChannel(); // Initialize the data channel
    // dataChannel.send(JSON.stringify(event));
    const dc = pc.createDataChannel("quiz-host");

    // Send initial context when connection opens
    // dc.onopen = async () => {

    // // Add message handler
    dc.onmessage = (e) => {
      try {
        const message = JSON.parse(e.data);
        // console.log("AI message:", message);

        // Handle session creation once
        if (message.type === "session.created" && !conversationStarted) {
          conversationStarted = true;
          dc.send(
            JSON.stringify({
              type: "conversation.item.create",
              event_id: `event_${Date.now()}`,
              previous_item_id: null,
              item: {
                id: `msg_${Date.now()}`,
                type: "message",
                role: "assistant",
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      total_quizzes: quizzes.length,
                      quiz_data: quizzes.map((quiz, index) => ({
                        index: index + 1,
                        question: quiz.question,
                        answer: quiz.answer,
                      })),
                    }),
                  },
                ],
              },
            })
          );
          // Send response request to trigger voice
          dc.send(
            JSON.stringify({
              type: "conversation.item.create",
              event_id: `event_${Date.now()}`,
              item: {
                id: `msg_${Date.now()}`,
                type: "message",
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: "Let's begin the quiz!",
                  },
                ],
              },
            })
          );
          // dc.send(
          //   JSON.stringify({
          //     type: "response.create",
          //     response_id: `resp_${Date.now()}`,
          //     content: "Let's begin the quiz!",
          //   })
          // );
        }

        // Handle function calls
        if (message.type === "response.function_call_arguments.done") {
          console.log("Message arguments:", message.arguments);

          try {
            const args = JSON.parse(message.arguments);
            const name = message.name;

            console.log("Executing function:", name, "with args:", args);

            if (name === "show_answer" && args.action === "SHOW_ANSWER") {
              console.log("Executing show_answer");
              gameTools.showAnswer();
              dc.send(
                JSON.stringify({
                  type: "conversation.item.create",
                  event_id: `event_${Date.now()}`,
                  previous_item_id: message.item_id,
                  item: {
                    id: `msg_${Date.now()}`,
                    type: "message",
                    role: "assistant",
                    content: [
                      {
                        type: "text",
                        text: "Here's the answer! Take a moment to look at it.",
                      },
                    ],
                  },
                })
              );
            } else if (
              name === "next_question" &&
              args.action === "NEXT_QUESTION"
            ) {
              console.log("Executing next_question");
              gameTools.nextQuestion();
              dc.send(
                JSON.stringify({
                  type: "conversation.item.create",
                  event_id: `event_${Date.now()}`,
                  previous_item_id: message.item_id,
                  item: {
                    id: `msg_${Date.now()}`,
                    type: "message",
                    role: "assistant",
                    content: [
                      {
                        type: "text",
                        text: "Moving to next question!",
                      },
                    ],
                  },
                })
              );
            }
          } catch (error) {
            console.error("Failed to parse function arguments:", error);
            console.error("Raw arguments:", message.arguments);
          }
        }

        // Ignore response.text.delta messages
        if (
          message.type.startsWith("response.text.delta") ||
          message.type.startsWith("response.audio_transcript.delta")
        ) {
          return;
        } else {
          console.log("AI message:", message);
        }
      } catch (error) {
        console.error("Message handling error:", error);
      }
    };

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const token = await getSessionToken();
    console.log("Session token retrieved successfully:", token);
    console.log("Creating SDP offer:", offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL;
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/sdp",
      },
    });

    if (!sdpResponse.ok) {
      throw new Error(`SDP response failed: ${sdpResponse.status}`);
    }

    const answerSdp = await sdpResponse.text();
    await pc.setRemoteDescription({
      type: "answer",
      sdp: answerSdp,
    });

    return dc;
  } catch (error) {
    console.error("Realtime connection failed:", error);
    throw error;
  }
}


// 1. set up the game host, initialize OpenAI realtime agent and function calling tools
// 2. define the game host function calling tools and instructions
// 3. send the event to the host agent
// const event = {
//   type: "session.update",
//   response: {
//     // An empty input array removes existing context
//     input: [],
//     instructions: hostInstruction + "\n\n" + quizzes,
//     tool: gameTools,
//   },
// };


