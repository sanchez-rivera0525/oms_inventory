import { authErrorResponse, getInventoryAuthState, noStoreHeaders } from "../../../lib/auth";
import { saveInventoryDataset } from "../../../lib/inventory-store";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const authState = await getInventoryAuthState();
  if (!authState.ok) return authErrorResponse(authState);

  try {
    const body = await request.json();
    const dataset = await saveInventoryDataset(body.dataset);
    return Response.json(
      {
        ok: true,
        saved_at: dataset.metadata.generated_at,
        dataset,
        import_summary: body.import_summary || null,
      },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 400, headers: noStoreHeaders() });
  }
}
