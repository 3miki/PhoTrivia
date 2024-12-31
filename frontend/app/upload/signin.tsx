import supabase from "../supabaseClient";

async function signInWithEmail() {
  if (
    !process.env.NEXT_PUBLIC_TEST_AUTH_EMAIL ||
    !process.env.NEXT_PUBLIC_TEST_AUTH_PASSWORD
  ) {
    throw new Error("Missing required environment variables");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.NEXT_PUBLIC_TEST_AUTH_EMAIL,
    password: process.env.NEXT_PUBLIC_TEST_AUTH_PASSWORD,
  });

  if (error) {
    console.error("Error signing in:", error.message);
    throw new Error("Error signing in");
  }
}

export default signInWithEmail;
