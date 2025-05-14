import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <SignIn
        appearance={{
          baseTheme: dark,
        }}
      />
    </div>
  );
}

