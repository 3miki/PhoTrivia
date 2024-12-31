"use client";
import Image from "next/image";
import Link from "next/link";
import supabase from "../supabaseClient";
import signInWithEmail from "../upload/signin";
import React, { useEffect, useState } from "react";

type Question = {
  id: number;
  question: string;
  answer: string;
  url: string;
};

// question component
export const QuizQuestion = ({
  question,
  setQuizAnswer,
}: {
  question: Question;
  setQuizAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  // incrementQuiz: () => void;
}) => {
  console.log("question", question);

  // for testing fetching quiz and image from DB
  return (
    <div className="flex flex-col justify-center items-center p-4 m-4 rounded-2xl">
      <div className="text-orange-700 bg-slate-200/80 p-4 m-4 rounded-2xl">
        <h3 className="text-lg font-bold text-center">
          Question: {question.question}
        </h3>
      </div>
      <div className="z-10 my-4">
        <Image
          src={question.url}
          alt={`Image for quiz ${question.id}`}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <div>
        <button
          onClick={() => {
            console.log("clicked");
            setQuizAnswer(true);
          }}
          type="submit"
          className="w-36 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 border-2 border-orange-500 focus:outline-none"
        >
          See Answer
        </button>
      </div>
    </div>
  );
};

// answer component
export const QuizAnswer = ({
  question,
  setQuizAnswer,
  incrementQuiz,
}: {
  question: Question;
  setQuizAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  incrementQuiz: () => void;
}) => {
  console.log("question", question);
  return (
    <div className="flex flex-col justify-center items-center p-4 m-4 rounded-2xl">
      <div className="text-orange-700 bg-slate-200/80 p-4 m-4 rounded-2xl">
        <h3 className="text-lg font-bold text-center">
          Answer: {question.answer}
        </h3>
      </div>
      <div className="z-10 my-4">
        <Image
          // className="absolute top-0 left-0"
          src={question.url}
          alt={`Image for quiz ${question.id}`}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <div>
        <button
          onClick={() => {
            console.log("clicked");
            setQuizAnswer(false);
            incrementQuiz();
          }}
          type="submit"
          className="w-36 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 border-2  border-orange-500 focus:outline-none"
        >
          Next Quiz
        </button>
      </div>
    </div>
  );
};

export default function Game() {
  // check if quizCode=${} is in the url, if it is, render the quiz page component. Otherwise render the home page component

  // test supabase connection
  // console.log("superbase", supabase);
  signInWithEmail();

  // increment quiz
  const incrementQuiz = () => {
    setCurrentIndex((prev) => (prev + 1) % quiz.length);
  };

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Question[]>([]);
  // const [quizId, setQuizId] = useState<number | null>(1);

  useEffect(() => {
    // create async function
    const fetchQuiz = async () => {
      const { data: fetchedData, error: fetchedError } = await supabase
        .from("quiz")
        .select();
      // .eq("id", 2);
      console.log("text", fetchedData);
      // .select () to get all the data from the table
      console.log(fetchedError);
      if (fetchedError) {
        setFetchError("Could not fetch quizzes");
        setQuiz([]);
        // console.error(fetchedError)
      }
      if (fetchedData) {
        setQuiz(fetchedData); // Store the whole array
        setFetchError(null);
      }
    };

    fetchQuiz();
    // fetchQuiz().then(async () => {
    //   const url = await getConversationalAiSignedUrl();
    //   console.log("signed url", url);
    // });
  }, []);

  console.log("render", quiz);

  // const onClick = async () => {
  //   console.log("clicked");
  // };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setQuizAnswer] = useState(false);

  return (
    <div>
      <main className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
        <h1 className="text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mt-4">
          PhoTrivia
        </h1>
        {fetchError && <p>{fetchError}</p>}
        {quiz.length > 0 && (
          <div className="quiz">
            {!showAnswer ? (
              <QuizQuestion
                question={quiz[currentIndex]}
                setQuizAnswer={setQuizAnswer}
                // incrementQuiz={incrementQuiz}
              />
            ) : undefined}
            {showAnswer ? (
              <QuizAnswer
                question={quiz[currentIndex]}
                setQuizAnswer={setQuizAnswer}
                incrementQuiz={incrementQuiz}
              />
            ) : undefined}
          </div>
        )}
      </main>
    </div>
  );
}
