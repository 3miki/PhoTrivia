"use client";

import React, { useState } from "react";
import supabase from "../supabaseClient";

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

  const onClick = async () => {};

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
        type="submit"
        className="w-full rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none"
      >
        Send
      </button>
    </div>
  );
};

export const Storage: React.FC = () => {
  const fileInput = useState<string | null>(null);
  const imageUrl = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    // https://supabase.com/docs/reference/javascript/storage-from-upload
    const { data, error } = await supabase.storage
      .from("photos")
      .upload(`photos_${Date.now()}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      return;
    }

    // get the public URL of the uploaded file
    const publicUrl = supabase.storage
      .from("photos")
      .getPublicUrl(data.path).publicURL;
    console.log("File URL:", publicUrl);
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
};

// for create a public URL
const createPublicUrl = async (fileName: string) => {
  const { data, error } = await supabase.storage
    .from("photos")
    .getPublicUrl(`photos_${fileName}`);

  if (error) {
    console.error("Error creating a public URL:", error);
    return;
  }

  console.log("Public URL:", data.publicUrl);
};

// // for creating a signed URL
// const createSignedUrl = async (fileName: string) => {
//     const { data, error } = await supabase
//         .storage
//         .from('photos')
//         .getSignedUrl(`photos_${fileName}`, 60); // 60 seconds

//     if (error) {
//         console.error('Error creating a signed URL:', error);
//         return;
//     }

//     console.log('Signed URL:', data.signedUrl);
// }

// // for deleting the image
// const deleteImages = async (fileNames: string[]) => {
//     const { data, error } = await supabase
//         .storage
//         .from('photos')
//         .remove(fileNames.map(fileName => `photos_${fileName}`)); // should be array

//     if (error) {
//         console.error('Error deleting files:', error);
//         return;
//     }

//     console.log('Files deleted successfully:', data);
// };

// // for download the image
// const downloadImage = async (fileName: string) => {
//     const { data, error } = await supabase
//     .storage
//     .from('photos')
//     .download(`photos_${fileName}`)
// }
