import { authErrorResponse, getInventoryAuthState, noStoreHeaders } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const authState = await getInventoryAuthState();
  if (!authState.ok) return authErrorResponse(authState);

  const origin = new URL(request.url).origin;
  return Response.json(
    {
      host: "vercel",
      port: "",
      urls: [{ kind: "web", name: "Hosted app", url: `${origin}/` }],
    },
    { headers: noStoreHeaders() },
  );
}
