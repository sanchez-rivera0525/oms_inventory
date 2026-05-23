import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <span className="brand-mark">OMS</span>
          <h1>Sign up setup needed</h1>
          <p>Add Clerk environment variables in Vercel, then redeploy the OMS inventory console.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <section className="auth-card clerk-card">
        <span className="brand-mark">OMS</span>
        <h1>Create account</h1>
        <p>Warehouse staff access</p>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/awnings" />
      </section>
    </main>
  );
}
