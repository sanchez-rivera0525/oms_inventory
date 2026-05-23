import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <span className="brand-mark">OMS</span>
          <h1>Sign in setup needed</h1>
          <p>Add Clerk environment variables in Vercel, then redeploy the OMS inventory console.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <section className="auth-card clerk-card">
        <span className="brand-mark">OMS</span>
        <h1>Sign in</h1>
        <p>Warehouse staff access</p>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/awnings" />
      </section>
    </main>
  );
}
