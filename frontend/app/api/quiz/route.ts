import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionContentPart } from "openai/resources";
import { z } from "zod";

export async function POST(req: Request) {
  const body = await req.json();
  const imageUrls = body.fileUrls as string[];
  const quizLevel = body.quizLevel as QuizLevel;
  const response = await createQuiz(imageUrls, quizLevel);
  console.log("response:", response);
  return NextResponse.json(response);
}

export async function GET(req: Request) {
  return NextResponse.json({ message: "Hello from Next.js!" });
}

// set output as json objects
const QuizItem = z.object({
  question: z.string(),
  answer: z.string(),
});
const QuizContainer = z.object({
  items: z.array(QuizItem),
});

const levelDict = {
  easy: "easy (participants include children and adults)",
  medium: "medium (participants include young adults and adults)",
  hard: "hard (participants are intelligent people)",
};
type QuizLevel = keyof typeof levelDict;

async function createQuiz(imageUrls: string[], quizLevel: QuizLevel) {
  const numberOfImages = imageUrls.length;
  const levelDescription = levelDict[quizLevel];

  const prompt =
    `
    You are a host for the quiz game! Based on the images you see, create questions and answers for guests. Images are provided by your guests so make sure to make interesting quizzes for everyone! The question should be related to the image and the answer should be a fun fact, trivia or something interesting to learn. Do not make a question to answer the object name in the image or yes/no kind of question and answer but use some additional or related information. Answer can be some numbers (such as cost/amount/population/years/date). The question should be a complete sentence and the answer should be a word or short sentence. Quiz level is ` +
    levelDescription +
    `. Each question and answer pair should be a json object as follows {'Question': 'How long does squirrel hibernate?', 'Answer': 'They do not hibernate.'}'. Reply with array of JSON objects. One JSON object should contains question and answer pair for each image. Total quizzes should be ` +
    numberOfImages +
    ` pairs and here is(are) the image(s):
    `;

  console.log("prompt:", prompt);
  console.log("image urls:", imageUrls);
  console.log("level:", quizLevel);
  console.log("level explain:", levelDescription);

  // wrap image urls in image_url objects
  const imageObjects = imageUrls.map<ChatCompletionContentPart>((url) => ({
    type: "image_url",
    image_url: { url },
  }));
  const contentArray: ChatCompletionContentPart[] = [
    { type: "text", text: prompt },
    ...imageObjects,
  ];

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing required environment variables");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log("openai generated");
  const response = await openai.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: contentArray,
      },
    ],
    response_format: zodResponseFormat(QuizContainer, "quiz"),
    max_tokens: 300,
  });

  const quiz: z.infer<typeof QuizContainer> | null =
    response.choices[0]?.message?.parsed || null;
  if (!quiz) {
    throw new Error("Failed to parse quiz response");
  }

  // console.log("quiz:", quiz);
  // const unprocessedJsonObject = quiz.response.text();
  // console.log("type of unprocessedJsonObject", typeof quiz); // object type

  // add image urls to the quiz
  type QuizItem = {
    question: string;
    answer: string;
    url: string;
  };

  let quizList: QuizItem[] = [];

  if (!quiz || !quiz.items || quiz.items.length !== imageUrls.length) {
    throw new Error("Quiz items and image urls are not the same length");
  }
  for (let i = 0; i < quiz.items.length; i++) {
    const quizItem: QuizItem = {
      question: quiz.items[i].question,
      answer: quiz.items[i].answer,
      url: imageUrls[i],
    };
    quizList.push(quizItem);
  }

  // console.log(quizList);
  return quizList;
}

// // testing
// const quizLevel = "medium";
// console.log(quizLevel);

// const exampleImage1 =
//   "https://static.independent.co.uk/s3fs-public/thumbnails/image/2010/07/06/00/407862.jpg?quality=75&width=1200&auto=webp";
// const exampleImage2 =
//   "https://i2.wp.com/calvinthecanine.com/wp-content/uploads/2019/11/A35A7884v4.jpg?resize=697%2C465";
// const imageUrls = [exampleImage1, exampleImage2];

// console.log("create quiz with urls");
// const generatedQuizzes = createQuiz(imageUrls, quizLevel);

// if (!generatedQuizzes) {
//   console.log("Failed to generate summary");
// } else {
//   console.log("Quiz generated successfully");
//   console.log(generatedQuizzes);
// }
