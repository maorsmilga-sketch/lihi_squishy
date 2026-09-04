import { requireAdmin, unauthorized } from "@/lib/admin";
import { getServiceSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

const ALLOWED_FOLDERS = new Set(["products", "videos"]);
const MAX_FILE_SIZE = 40 * 1024 * 1024;

export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folderValue = String(formData.get("folder") ?? "products");
  const folder = ALLOWED_FOLDERS.has(folderValue) ? folderValue : "products";

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "לא נבחר קובץ" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "הקובץ גדול מדי" }, { status: 400 });
  }

  const originalName = file.name || "file";
  const extension = originalName.includes(".")
    ? originalName.split(".").pop()?.toLowerCase()
    : "";
  const safeExt = extension && /^[a-z0-9]+$/.test(extension) ? extension : "";
  const path = safeExt
    ? `${folder}/${crypto.randomUUID()}.${safeExt}`
    : `${folder}/${crypto.randomUUID()}`;

  try {
    const supabase = getServiceSupabase();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from("media").upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) {
      return Response.json({ error: "העלאת הקובץ נכשלה" }, { status: 500 });
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return Response.json({ url: data.publicUrl, path });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}
