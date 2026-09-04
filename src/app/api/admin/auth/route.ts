import { isValidAdminPassword, getAdminPasswordFromRequest } from "@/lib/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { password?: string }
    | null;
  const password =
    body?.password ?? getAdminPasswordFromRequest(request) ?? "";

  if (!isValidAdminPassword(password)) {
    return Response.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  return Response.json({ ok: true });
}
