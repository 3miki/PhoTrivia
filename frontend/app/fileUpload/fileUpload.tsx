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

  console.log("imageFiles ", imageFiles);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []).map((file) => ({
      file,
    }));

    setImageFiles((prevFiles) => [...prevFiles, ...files]); // Append new files to the existing state
  };

  const onClick = async () => {
    console.log("call backend: ");

    console.log("clicked");
    await signInWithEmail();
    console.log("signed in");
    const publicImageUrls: string[] = [];

    // upload images
    const promises = imageFiles.map(async (image) => {
      console.log("uploading");
      const id = uuid();
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(id, image.file, {
          cacheControl: "3600",
          upsert: false,
        });
      console.log(data);
      console.log("uploaded: ", image.file.name);

      if (error) {
        console.error("Error uploading file:", error);
        return;
      }

      // get the public URL of the uploaded file
      // { download: true }
      const publicUrl = supabase.storage.from("photos").getPublicUrl(data.path)
        .data.publicUrl;
      publicImageUrls.push(publicUrl);
      console.log("File URL:", publicUrl);
    });

    await Promise.all(promises);
    // generate quiz and save the public URL to the database
    console.log("filePaths: ", publicImageUrls);

    // call the backend function create_quiz to generate the quiz
    const response = await fetch("/api/helloNextJs", {
      method: "POST",
      body: JSON.stringify({ fileUrls: publicImageUrls, quizLevel: "medium" }),
    });

    console.log("response: ", response);
    if (!response.ok) {
      throw new Error("Failed to generate quiz");
    }

    const quiz = await response.json();
    console.log("quiz generated (response):", response);
    console.log("quiz: ", quiz);
    console.log("quiz 1: ", quiz[0]);
    // console.log("question: ", quiz[0].question);
    // console.log("answer: ", quiz[0].answer);
    // console.log("url: ", quiz[0].url);

    // save the quiz to the database
    console.log("Attempting to insert quiz:");
    try {
      const { data: insertData, error: insertError } = await supabase
        .from("quiz")
        .insert(quiz[0]);
      if (insertError) {
        throw new Error("Failed to insert quiz");
      }
      console.log("quiz saved");
    } catch (insertError) {
      console.log("error: ", insertError);
    }
    console.log("insert data part ended");
  };

  return (
    <div>
      <h1 className="text-xl text-center">
        Choose Your Favorite Photos for the Game!
      </h1>

      <p className="text-sm back">
        Upload as many photos as you like to make the game more exciting! Please
        note that these images will be processed by our AI to create
        personalised quiz questions. To keep things fun and safe, we recommend
        uploading photos of objects, scenery, food, or buildings rather than
        personal or sensitive images. Have fun choosing your best shots! 📸✨
      </p>

      <input type="file" multiple onChange={handleImageSelect} />
      <button
        onClick={onClick}
        // test get public URL
        // onClick={() => createPublicUrl(filePath)}
        type="submit"
        className="w-full rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none"
      >
        Send
      </button>
    </div>
  );
};

// create a public URL
// const createPublicUrl = (fileName: string): string | undefined => {
//   const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
//   console.log("Public URL:", data.publicUrl);
//   return data.publicUrl;
// };

// test get public URL
// const filePath: string = "replicate-prediction-vxpb44lb3amv7cuqfh4hpnqnle.jpg";
// createPublicUrl(filePath);

// creating a signed URL
// const createSignedUrl = async (fileName: string) => {
//     const { data, error } = await supabase
//         .storage
//         .from('photos')
//         .getSignedUrl(`photos_${fileName}`, 60); // 60 seconds
//     console.log('Signed URL:', data.signedUrl);
// }

// // for deleting the image
// const deleteImages = async (fileNames: string[]) => {
//     const { data, error } = await supabase
//         .storage
//         .from('photos')
//         .remove(fileNames.map(fileName => `photos_${fileName}`)); // should be array
//     console.log('Files deleted successfully:', data);
// };
