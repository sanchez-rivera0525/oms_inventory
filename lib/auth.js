export function isClerkConfigured() {
  return Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function allowedEmailSet() {
  return new Set(
    (process.env.OMS_ALLOWED_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function getInventoryAuthState() {
  if (!isClerkConfigured()) {
    if (isHostedRuntime()) {
      return {
        ok: false,
        status: 503,
        error: "Clerk is not configured. Add Clerk environment variables before opening OMS_inventory online.",
      };
    }
    return {
      ok: true,
      localDev: true,
      userId: "local-dev",
      email: "local-dev@localhost",
    };
  }

  try {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) {
      return { ok: false, status: 401, error: "Sign in required." };
    }

    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.find((item) => item.id === user?.primaryEmailAddressId)?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "";

    const allowed = allowedEmailSet();
    if (!allowed.size && isHostedRuntime()) {
      return {
        ok: false,
        status: 403,
        error: "OMS_ALLOWED_EMAILS is not configured. Add approved user emails before using the hosted console.",
      };
    }
    if (allowed.size && !allowed.has(email.toLowerCase())) {
      return {
        ok: false,
        status: 403,
        error: `${email || "This account"} is not approved for OMS inventory access.`,
      };
    }

    return { ok: true, userId, email };
  } catch (error) {
    return {
      ok: false,
      status: 503,
      error: `Authentication is unavailable: ${error.message}`,
    };
  }
}

export function authErrorResponse(authState) {
  return Response.json(
    {
      ok: false,
      error: authState.error || "Unauthorized",
    },
    {
      status: authState.status || 401,
      headers: noStoreHeaders(),
    },
  );
}

export function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, max-age=0",
  };
}

function isHostedRuntime() {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}
