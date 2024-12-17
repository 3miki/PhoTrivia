import React, { useState } from 'react';
import supabase from '@supabase/supabase-js';

interface FormValues {
    images: { file: File }[];
    }

const Uploader: React.FC = () => {
   
const [imageFiles, setImageFiles] = useState<FormValues['images']>([]);

console.log("imageFiles ", imageFiles);

const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).map(file => ({ file }));

    setImageFiles((prevFiles) => [...prevFiles, ...files]); // Append new files to the existing state
  };

return (
    <div>
        <input type="file" multiple onChange={handleImageSelect} />
        <button type="submit" className="w-full rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none">
            Submit
        </button>
    </div>
);
}


export default Uploader;


export Storage: React.FC = () => {
    const fileInput = useState<string | null>(null);
    const imageUrl = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (!file) return;
        
        // https://supabase.com/docs/reference/javascript/storage-from-upload
        const { data, error } = await supabase.storage.from('photos').upload(`photos_${Date.now()}`, file,
        {
            cacheControl: '3600',
            upsert: false
        }
        ), 

        if (error) {
            console.error('Error uploading file:', error)
            return
        }
        setImageUrl(URL.createObjectURL(file));
    };

    return (
        <div>
            <input type="file" onChange={handleFileUpload} />
            {imageUrl && <img src={imageUrl} alt="Uploaded" />}
        </div>
    );
    };

export default Storage;



// for create a public URL
const createPublicUrl = async (fileName: string) => {
    const { data, error } = await supabase
        .storage
        .from('photos')
        .getPublicUrl(`photos_${fileName}`);

    if (error) {
        console.error('Error creating a public URL:', error);
        return;
    }

    console.log('Public URL:', data.publicUrl);
}

// for creating a signed URL
const createSignedUrl = async (fileName: string) => {
    const { data, error } = await supabase
        .storage
        .from('photos')
        .getSignedUrl(`photos_${fileName}`, 60); // 60 seconds

    if (error) {
        console.error('Error creating a signed URL:', error);
        return;
    }

    console.log('Signed URL:', data.signedUrl);
}




// for deleting the image
const deleteImages = async (fileNames: string[]) => {
    const { data, error } = await supabase
        .storage
        .from('photos')
        .remove(fileNames.map(fileName => `photos_${fileName}`)); // should be array

    if (error) {
        console.error('Error deleting files:', error);
        return;
    }

    console.log('Files deleted successfully:', data);
};


// // for download the image
// const downloadImage = async (fileName: string) => {
//     const { data, error } = await supabase
//     .storage
//     .from('photos')
//     .download(`photos_${fileName}`)
// }