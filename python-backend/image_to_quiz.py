import os
import base64
import json
import httpx
from typing import Literal, Optional
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

level_dict = {
            "easy": "easy(participants include children and adults)", 
            "medium": "medium(participants include young adults and adults)",
            "hard": "hard(participants are inteligent people)"
            }


# model output is str type, need to convert to list of dict(json)
def crean_output_to_json(response_text: str, image_urls: list[str]) -> list[dict[str, str]]:
    # remove "```json" and "```" from output, use []
    start_index = response_text.find('[')
    end_index = response_text.rfind(']') + 1
    if start_index != -1 and end_index != -1:
        response_text = response_text[start_index:end_index]
    # print("Cleaned response text:", response_text)

    try:
        quiz_list = json.loads(response_text)
        # print(['Type:', type(quiz_list)])
        # print(quiz_list)
    except json.JSONDecodeError as e:
        print(f"Failed to decode JSON: {e}")
        quiz_list = []

    quiz_dict = {}

    for i, item in enumerate(quiz_list):
        question_key = f"Question {i+1}"
        answer_key = f"Answer {i+1}"
        quiz_dict[question_key] = item[question_key]
        quiz_dict[answer_key] = item[answer_key]

    for i, image_url in enumerate(image_urls):
        index = f"Url {i+1}"
        quiz_dict[index] = image_url
        # print(quiz_dict[index])
    
    print(quiz_dict)

    return quiz_dict


def create_quiz_rawurl(image_urls: list[str], quiz_level: str) -> list[dict[str, str]]:
# def create_quiz(image_path1, image_path2) -> list[dict[str, str]]:
    # print("prompt:", prompt)
    # print("image urls:", image_urls)
    # print("level:", quiz_level)
    # print("level:", level_dict[quiz_level])

    prompt = """
You are a host for the quiz game! Based on the images you see, create questions and answers for guests. Images are provided by your guests so make sure to make interesting quizes for everyone! The question should be related to the image and the answer should be a fun fact, trivia or something interesting to learn. Do not make a question to answer the object in the image but use some contexual information. The question should be a complete sentence and the answer should be a word or short sentence. Each question and answer pair should be a json object as follows {'Question 1': 'How long does squirrel hibernate?', 'Answer 1': 'They do not hibernate.}'. Reply with array of JSON objects. Here are the images:
"""  + "\n".join([url for url in image_urls]) + "\n"
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
    response = model.generate_content([prompt, *image_urls, level_dict[quiz_level]])
    # print(response.text)
    quiz_dict = crean_output_to_json(response.text, image_urls)
    return quiz_dict

def create_quiz_encode(prompt: str, image_urls: list[str], quiz_level: str) -> str:
    genai.configure(api_key=os.getenv("GENERATIVE_API_KEY"))
    model = genai.GenerativeModel(model_name = "gemini-1.5-flash")

    # image1 = httpx.get(example_image1)
    # response = model.generate_content([{'mime_type':'image/jpeg', 'data': base64.b64encode(image1.content).decode('utf-8')}, prompt])

    # iterate process
    encoded_images = []
    for image_url in image_urls:
        image = httpx.get(image_url)
        encoded_images.append({'mime_type': 'image/jpeg', 'data': base64.b64encode(image.content).decode('utf-8')})

    response = model.generate_content([prompt, *encoded_images, level_dict[quiz_level]])
    # print(response.text)

    quiz_dict = crean_output_to_json(response.text, image_urls)
    return quiz_dict

    
def create_quiz_path(prompt: str, image_paths: list[str], quiz_level: str) -> list[dict[str, str]]:
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
    response = model.generate_content([prompt, *image_paths], level_dict[quiz_level])
    # print(response.text)

    quiz_dict = crean_output_to_json(response.text, image_paths)
    return quiz_dict


if __name__ == "__main__":
    load_dotenv()
    quiz_level = 'medium'
    # print(quiz_level)

    # image_path1 = "bird-small.jpg"
    # image_path2 = "squirrel.jpg"
    # image_paths = [image_path1, image_path2]

    example_image1 = "https://static.independent.co.uk/s3fs-public/thumbnails/image/2010/07/06/00/407862.jpg"
    example_image2 = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg/2560px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg"
    example_image3 = 'https://i2.wp.com/calvinthecanine.com/wp-content/uploads/2019/11/A35A7884v4.jpg'
    image_urls = [example_image1, example_image2, example_image3]

    print("create quiz with urls")
    genetaged_quiz_dict = create_quiz_rawurl(image_urls, quiz_level)

    # print("create quiz with encoded urls")
    # quiz_generated = create_quiz_encode(prompt, image_urls, quiz_level)

    # print("creat quiz with image paths")
    # quiz_generated = create_quiz_path(prompt, image_paths, quiz_level)

    if genetaged_quiz_dict is None:
        print("Failed to generate summary")
    else:
        print("Quiz generated successfully")
        print(genetaged_quiz_dict)