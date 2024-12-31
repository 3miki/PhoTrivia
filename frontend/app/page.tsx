"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const QuizLevel = () => {
  const [level, setLevel] = useState("easy");

  return (
    <div className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
      <select
        className="w-36 rounded-md bg-white p-2 text-orange-500 hover:bg-orange-100 border-2  border-orange-500 focus:outline-none"
        onChange={(e) => setLevel(e.target.value)}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button
        onClick={() => {
          console.log("clicked");
          // To Do: send level to fileUpload
          window.location.href = `/upload?level=${level}`;
          console.log(level);
        }}
        // onClick={onClick}
        type="submit"
        className="w-36 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 border-2  border-orange-500 focus:outline-none"
      >
        Send
      </button>
    </div>
  );
};

const StartGame = () => {
  return (
    <div className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
      <h2 className="text-xl text-center">
        Click the button below to start the quiz when everyone is ready!
      </h2>
      <button
        onClick={() => {
          console.log("clicked");
          window.location.href = "/game";
        }}
        type="submit"
        className="w-36 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 border-2  border-orange-500 focus:outline-none"
      >
        Send
      </button>
    </div>
  );
};

export default function Home() {
  // const [pageNumber, setPageNumber] = useState(0);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    // When page loads, check if there is a query string
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page) {
      setShowGame(true);
    }
    // If there is, then setShowGame
    // console.log("page number", pageNumber);
  }, []);

  return (
    <div className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
      <h1 className="text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mt-4">
        PhoTrivia
      </h1>
      {/* {pageNumber === 0 && <QuizLevel />} */}
      {!showGame ? <QuizLevel /> : undefined}
      {showGame ? <StartGame /> : undefined}
    </div>
  );
}
