# PhoTrivia
The AI photo quiz game is a fun and interactive app that combines realtime agent and vision capabilities. Players can upload their photos, and the app generates quiz questions and answers based on the images. 

Perfect for events like Christmas parties or gatherings, this app creates a unique opportunity for friends and family to share their favorite photos and stories from the year while enjoying an engaging AI-hosted quiz game.

With realtime agent integration, the game becomes even more immersive, as an AI host guides players through questions, interacts dynamically with participants, and reveals answers in a lively, conversational manner.


## Features
1.	Image Upload:
-	Allows multiple players to upload photos simultaneously via a QR code or direct interface.
2.	AI-Generated Quizzes:
-	Utilizes the OpenAI API to generate unique quiz questions based on uploaded photos.
3.	Photo Display:
-	Displays uploaded photos alongside the quiz questions for sharing their memories.
4.	Seamless Navigation:
-	Built with React components to handle button click events for seamless page transitions and navigation.
  questions.
5.  Realtime AI Host:
- An AI agent vocally and visually hosts the quiz game by interacting with players and dynamically switching screens in real time.

## To Do:
- [x] frontend: create pages 
  - [x] main page 
      - [x] 1. quiz level selection 
      - [x] 2. QR code for image upload page 
      - [x] 3. game page 
  - [x] image upload page
- [x] backend: api and storage
  - [x] connect Supabase bucket to upload image 
  - [x] save quiz and image path 
  - [x] create routers in typescript 
- [x] hosting
  - [x] add conversational AI for hosting
  - [x] use function calling to change images 
- [ ] Authentication
- [ ] Error handling at:
  - [ ] createQuiz API

## Future work:
- [ ] Leaderboard
- [ ] Manage length of game (limit image upload capacity based on number of participants)

## Technology:
- OpenAI API: 
  - Used gpt-4o-mini model to generate unique quiz questions based on uploaded photos.
  - Used gpt-4o-realtime-preview to the host quiz game and update UI dynamically.
- React with TypeScript and Next.js:
  - For building a responsive user interface and handling routing.
- Supabase
  - For image storage and a database to store and manage quiz data.

