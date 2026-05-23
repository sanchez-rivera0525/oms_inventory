import { authErrorResponse, getInventoryAuthState, noStoreHeaders } from "../../../lib/auth";
import { readInventoryDataset } from "../../../lib/inventory-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const authState = await getInventoryAuthState();
  if (!authState.ok) return authErrorResponse(authState);

  const dataset = await readInventoryDataset();
  return Response.json(dataset, { headers: noStoreHeaders() });
}
