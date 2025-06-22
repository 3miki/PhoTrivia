"use client";
import Image from "next/image";
import Link from "next/link";
import supabase from "../supabaseClient";
import signInWithEmail from "../upload/signin";
import React, { useEffect, useState, useRef } from "react";

import initializeRealtimeConnection from "./realtimeAgent";

type Question = {
  id: number;
  question: string;
  answer: string;
  url: string;
};

// question component
export const QuizQuestion = ({
  question,
  // setQuizAnswer,
  showQuizAnswer,
}: {
  question: Question;
  // setQuizAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  showQuizAnswer?: () => void;
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
          // onClick={() => setQuizAnswer(true)}
          onClick={() => {
            showQuizAnswer?.();
          }}
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
  // setQuizAnswer,
  // incrementQuiz,
  showNextQuiz,
}: {
  question: Question;
  // setQuizAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  // incrementQuiz: () => void;
  showNextQuiz?: () => void;
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
          // onClick={() => {
          //   console.log("clicked");
          //   setQuizAnswer(false);
          //   incrementQuiz();
          // }}
          onClick={() => {
            showNextQuiz?.();
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // quiz index
  // true if quiz answer is shown, false if quiz question is shown
  const [showAnswer, setQuizAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Add ref to track initialization
  const isInitialized = useRef(false);
  const agentRef = useRef<RTCPeerConnection | null>(null);

  // check if quizCode=${} is in the url, if it is, render the quiz page component. Otherwise render the home page component

  // Initialize on mount only
if (!isInitialized.current) {
  isInitialized.current = true;

  const initializeGame = async () => {
    try {
      // test supabase connection
      // console.log("supabase", supabase);

      // sign in for supabase
      await signInWithEmail();
      console.log("signed in");

      const { data: fetchedQuizzes, error: fetchedError } = await supabase
        .from("quiz")
        .select();

      if (fetchedError) throw fetchedError;
      if (!fetchedQuizzes?.length) {
        setFetchError("No quizzes available");
        return;
      }

      console.log("Quizzes fetched successfully:", fetchedQuizzes);
      setQuiz(fetchedQuizzes);

      if (!agentRef.current) {
        await initializeRealtimeConnection(fetchedQuizzes, {
          showAnswer: () => {
            console.log("AI triggered show answer");
            // showQuizAnswer();
            setQuizAnswer(true);
          },
          nextQuestion: () => {
            console.log("AI triggered next question");
            // showNextQuiz();
            setCurrentIndex((prev) => (prev + 1) % fetchedQuizzes.length);
            setQuizAnswer(false);
          },
        });
      }
    } catch (error) {
      console.error("Initialization error:", error);
      setFetchError("Failed to initialize game");
    } finally {
      setIsLoading(false);
    }
  };

  initializeGame();
}
  console.log("quiz", quiz);

  // for quiz functions
  // const incrementQuiz = () => {
  //   setCurrentIndex((prev) => (prev + 1) % quiz.length);
  // };

  const showQuizAnswer = () => {
    setQuizAnswer(true);
  };

  const showNextQuiz = () => {
    setCurrentIndex((prev) => (prev + 1) % quiz.length);
    setQuizAnswer(false);
  };

  // Guard against undefined quiz
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!quiz.length || !quiz[currentIndex]) {
    return <div>No quizzes available</div>;
  }

  return (
    <div>
      <main className="flex justify-center items-center flex-col gap-2 max-w-[700px] mx-auto">
        <h1 className="text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mt-4">
          PhoTrivia
        </h1>
        {fetchError && <p>{fetchError}</p>}
        {quiz.length > 0 && (
          <div className="quiz">
            {!showAnswer && quiz[currentIndex] ? (
              <QuizQuestion
                question={quiz[currentIndex]}
                // setQuizAnswer={setQuizAnswer}
                showQuizAnswer={showQuizAnswer}
              />
            ) : undefined}
            {showAnswer && quiz[currentIndex] ? (
              <QuizAnswer
                question={quiz[currentIndex]}
                // setQuizAnswer={setQuizAnswer}
                // incrementQuiz={incrementQuiz}
                showNextQuiz={showNextQuiz}
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
