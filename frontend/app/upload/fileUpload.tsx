"use client";

import React, { useState } from "react";
import supabase from "../supabaseClient";
import signInWithEmail from "./signin";
import { v4 as uuid } from "uuid";
interface FormValues {
  images: { file: File }[];
}

export const Uploader: React.FC = () => {
  const [imageFiles, setImageFiles] = useState<FormValues["images"]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // console.log("imageFiles ", imageFiles);
  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []).map((file) => ({
      file,
    }));

    setImageFiles((prevFiles) => [...prevFiles, ...files]); // Append new files to the existing state
  };

  const onClick = async () => {
    console.log("clicked");
    console.log("call backend: ");
    await signInWithEmail();
    // console.log("signed in");
    const publicImageUrls: string[] = [];

    // upload images
    const promises = imageFiles.map(async (image) => {
      // console.log("uploading");
      const id = uuid();
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(id, image.file, {
          cacheControl: "3600",
          upsert: false,
        });
      // console.log(data);
      // console.log("uploaded: ", image.file.name);

      if (error) {
        console.error("Error uploading file:", error);
        return;
      }

      // get the public URL of the uploaded file
      // { download: true }
      const publicUrl = supabase.storage.from("photos").getPublicUrl(data.path)
        .data.publicUrl;
      publicImageUrls.push(publicUrl);
      // console.log("File URL:", publicUrl);
    });

    await Promise.all(promises);
    // generate quiz and save the public URL to the database
    // console.log("filePaths: ", publicImageUrls);

    const urlParams = new URLSearchParams(window.location.search);
    const quizLevel = urlParams.get("level") || "medium";

    console.log("quizLevel: ", quizLevel);

    // call the backend function create_quiz to generate the quiz
    const response = await fetch("/api/quiz", {
      method: "POST",
      body: JSON.stringify({ fileUrls: publicImageUrls, quizLevel: quizLevel }),
    });

    // console.log("response: ", response);
    if (!response.ok) {
      throw new Error("Failed to generate quiz");
    }

    const quiz = await response.json();
    // console.log("quiz generated (response):", response);
    // console.log("quiz: ", quiz);
    // console.log("quiz 1: ", quiz[0]);
    // console.log("question: ", quiz[0].question);
    // console.log("answer: ", quiz[0].answer);
    // console.log("url: ", quiz[0].url);

    // save the quiz to the database
    console.log("Inserting quiz:");
    try {
      const { data: insertData, error: insertError } = await supabase
        .from("quiz")
        .insert(quiz[0]);
      if (insertError) {
        throw new Error("Failed to insert quiz");
      }
      // console.log("quiz saved");
    } catch (insertError) {
      console.log("error: ", insertError);
    }
    // console.log("insert data part ended");
    window.location.href = "/?page=1";
  };

  return (
    <div className="flex justify-center items-center flex-col gap-4 max-w-[700px] mx-auto">
      <h1 className="text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mt-4">
        PhoTrivia
      </h1>
      <h2 className="text-xl text-center">
        Upload as many pictures as you’d like to make the game more exciting!
      </h2>

      <p className="text-m back text-center">
        Our app will use genAI to create personalized quiz questions. For a safe
        experience, choose photos of objects, scenery, food, or buildings—avoid
        personal or sensitive images.📸✨
      </p>

      <div className="flex justify-center">
        <input type="file" multiple onChange={handleImageSelect} />
      </div>
      <button
        onClick={async () => {
          setIsLoading(true);
          await onClick();
          setIsLoading(false);
        }}
        type="submit"
        className="w-24 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-300 border-2  border-orange-500 focus:outline-none flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send"}
      </button>

      <button
        onClick={() => {
          // console.log("clicked");
          window.location.href = "/?page=1";
        }}
        type="submit"
        className="w-24 rounded-md text-orange-500 p-2 bg-white hover:bg-orange-300 border-2 border-orange-500 focus:outline-none "
      >
        Home
      </button>
    </div>
  );
};
