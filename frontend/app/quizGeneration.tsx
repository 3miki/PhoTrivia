import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// testing
const quizLevel = "medium";
console.log(quizLevel);

const exampleImage1 =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg/2560px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg";
const exampleImage2 =
  "https://static.independent.co.uk/s3fs-public/thumbnails/image/2010/07/06/00/407862.jpg?quality=75&width=1200&auto=webp";
const exampleImage3 =
  "https://i2.wp.com/calvinthecanine.com/wp-content/uploads/2019/11/A35A7884v4.jpg?resize=697%2C465";
const imageUrls = [exampleImage1, exampleImage2, exampleImage3];

// model output is string type, need to convert to list of dict(json)
// function creanOutputToJson(response_text: string, imageUrls: list[string]) -> list[dict[string, string]]:
//     // // remove "```json" and "```" from output, use []
//     start_index = response_text.find('[')
//     end_index = response_text.rfind(']') + 1
//     if start_index != -1 and end_index != -1:
//         response_text = response_text[start_index:end_index]
//     console.log("Cleaned response text:", response_text)

//     try:
//         quiz_list = json.loads(response_text)
//         console.log(['Type:', type(quiz_list)])
//         console.log(quiz_list)
//     except json.JSONDecodeError as e:
//         console.log(f"Failed to decode JSON: {e}")
//         quiz_list = []

//     quizDict = {}

//     for i, item in enumerate(quiz_list):
//         question_key = f"Question {i+1}"
//         answer_key = f"Answer {i+1}"
//         quizDict[question_key] = item[question_key]
//         quizDict[answer_key] = item[answer_key]

//     for i, image_url in enumerate(imageUrls):
//         index = f"Url {i+1}"
//         quizDict[index] = image_url
//         console.log(quizDict[index])

//     console.log(quizDict)

//     return quizDict

export default async function createQuiz(
  imageUrls: string[],
  quizLevel: keyof typeof levelDict
) {
  const levelDict = {
    easy: "easy(participants include children and adults)",
    medium: "medium(participants include young adults and adults)",
    hard: "hard(participants are inteligent people)",
  };

  const prompt =
    `
    You are a host for the quiz game! Based on the images you see, create questions and answers for guests. Images are provided by your guests so make sure to make interesting quizes for everyone! The question should be related to the image and the answer should be a fun fact, trivia or something interesting to learn. Do not make a question to answer the object in the image but use some contexual information. The question should be a complete sentence and the answer should be a word or short sentence. Each question and answer pair should be a json object as follows {'Question 1': 'How long does squirrel hibernate?', 'Answer 1': 'They do not hibernate.}'. Reply with array of JSON objects. Here are the images:
    ` +
    "\n" +
    imageUrls.join("\n") +
    "\n";

  console.log("prompt:", prompt);
  console.log("image urls:", imageUrls);
  console.log("level:", quizLevel);
  console.log("level explain:", levelDict[quizLevel]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
    throw new Error("Missing required environment variables");
  }

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
  console.log("genAI generated");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  //   const generationConfig = {
  //     temperature: 1.5, // range from 0.0 to 2.0(creative)
  //     max_output_tokens: 300, // max 128,000 tokens
  //     responseMimeType: "application/json",
  //   };
  //     const model = genAI.getGenerativeModel({
  //   model: "gemini-1.5-flash",
  //   generationConfig: generationConfig,
  //     });
  console.log("model generated");
  const output = await model.generateContent([
    `${prompt}\n${imageUrls.join("\n")}\n${levelDict[quizLevel]}`,
  ]);
  console.log(output.response.text());
  // const quizDict = creanOutputToJson(response.text, imageUrls)
  // return (quizDict)

  return output.response.text();
}

// console.log("create quiz with urls");
// const genetagedQuizzes = createQuiz(imageUrls, quizLevel);

// if (!genetagedQuizzes) {
//   console.log("Failed to generate summary");
// } else {
//   console.log("Quiz generated successfully");
//   console.log(genetagedQuizzes);
// }
