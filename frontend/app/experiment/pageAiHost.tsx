"use client";
import Image from "next/image";
import Link from "next/link";
import supabase from "../supabaseClient";
import signInWithEmail from "../upload/signin";
import { useEffect, useState } from "react";
import initializeRealtimeConnection from "../game/realtimeAgent";

type Question = {
  id: number;
  question: string;
  answer: string;
  url: string;
};

// set conversational AI signed URL
initializeRealtimeConnection();
// const fetchSignedUrl = async () => {
//   const url = await getConversationalAiSignedUrl();
//   console.log("signed url", url);
// };

const onClick = async () => {
  console.log("clicked");
  console.log("call backend: ");
  await signInWithEmail();
  console.log("signed in");
};

// quiz page component
export const QuizQuestion = ({ question }: { question: Question }) => {
  console.log("question", question);

  // for testing fetching quiz and image from DB
  return (
    <div className="flex justify-center relative p-4 m-4 rounded-2xl">
      {
        <div className="z-10">
          <Image
            className="absolute top-0 left-0"
            src={question.url}
            alt={`Image for quiz ${question.id}`}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
          />
          <div className="flex relative text-orange-700 bg-slate-200/80 p-4 m-4 rounded-2xl">
            <h3 className="text-lg font-bold text-center">
              Question: {question.question}
            </h3>
          </div>
          <p>image url: {question.url}</p>
        </div>
      }
      <div>
        <button onClick={() => QuizAnswer}>Answer</button>
      </div>
    </div>
  );
};

// quiz answer component
export const QuizAnswer = ({ question }: { question: Question }) => {
  console.log("question", question);
  return (
    <div className="flex justify-center relative p-4 m-4 rounded-2xl">
      {
        <div className="z-10">
          <Image
            className="absolute top-0 left-0"
            src={question.url}
            alt={`Image for quiz ${question.id}`}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
          />
          <div className="flex relative text-orange-700 bg-slate-200/80 p-4 m-4 rounded-2xl">
            <h3 className="text-lg font-bold text-center">
              Answer: {question.answer}
            </h3>
          </div>
          <p>image url: {question.url}</p>
        </div>
      }
      <div>
        <button onClick={() => QuizQuestion}>Next Quiz</button>
      </div>
    </div>
  );
};

export default function Home() {
  // check if quizCode=${} is in the url, if it is, render the quiz page component. Otherwise render the home page component

  // test supabase connection
  // console.log("superbase", supabase);

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Question | null>(null);
  // const [quizId, setQuizId] = useState<number | null>(1);

  useEffect(() => {
    // create async function
    const fetchQuiz = async () => {
      const { data: fetchedData, error: fetchedError } = await supabase
        .from("quiz")
        .select()
        .eq("id", 2);
      console.log("text", fetchedData);
      // .select () to get all the data from the table
      console.log(fetchedError);
      if (fetchedError) {
        setFetchError("Could not fetch quizzes");
        setQuiz(null);
        // console.error(fetchedError)
      }
      if (fetchedData) {
        console.log("setting quizzes");
        setQuiz(fetchedData.length > 0 ? fetchedData[0] : null);
        setFetchError(null);
      }
    };

    // fetchQuiz();
    fetchQuiz().then(async () => {
      const url = await getConversationalAiSignedUrl();
      console.log("signed url", url);
    });
  }, []);

  console.log("render", quiz);

  return (
    <div>
      <main className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
        <h1 className="text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mt-4">
          PhoTrivia
        </h1>
        {fetchError && <p>{fetchError}</p>}
        {quiz && (
          <div className="quiz">
            <QuizQuestion question={quiz} />
          </div>
        )}
      </main>
      <footer className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
        <h2 className="text-xl text-center">
          Click the button below to start the quiz when everyone is ready!
        </h2>
        <button
          // onClick={() => {
          //   console.log("clicked");
          // }}
          onClick={onClick}
          // test get public URL
          // onClick={() => createPublicUrl(filePath)}
          type="submit"
          className="w-36 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 border-2  border-orange-500 focus:outline-none"
        >
          Answer
        </button>
      </footer>
    </div>
  );
}
