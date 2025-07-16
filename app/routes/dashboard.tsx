import { Outlet } from "react-router";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
import { authClient } from "~/lib/auth-client";
import { api } from "../../convex/_generated/api";
import { SignInForm } from "~/components/auth/SignInForm";

export default function Dashboard() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <SignInRequired />
      </Unauthenticated>
      <Authenticated>
        <DashboardLayout />
      </Authenticated>
    </>
  );
}

function DashboardLayout() {
  const user = useQuery(api.auth.getCurrentUser);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              LIMBO Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user.role === "bank-representative" && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                Bank Representative
              </span>
            )}
            {user.role === "admin" && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Admin
              </span>
            )}
            <button
              onClick={() => authClient.signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function SignInRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Access Required
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Please sign in to access the dashboard
          </p>
        </div>
        <SignInForm />
        <div className="text-center">
          <a
            href="/"
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            ← Back to public listings
          </a>
        </div>
      </div>
    </div>
  );
}