import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { Input } from "~/shadcn/ui/Input";
import { Label } from "~/shadcn/ui/Label";
import { Button } from "~/shadcn/ui/Button";

export function SignInForm() {
  const [showSignIn, setShowSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      if (showSignIn) {
        await authClient.signIn.email(
          {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          },
          {
            onError: (ctx) => {
              alert(ctx.error.message);
            },
          }
        );
      } else {
        await authClient.signUp.email(
          {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          },
          {
            onError: (ctx) => {
              alert(ctx.error.message);
            },
          }
        );
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!showSignIn && (
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required={!showSignIn}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading 
            ? "Please wait..." 
            : showSignIn 
              ? "Sign In" 
              : "Sign Up"
          }
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          {showSignIn ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setShowSignIn(!showSignIn)}
            className="text-blue-500 hover:text-blue-600 font-medium"
            disabled={isLoading}
          >
            {showSignIn ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Only authorized bank representatives can access the dashboard.
          <br />
          Your email must be pre-approved by your bank administrator.
        </p>
      </div>
    </div>
  );
}