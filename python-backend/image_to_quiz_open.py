import os
import base64
import json
import httpx
from typing import Literal, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

level_dict = {
            "easy": "easy(participants include children and adults)", 
            "medium": "medium(participants include young adults and adults)",
            "hard": "hard(participants are inteligent people)"
            }

prompt = """
You are a host for the quiz game! Based on the images you see, create questions and answers for guests. Images are provided by your guests so make sure to make interesting quizes for everyone! The question should be related to the image and the answer should be a fun fact, trivia or something interesting to learn. Do not make a question to answer the object in the image but use some contexual information. The question should be a complete sentence and the answer should be a word or short sentence. Each question and answer pair should be a json object as follows {"Question 1": "How long does squirrel hibernate?", "Answer 1": "They do not hibernate."}. Here are the images:
"""

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

def create_quiz(prompt: str, image_urls: list[str], quiz_level: str) -> list[dict[str, str]]:
 
    prompt = prompt + "\n".join([url for url in image_urls]) + "\n".join([quiz_level]) + "\n"
    print("prompt:", prompt)

    openaiModel = "gpt-4o-mini"
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = openai_client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=openaiModel,
    )

    quiz = response.choices[0].message.content
    # print(quiz)

    quiz_dict = crean_output_to_json(quiz, image_urls)
    return quiz_dict

if __name__ == "__main__":
    load_dotenv()
    example_urls = ["https://i2.wp.com/calvinthecanine.com/wp-content/uploads/2019/11/A35A7884v4.jpg?resize=697%2C465",
        "https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/06/01/16/mickey-minnie.jpg?width=1200"]   
    quiz_level = 'easy'

    genetaged_quiz_dict = create_quiz(prompt, example_urls, quiz_level)

    if genetaged_quiz_dict is None:
        print("Failed to generate summary")
    else:
        print("Quiz generated successfully")
        print(genetaged_quiz_dict)