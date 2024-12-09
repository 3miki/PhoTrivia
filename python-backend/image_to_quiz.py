from typing import Literal, Optional
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv
import httpx
import os
import base64

load_dotenv()

# https://ai.google.dev/gemini-api/docs/vision?lang=python
# image should be a path of the image or a url (b64 encoded)

image_path1 = "bird-small.jpg"
image_path2 = "squirrel.jpg"
image_paths = [image_path1, image_path2]

example_image1 = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg/2560px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg"
example_image2 = 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2010/07/06/00/407862.jpg?quality=75&width=1200&auto=webp'
example_image3 = 'https://i2.wp.com/calvinthecanine.com/wp-content/uploads/2019/11/A35A7884v4.jpg?resize=697%2C465'
image_urls = [example_image1, example_image2, example_image3]


prompt = """
You are a host for the quiz game! Based on the images you see, create questions and answers for guests. Images are provided by your guests so make sure to make interesting quizes for everyone! The question should be related to the image and the answer should be a fun fact, trivia or something interesting to learn. Do not make a question to answer the object in the image but use some contexual information. The question should be a complete sentence and the answer should be a word or short sentence. Each question and answer pair should be a json object as follows {'Question 1': 'How long does squirrel hibernate?', 'Answer 1': 'They do not hibernate.}'. Here are the images:
""" 
# + "\n".join([image_url for image_url in image_urls]) + "\n"

    # print("prompt:", prompt)

def create_quiz(prompt: str, image_urls: list[str]) -> list[dict[str, str]]:
# def create_quiz(image_path1, image_path2) -> list[dict[str, str]]:
    genai.configure(api_key=os.getenv("GENERATIVE_API_KEY"))
    generation_config = {
                    "temperature": 1.5, # range from 0.0 to 2.0(creative)
                    "max_output_tokens": 300, # max 128,000 tokens
                    "response_mime_type": "application/json",
                    }
    model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config=generation_config,
                )
    response = model.generate_content([prompt, *image_urls])
    print(response.text)
    return response.text

def create_quiz_encode(prompt: str, image_urls: list[str]) -> str:
    genai.configure(api_key=os.getenv("GENERATIVE_API_KEY"))
    model = genai.GenerativeModel(model_name = "gemini-1.5-flash")

    # image1 = httpx.get(example_image1)
    # response = model.generate_content([{'mime_type':'image/jpeg', 'data': base64.b64encode(image1.content).decode('utf-8')}, prompt])

    # iterate process
    encoded_images = []
    for image_url in image_urls:
        image = httpx.get(image_url)
        encoded_images.append({'mime_type': 'image/jpeg', 'data': base64.b64encode(image.content).decode('utf-8')})

    response = model.generate_content([prompt, *encoded_images])

    print(response.text)
    return response.text

    
def create_quiz(prompt: str, image_paths: list[str]) -> list[dict[str, str]]:
    genai.configure(api_key=os.getenv("GENERATIVE_API_KEY"))
    generation_config = {
                    "temperature": 1.5, # range from 0.0 to 2.0(creative)
                    "max_output_tokens": 300, # max 128,000 tokens
                    "response_mime_type": "application/json",
                    }
    model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config=generation_config,
                )
    response = model.generate_content([prompt, *image_paths])
    print(response.text)
    return response.text


if __name__ == "__main__":
    load_dotenv()

    # use file paths
    print("creat quiz image")
    quiz_generated = create_quiz(prompt, image_paths)

    # use urls
    print("create quiz")
    quiz_generated = create_quiz(prompt, image_urls)

    # print("create quiz URL")
    # quiz_generated = create_quiz_encode(prompt, image_urls)

    print(quiz_generated)
    if quiz_generated is None:
        print("Failed to generate summary")
    else:
        print("Quiz generated successfully")