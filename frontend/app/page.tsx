"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import ReactDOM from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { set } from "zod";
// https://www.npmjs.com/package/qrcode.react

interface QuizLevelProps {
  setPageNumber: (pageNumber: number) => void;
  setLevel: (level: string) => void;
  // level: string;
}

const QuizLevel: React.FC<QuizLevelProps> = ({ setPageNumber, setLevel }) => {
  return (
    <div className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
      <h2 className="text-xl text-center">
        Select the difficulty level of the quiz!
      </h2>
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
          setPageNumber(2);
          // window.location.href = `/upload?level=${level}`;
          // console.log(level);
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

interface StartGameProps {
  pageNumber: number;
  level: string;
}

const StartGame: React.FC<StartGameProps> = ({ pageNumber, level }) => {
  const router = useRouter();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const url_path = process.env.NEXT_PUBLIC_SERVER_URL;
  // const qrCodeUrl = `${url_path}/upload?level=${level}`;

  useEffect(() => {
    setIsMounted(true);
    setQrCodeUrl(`${url_path}/upload?level=${level}`);
  }, [level]);

  if (!isMounted) {
    return null; // Return null on server-side and initial client render
  }

  const handleUpload = () => {
    router.push(`/upload?level=${level}`);
  };

  const handleGameStart = () => {
    router.push("/game");
  };

  return (
    <div className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
      {isMounted && (
        <>
          <h2 className="text-xl text-center">
            Scan the QR code to upload your own photos!
          </h2>
          {qrCodeUrl && <QRCodeSVG value={qrCodeUrl} />}
          <button
            onClick={handleUpload}
            type="submit"
            className="w-36 rounded-md bg-white p-2 text-orange-500 hover:bg-orange-100 border-2 border-orange-500 focus:outline-none"
          >
            Uploader
          </button>

          <h2 className="text-xl text-center">
            Click the button below to start the quiz when everyone is ready!
          </h2>
          <button
            onClick={handleGameStart}
            type="submit"
            className="w-36 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 border-2 border-orange-500 focus:outline-none"
          >
            Let's Go!
          </button>
        </>
      )}
    </div>
  );
};

export default function Home() {
  const [level, setLevel] = useState("easy");
  const [pageNumber, setPageNumber] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // When page loads, check a query string (page param)
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page) {
      setPageNumber(parseInt(page));
    }
  }, []);

  return (
    <div className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
      <h1 className="text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mt-4">
        PhoTrivia
      </h1>
      {/* Only render content after component has mounted to prevent hydration issues */}
      {!isMounted ? (
        <div className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
          <h2 className="text-xl text-center">Loading...</h2>
        </div>
      ) : (
        <>
          {pageNumber === 1 && (
            <QuizLevel setPageNumber={setPageNumber} setLevel={setLevel} />
          )}
          {pageNumber === 2 && (
            <StartGame pageNumber={pageNumber} level={level} />
          )}
        </>
      )}
    </div>
  );
}
