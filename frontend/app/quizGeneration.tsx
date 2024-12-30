import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";

// model output is string type, need to convert to list of json objects
type QuizItem = Record<string, string>;

function cleanOutputToJson(
  responseText: string,
  imageUrls: string[]
): QuizItem[] {
  // Remove "```json" and "```" from the output, use []
  const startIndex = responseText.indexOf("[");
  const endIndex = responseText.lastIndexOf("]") + 1;

  //   console.log("Start index:", startIndex);
  //   console.log("End index:", endIndex);

  if (startIndex !== -1 && endIndex !== -1) {
    responseText = responseText.substring(startIndex, endIndex);
  }
  console.log("Cleaned response text:", responseText);

  let quizList: QuizItem[];
  try {
    quizList = JSON.parse(responseText); // Parse the JSON string to an object
    console.log("Type:", typeof quizList);
    console.log(quizList);
  } catch (error) {
    console.error("Failed to decode JSON:", error);
    quizList = [];
  }

  // check if quiz list and image urls are the same length
  if (quizList.length !== imageUrls.length) {
    throw new Error("Quiz list and image urls are not the same length");
  }

  const quizDict: QuizItem = {};

  quizList.forEach((item, index) => {
    const questionKey = `Question ${index + 1}`;
    const answerKey = `Answer ${index + 1}`;
    quizDict[questionKey] = item[questionKey];
    quizDict[answerKey] = item[answerKey];
  });

  imageUrls.forEach((imageUrl, index) => {
    const urlKey = `Url ${index + 1}`;
    quizDict[urlKey] = imageUrl;
    console.log(quizDict[urlKey]);
  });

  console.log(quizDict);

  return [quizDict];
}

export default async function createQuiz(
  imageUrls: string[],
  files: File[],
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
    You are a host for the quiz game! Based on the images you see, create questions and answers for guests. Images are provided by your guests so make sure to make interesting quizes for everyone! The question should be related to the image and the answer should be a fun fact, trivia or something interesting to learn. Do not make a question to answer the object in the image but use some contexual information. The question should be a complete sentence and the answer should be a word or short sentence. Each question and answer pair should be a json object as follows {'Question 1': 'How long does squirrel hibernate?', 'Answer 1': 'They do not hibernate.}'. Reply with array of JSON objects. Make one pair of question and answer pair for each image. Total quizzes should be ` +
    numberOfImages +
    ` pairs and here is(are) the image(s):
    `;

  console.log("prompt:", prompt);
  console.log("image urls:", imageUrls);
  console.log("level:", quizLevel);
  console.log("level explain:", levelDict[quizLevel]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
    throw new Error("Missing required environment variables");
  }

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
  console.log("genAI generated");
  //   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const generationConfig = {
    temperature: 1.5, // range from 0.0 to 2.0(creative)
    max_output_tokens: 300, // max 128,000 tokens
    responseMimeType: "application/json",
  };
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: generationConfig,
  });
  console.log("model generated");

  const imageObjects = imageUrls.map((url, i) => {
    return {
      fileData: {
        fileUri: url,
        mimeType: files[i].type,
      },
    };
  });
  console.log({ imageObjects });

  //   const output = await model.generateContent([prompt].concat(imageObjects));
  const output = await model.generateContent([prompt, ...imageObjects]);

  console.log(output.response.text());

  const unprocessedJsonObject = output.response.text();
  console.log("type of unprocessedJsonObject", typeof unprocessedJsonObject);
  const quizDict = cleanOutputToJson(unprocessedJsonObject, imageUrls);
  console.log("processed to json", quizDict);
  return quizDict;

  //   return output.response.text();
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
// const exampleLevel = "medium";
// const genetagedQuizzes = createQuiz(imageUrls, files, exampleLevel);

// if (!genetagedQuizzes) {
//   console.log("Failed to generate summary");
// } else {
//   console.log("Quiz generated successfully");
//   console.log(genetagedQuizzes);
// }
