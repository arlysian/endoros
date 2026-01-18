import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-16">
        <Link href="/">
          <span className="text-base font-semibold text-black tracking-tight">
            endoros
          </span>
        </Link>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-8 -mt-16">
        <SignIn
          signUpUrl="/signup"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
            }
          }}
        />
      </main>
    </div>
  );
}
