# PhoTrivia Frontend
#### Description: This app allows users to submit their own photos and transforms them into quizzes using generative AI vision capabilities. By generating fresh questions from the photos, it provides an unique quiz game experience. Ideal for parties or gatherings with friends and family, the app adds a fun twist to sharing their photos.

## How to Use (Play quiz game)
1.	Players choose a quiz level to start the game.
2.	Upload photos: Scan the QR code or click the “Upload” button to navigate to the photo upload page.
3. Start the game, and the app will display quiz questions alongside the photos.
4.	Answer the questions and reveal the answers to see how you scored!

## Features
1.	Image Upload:
	-	Allows multiple players to upload photos simultaneously via a QR code or direct interface.
2.	AI-Generated Quizzes:
	-	Utilizes the OpenAI API to generate unique quiz questions based on uploaded photos.
3.	Photo Display:
	-	Displays uploaded photos alongside the quiz questions for sharing their memories.
4.	Seamless Navigation:
	-	Built with React components to handle button click events for seamless page transitions and navigation.

## Technology
- Open AI API:
  - Used `gpt-4o-mini` model to generate unique quiz questions based on uploaded photos.
- React with TypeScript and Next.js:
  - Used for building a responsive user interface.
- Supabase:
  - Used for image storage and a database to store and manage quiz data.

## Set Up

1. Setup environment variables:
  
   `cp example.env .env`
      
      Fill in the values:
     
     - OPENAI_API_KEY: Open AI API key
     - NEXT_PUBLIC_SUPABASE_URL: The Supabase project URL you obtained from the Supabase dashboard.
     - NEXT_PUBLIC_SUPABASE_ANON_KEY: The Supabase anon API key you got from the Supabase dashboard.
     - NEXT_PUBLIC_TEST_AUTH_EMAIL: The email address you want to use for testing. 
     - NEXT_PUBLIC_TEST_AUTH_PASSWORD: The password for the test email account. 
     - NEXT_PUBLIC_SERVER_URL: The default is set to `localhost`, but if you’re hosting the app on a server or want to share the upload page, set this to the IP address or domain of your server.
  
2. Install the dependencies
   
   `pnpm install`

3. Run the script
   
   `pnpm run dev`

4. Access the Client
   
   `http://localhost:3000/`



