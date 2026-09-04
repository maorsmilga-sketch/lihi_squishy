const ADMIN_PASSWORDS = new Set(["020918", "240421"]);

export function isValidAdminPassword(password: string | null | undefined) {
  if (!password) return false;
  return ADMIN_PASSWORDS.has(password.trim());
}

export function getAdminPasswordFromRequest(request: Request) {
  return request.headers.get("x-admin-password");
}

export function unauthorized() {
  return Response.json({ error: "אין הרשאה" }, { status: 401 });
}

export function requireAdmin(request: Request) {
  const password = getAdminPasswordFromRequest(request);
  if (!isValidAdminPassword(password)) {
    return null;
  }
  return password;
}
