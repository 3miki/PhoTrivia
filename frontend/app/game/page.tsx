"use client";
import Image from "next/image";
import Link from "next/link";
import supabase from "../supabaseClient";
import signInWithEmail from "../upload/signin";
import React, { useEffect, useState } from "react";
import { getConversationalAiSignedUrl } from "../getConversationalAiSignedUrl";

type Question = {
  id: number;
  question: string;
  answer: string;
  url: string;
};

// set conversational AI signed URL
// const fetchSignedUrl = async () => {
//   const url = await getConversationalAiSignedUrl();
//   console.log("signed url", url);
// };

// const onClick = async () => {
//   console.log("clicked");
//   console.log("call backend: ");
//   await signInWithEmail();
//   console.log("signed in");
// };

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
    <div className="flex flex-col justify-between items-center p-4 rounded-2xl gap-4 bg-orange-100/80 w-[700px] h-auto">
      <div className="h-[100px] items-center text-orange-700 p-4 rounded-2xl">
        <h3 className="text-lg font-semibold text-center underline">
          Question
        </h3>
        <h3 className="text-lg font-semibold text-center">
          {question.question}
        </h3>
      </div>
      <div>
        <button
          onClick={() => setQuizAnswer(true)}
          type="submit"
          className="w-36 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 focus:outline-none"
        >
          Reveal Answer
        </button>
      </div>
      <div
        className="z-10 w-full flex justify-center p-2"
        style={{ maxHeight: "60vh", width: "auto" }}
      >
        <Image
          src={question.url}
          alt={`Image for quiz ${question.id}`}
          width={500}
          height={400}
          style={{ objectFit: "contain", maxHeight: "100%" }}
        />
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
    <div className="flex flex-col justify-between items-center p-4 rounded-2xl gap-4 bg-orange-200/80 w-[700px] h-auto">
      <div className="h-[100px] text-orange-700 p-4 rounded-2xl">
        <h3 className="text-lg font-semibold text-center underline">Answer</h3>
        <h3 className="text-lg font-semibold text-center">{question.answer}</h3>
      </div>
      <div>
        <button
          onClick={() => {
            console.log("clicked");
            setQuizAnswer(false);
            incrementQuiz();
          }}
          type="submit"
          className="w-36 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 focus:outline-none"
        >
          Next Quiz
        </button>
      </div>
      <div
        className="z-10 w-full flex justify-center p-2"
        style={{ maxHeight: "60vh", width: "auto" }}
      >
        <Image
          src={question.url}
          alt={`Image for quiz ${question.id}`}
          width={500}
          height={400}
          style={{ objectFit: "contain", maxHeight: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
};

export default function Game() {
  // check if quizCode=${} is in the url, if it is, render the quiz page component. Otherwise render the home page component

  // test supabase connection
  // console.log("superbase", supabase);

  // sign in for supabase
  signInWithEmail();
  console.log("signed in");

  // increment quiz
  const incrementQuiz = () => {
    setCurrentIndex((prev) => (prev + 1) % quiz.length);
  };

  const showQuizAnswer = () => {
    setQuizAnswer(true);
  };

  const showNextQuiz = () => {
    incrementQuiz();
    setQuizAnswer(false);
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

    // fetchQuiz();
    fetchQuiz().then(async () => {
      const url = await getConversationalAiSignedUrl();
      console.log("signed url", url);

      // set function calling tools
      const gameHostTools = {
        showQuiz: showNextQuiz,
        showAnswer: showQuizAnswer,
      };

      // // call the conversational AI
      // const conversation = await Conversation.startSession({
      //   clientTools: gameHostTools,
      // });

      // conversation.start();
    });
  }, []);

  console.log("render", quiz);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setQuizAnswer] = useState(false);

  return (
    <div>
      <main className="flex justify-center items-center flex-col gap-2 max-w-[700px] mx-auto">
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
              />
            ) : undefined}
            {showAnswer ? (
              <QuizAnswer
                question={quiz[currentIndex]}
                setQuizAnswer={setQuizAnswer}
                incrementQuiz={incrementQuiz}
              />
            ) : undefined}

            {/* game ending message */}
            {currentIndex === quiz.length - 1 && showAnswer && (
              <div className="text-center gap-2 py-4">
                <h2 className="text-2xl font-bold">
                  Congratulations! You've completed the AI quizzes.
                </h2>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      console.log("clicked");
                      window.location.href = "/";
                    }}
                    type="submit"
                    className="w-36 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 border-2  border-orange-500 focus:outline-none"
                  >
                    Start New Game
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
