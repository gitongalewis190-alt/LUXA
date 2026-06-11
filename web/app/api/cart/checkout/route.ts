export const dynamic = 'force-static';
export async function POST() {
  return Response.json({ error: 'Not available in static build' }, { status: 404 });
}
