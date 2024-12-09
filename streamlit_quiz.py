import os
from PIL import Image
import streamlit as st
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()
if "button1_clicked" not in st.session_state:
    st.session_state.button1_clicked = False

if "button2_clicked" not in st.session_state:
    st.session_state.button2_clicked = False

if "quiz_data" not in st.session_state:
    st.session_state.quiz_data = {"question": None, "answer": None}

st.title('Quiz time! 📝')

st.write("Upload your selected photos.")

# set up API key
st.info("This app uses the Gemini-Flash 1.5 model for its responses. To use it, you’ll need a Google Gemini API key. Get your key [here](https://ai.google.dev/gemini-api/docs/api-key).")
api_key_input = st.text_input("Step 1: Enter your Gemini API Key 🗝️", type="password")

# upload image file
uploaded_file = st.file_uploader("Step 2: Choose an image 🖼️", type=["jpg", "jpeg", "png"])

image_path = None
if uploaded_file:
    image_path = uploaded_file

# display image and traslate button when image is uploaded
if image_path:
    image = Image.open(image_path)
    st.image(image, caption="Uploaded Image", width=300)

    # action when button is clicked
    if st.button("Upload", key="upload_button"):
        st.session_state.button1_clicked = True
        if not api_key_input:
            st.error("Please enter your Gemini API Key.")
        else:
            with st.spinner('Generating quiz...'):
                # run models to generate answers
                genai.configure(api_key=api_key_input)
                generation_config = {
                "temperature": 1.5, # range from 0.0 to 2.0(creative)
                "max_output_tokens": 300, # max 128,000 tokens
                "response_mime_type": "application/json",
                }
                model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config=generation_config,
                )
                
                prompt = "You are a host for the quiz game! Based on the image you see, create a question and answer for guests. Images are provided by your guests so make sure to make interesting quiz for everyone! The question should be related to the image and the answer should be a fun fact, trivia or something interesting to learn. Do not make a question to answer the object name in the image but use some information related to the object. The question should be a complete sentence and the answer should be a word or short sentence. Question and answer pair should be a single json object as follows {'Question': 'How long does squirrel hibernate?', 'Answer': 'They do not hibernate.}'. Here is the image:"

                response = model.generate_content([prompt, image])
                print(response.text)
                # print(type(response.text))
                response_json = json.loads(response.text)
                # print(type(response_json))
                question = response_json.get('Question')
                answer = response_json.get('Answer')
            
                print(f"Question: {question}")
                print(f"Answer: {answer}")

                # save the question and answer in session state
                st.session_state.quiz_data["question"] = question
                st.session_state.quiz_data["answer"] = answer

                if st.session_state.quiz_data["question"] and st.session_state.quiz_data["answer"]:
                    st.write("Here is your quiz question:")
                    st.subheader(st.session_state.quiz_data["question"])
                # if question and answer and st.session_state.button1_clicked:
                else:
                    st.error("Failed to generate quiz question and answer. Try again!")

                    # Display "Check Answer" button if a question exists
    if st.session_state.quiz_data["question"]:
        if st.button("Check Answer", key="answer_button"):
            st.session_state.button2_clicked = True

    # Display the answer when the "Check Answer" button is clicked
    if st.session_state.button2_clicked:
        st.write("Here is the answer:")
        st.subheader(st.session_state.quiz_data["answer"])