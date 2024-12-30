"use client";
import Image from "next/image";
import Link from "next/link";
import supabase from "./supabaseClient";
import { useEffect, useState } from "react";
import { getConversationalAiSignedUrl } from "./getConversationalAiSignedUrl";

type Question = {
  id: number;
  question: string;
  answer: string;
  url: string;
};

const fetchSignedUrl = async () => {
  const url = await getConversationalAiSignedUrl();
  console.log("signed url", url);
};

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
          <div className="flex relative text-green-700 bg-slate-200/80 p-4 m-4 rounded-2xl">
            <h3 className="text-lg font-bold text-center">
              Quiz {question.id}: {question.question}
            </h3>
          </div>

          <p>image url: {question.url}</p>
        </div>
      }
    </div>
  );
};
//   );
// };

export const QuizAnswer = ({ question }: { question: Question }) => {
  console.log("question", question);
  return (
    <div>
      <h3>
        Quiz {question.id}: {question.answer}
      </h3>
    </div>
  );
};

export default function Home() {
  // check if quizCode=${} is in the url, if it is, render the quiz page component. Otherwise render the home page component

  // test supabase connection
  // console.log("superbase", supabase);

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Question | null>(null);
  const [quizId, setQuizId] = useState<number | null>(1);

  useEffect(() => {
    // create async function
    const quizId = 2;
    const fetchQuiz = async () => {
      const { data: fetchedData, error: fetchedError } = await supabase
        .from("quiz")
        .select()
        .eq("id", quizId);
      console.log(fetchedData);
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

    fetchQuiz().then(async () => {
      const url = await getConversationalAiSignedUrl();
      console.log("signed url", url);
    });
  }, []);

  console.log("render", quiz);

  return (
    <main className="flex flex-col">
      <h1 className="text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mt-4">
        PhoTrivia
      </h1>
      {fetchError && <p>{fetchError}</p>}
      {quiz && (
        // <div className="quiz">
        //   {quizzes.map((quiz: Question) => (
        //     <p key={quiz.id}>Quiz {quiz.id}: {quiz.question}</p>
        //   ))}
        // </div>

        <QuizQuestion question={quiz} />
      )}

      {/* <h2>Ex excepteur consectetur laboris elit esse lorem id sint nulla ullamco nostrud cillum proident fugiat cillum do est cillum laborum officia irure duis excepteur elit eu velit sit do labore duis aliquip culpa veniam enim laboris officia cillum veniam labore tempor consectetur</h2> */}
    </main>
  );
}
