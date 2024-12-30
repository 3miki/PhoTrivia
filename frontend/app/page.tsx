"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const QuizLevel = (obj: { setPageNumber: (newPage: number) => void }) => {
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
          obj.setPageNumber(1);
          // To Do: send level to fileUpload
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
  const [pageNumber, setPageNumber] = useState(0);

  return (
    <div className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
      <h1 className="text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mt-4">
        PhoTrivia
      </h1>
      {/* {pageNumber === 0 && <QuizLevel />} */}
      {pageNumber === 0 ? (
        <QuizLevel setPageNumber={setPageNumber} />
      ) : undefined}
      {pageNumber === 1 ? <StartGame /> : undefined}
    </div>
  );
}
