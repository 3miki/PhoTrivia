import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionContentPart } from "openai/resources";
import { z } from "zod";

// set output as json objects
const QuizItem = z.object({
  quizQuestion: z.string(),
  quizAnswer: z.string(),
  url: z.string(),
});
const QuizContainer = z.object({
  items: z.array(QuizItem),
});

export default async function createQuiz(
  imageUrls: string[],
  quizLevel: keyof typeof levelDict
) {
  const levelDict = {
    easy: "easy(participants include children and adults)",
    medium: "medium(participants include young adults and adults)",
    hard: "hard(participants are inteligent people)",
  };
  const numberOfImages = imageUrls.length;

  const prompt =
    `
    You are a host for the quiz game! Based on the images you see, create questions and answers for guests. Images are provided by your guests so make sure to make interesting quizes for everyone! The question should be related to the image and the answer should be a fun fact, trivia or something interesting to learn. Do not make a question to answer the object in the image but use some contexual information. The question should be a complete sentence and the answer should be a word or short sentence. Quiz level is ` +
    quizLevel +
    `. Each question and answer pair should be a json object as follows {'Question 1': 'How long does squirrel hibernate?', 'Answer 1': 'They do not hibernate.}'. Reply with array of JSON objects. Make one pair of question and answer pair for each image. Total quizzes should be ` +
    numberOfImages +
    ` pairs and here is(are) the image(s):
    `;

  console.log("prompt:", prompt);
  console.log("image urls:", imageUrls);
  console.log("level:", quizLevel);
  console.log("level explain:", levelDict[quizLevel]);

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
  const response = await openai.beta.chat.completions.parse({
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

  const quiz = response.choices[0].message.parsed;

  console.log("quiz:", quiz);

  return quiz;
}

// testing
// const quizLevel = "medium";
// console.log(quizLevel);

// const exampleImage1 =
//   "https://static.independent.co.uk/s3fs-public/thumbnails/image/2010/07/06/00/407862.jpg?quality=75&width=1200&auto=webp";
// const exampleImage2 =
//   "https://i2.wp.com/calvinthecanine.com/wp-content/uploads/2019/11/A35A7884v4.jpg?resize=697%2C465";
// const imageUrls = [exampleImage1, exampleImage2];

// console.log("create quiz with urls");
// const genetagedQuizzes = createQuiz(imageUrls, quizLevel);

// if (!genetagedQuizzes) {
//   console.log("Failed to generate summary");
// } else {
//   console.log("Quiz generated successfully");
//   console.log(genetagedQuizzes);
// }
