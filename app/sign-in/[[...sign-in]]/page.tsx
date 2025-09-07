import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-[25rem] space-y-6">
        <SignIn />
      </div>
    </div>
  );
}
