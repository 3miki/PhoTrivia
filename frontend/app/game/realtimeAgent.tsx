// use webRTC
export default async function initializeRealtimeConnection() {
  // Get an ephemeral key from your server - see server code below
  const tokenResponse = await fetch("/session");
  const data = await tokenResponse.json();
  const EPHEMERAL_KEY = data.client_secret.value;

  // Create a peer connection
  const pc = new RTCPeerConnection();

  // Set up to play remote audio from the model
  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

  // Add local audio track for microphone input in the browser
  const ms = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  pc.addTrack(ms.getTracks()[0]);

  // Set up data channel for sending and receiving events
  const dc = pc.createDataChannel("oai-events");
  dc.addEventListener("message", (e) => {
    // Realtime server events appear here!
    console.log(e);
  });

  // Start the session using the Session Description Protocol (SDP)
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const baseUrl = "https://api.openai.com/v1/realtime";
  const model = "gpt-4o-mini-realtime-preview-2024-12-17";
  const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
    method: "POST",
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${EPHEMERAL_KEY}`,
      "Content-Type": "application/sdp",
    },
  });

  const answer = {
    type: "answer",
    sdp: await sdpResponse.text(),
  };
  await pc.setRemoteDescription(answer);
}



// 1. set up the game host, initialize OpenAI realtime agent and function calling tools
initializeRealtimeConnection();

// 2. define the game host function calling tools and instructions
type gameTools = {
  tool: "SHOW_ANSWER" | "NEXT_QUESTION";
  payload?: any;
};

const gameTools = [
  {
    type: "function",
    name: "show_next_quiz",
    description: "Display a next quiz.",
    parameters: {
      type: "object",
      properties: {
        showNextQuiz: {
          type: "boolean",
          description: "Set to true to show the next quiz.",
        },
      },
      required: ["showNextQuiz"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "show_answer",
    description: "Display the answer to the current quiz.",
    parameters: {
      type: "object",
      properties: {
        showAnswer: {
          type: "boolean",
          description: "Set to true to show the quiz answer.",
        },
      },
      required: ["showAnswer"],
      additionalProperties: false,
    },
  },
];

const hostInstruction = `You are the cheerful and engaging host of a quiz game, responsible for entertaining guests in a lively, interactive, and friendly manner. Your role includes:
	1.	Hosting Quizzes: Use the provided tool to fetch and display quiz data. Each quiz includes a question, an image, and an answer. Update the screen with the relevant image and question for each quiz, keeping the experience seamless and dynamic.
	2.	Interactivity: Actively encourage guests to respond within 60 seconds. Use the tool to reveal the correct answer immediately if someone answers correctly, or after the time limit expires if no one provides the right answer.
	3.	Storytelling: Engage guests by asking them about the story behind their photos or other context to make the interaction more personal and enjoyable.
	4.	Content Safety: Use your discretion to ensure all content is appropriate, safe, and respectful. If you determine that a quiz item is inappropriate or unsuitable, gracefully skip it and notify the guests why it was omitted.
Stay cheerful, enthusiastic, and adaptive throughout the game to keep the experience fun and enjoyable for all participants!`;

// quizzes are fetched from supabase
// and should be in the format:
const quizzes = `
Quiz 1. Question: What is the lifespan of swans? Answer: Up to 50 years.
Quiz 2. Question: What is the lifespan of dogs? Answer: Up to 15 years.`;

// 3. send the event to the host agent
const event = {
  type: "session.update",
  response: {
    // An empty input array removes existing context
    input: [],
    instructions: hostInstruction + "\n\n" + quizzes,
    tool: gameTools,
  },
};

// WebRTC data channel and WebSocket both have .send()
const dataChannel = new RTCDataChannel(); // Initialize the data channel
dataChannel.send(JSON.stringify(event));
