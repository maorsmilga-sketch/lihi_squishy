import type {
  AdminRaffleState,
  PublicRaffleEntry,
  Raffle,
  RaffleEntry,
  RaffleState,
} from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const STORAGE_FILE = "meta/current-raffle.json";

type StoredRaffle = {
  raffle: Raffle;
  entries: RaffleEntry[];
};

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972") && digits.length >= 11) {
    return `0${digits.slice(3)}`;
  }
  return digits;
}

export function isRaffleEnded(raffle: Raffle, now = new Date()) {
  return now.getTime() >= new Date(raffle.ends_at).getTime();
}

export function toPublicState(
  raffle: Raffle | null,
  entries: RaffleEntry[],
): RaffleState {
  const ended = raffle ? isRaffleEnded(raffle) || Boolean(raffle.drawn_at) : false;
  return {
    raffle,
    entries: entries.map(toPublicEntry),
    entryCount: entries.length,
    isOpen: Boolean(raffle) && !ended,
    isEnded: Boolean(raffle) && ended,
  };
}

export function toAdminState(
  raffle: Raffle | null,
  entries: RaffleEntry[],
): AdminRaffleState {
  const publicState = toPublicState(raffle, entries);
  return { ...publicState, entries };
}

function toPublicEntry(entry: RaffleEntry): PublicRaffleEntry {
  return {
    id: entry.id,
    name: entry.name,
    created_at: entry.created_at,
  };
}

function isMissingTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const message = `${error.code ?? ""} ${error.message ?? ""}`;
  return (
    error.code === "42P01" ||
    /raffles|raffle_entries|schema cache|does not exist/i.test(message)
  );
}

async function loadFromStorage(
  supabase: SupabaseClient,
): Promise<StoredRaffle | null> {
  const { data, error } = await supabase.storage
    .from("media")
    .download(STORAGE_FILE);
  if (error || !data) return null;
  try {
    const parsed = JSON.parse(await data.text()) as StoredRaffle;
    if (!parsed?.raffle?.id) return null;
    return {
      raffle: parsed.raffle,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return null;
  }
}

async function saveToStorage(supabase: SupabaseClient, stored: StoredRaffle) {
  await supabase.storage.from("media").upload(
    STORAGE_FILE,
    Buffer.from(JSON.stringify(stored)),
    { upsert: true, contentType: "application/json" },
  );
}

async function loadFromTables(
  supabase: SupabaseClient,
): Promise<StoredRaffle | null | "missing"> {
  const raffleResult = await supabase
    .from("raffles")
    .select(
      "id, title, description, image_url, ends_at, winner_entry_id, winner_name, drawn_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (raffleResult.error) {
    return isMissingTable(raffleResult.error) ? "missing" : null;
  }
  if (!raffleResult.data) return null;

  const raffle = raffleResult.data as Raffle;
  const entriesResult = await supabase
    .from("raffle_entries")
    .select("id, raffle_id, name, name_normalized, phone, created_at")
    .eq("raffle_id", raffle.id)
    .order("created_at", { ascending: true });

  if (entriesResult.error) {
    return isMissingTable(entriesResult.error) ? "missing" : { raffle, entries: [] };
  }

  return { raffle, entries: (entriesResult.data ?? []) as RaffleEntry[] };
}

async function loadCurrent(supabase: SupabaseClient): Promise<StoredRaffle | null> {
  const fromTables = await loadFromTables(supabase);
  if (fromTables === "missing") {
    return loadFromStorage(supabase);
  }
  return fromTables;
}

function drawWinner(stored: StoredRaffle, now = new Date()): StoredRaffle {
  if (stored.raffle.drawn_at || stored.raffle.winner_entry_id) return stored;
  if (!isRaffleEnded(stored.raffle, now)) return stored;

  const pick =
    stored.entries.length > 0
      ? stored.entries[Math.floor(Math.random() * stored.entries.length)]
      : null;

  return {
    ...stored,
    raffle: {
      ...stored.raffle,
      winner_entry_id: pick?.id ?? null,
      winner_name: pick?.name ?? null,
      drawn_at: now.toISOString(),
    },
  };
}

async function persistDraw(supabase: SupabaseClient, stored: StoredRaffle) {
  const fromTables = await loadFromTables(supabase);
  if (fromTables === "missing") {
    await saveToStorage(supabase, stored);
    return;
  }

  await supabase
    .from("raffles")
    .update({
      winner_entry_id: stored.raffle.winner_entry_id,
      winner_name: stored.raffle.winner_name,
      drawn_at: stored.raffle.drawn_at,
    })
    .eq("id", stored.raffle.id)
    .is("winner_entry_id", null);
}

export async function loadRaffleAndDraw(
  supabase: SupabaseClient,
): Promise<StoredRaffle | null> {
  const current = await loadCurrent(supabase);
  if (!current) return null;

  const drawn = drawWinner(current);
  if (drawn.raffle.drawn_at && !current.raffle.drawn_at) {
    await persistDraw(supabase, drawn);
    return (await loadCurrent(supabase)) ?? drawn;
  }
  return drawn;
}

export async function createRaffle(
  supabase: SupabaseClient,
  input: {
    title: string;
    description: string | null;
    image_url: string;
    ends_at: string;
  },
) {
  const current = await loadRaffleAndDraw(supabase);
  if (current && !isRaffleEnded(current.raffle) && !current.raffle.drawn_at) {
    throw new Error("יש כבר הגרלה פתוחה. סגרו אותה או חכו שהזמן ייגמר.");
  }

  const raffle: Raffle = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    image_url: input.image_url,
    ends_at: input.ends_at,
    winner_entry_id: null,
    winner_name: null,
    drawn_at: null,
    created_at: new Date().toISOString(),
  };

  const fromTables = await loadFromTables(supabase);
  if (fromTables === "missing") {
    await saveToStorage(supabase, { raffle, entries: [] });
    return raffle;
  }

  const { data, error } = await supabase
    .from("raffles")
    .insert({
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      image_url: raffle.image_url,
      ends_at: raffle.ends_at,
    })
    .select(
      "id, title, description, image_url, ends_at, winner_entry_id, winner_name, drawn_at, created_at",
    )
    .single();

  if (error || !data) {
    throw new Error("לא הצלחנו לפתוח הגרלה");
  }
  return data as Raffle;
}

export async function updateRaffle(
  supabase: SupabaseClient,
  id: string,
  patch: {
    title?: string;
    description?: string | null;
    image_url?: string;
    ends_at?: string;
  },
) {
  const current = await loadCurrent(supabase);
  if (!current || current.raffle.id !== id) {
    throw new Error("ההגרלה לא נמצאה");
  }
  if (current.raffle.drawn_at) {
    throw new Error("אי אפשר לערוך הגרלה שכבר הסתיימה");
  }

  const raffle = { ...current.raffle, ...patch };
  const fromTables = await loadFromTables(supabase);
  if (fromTables === "missing") {
    await saveToStorage(supabase, { raffle, entries: current.entries });
    return raffle;
  }

  const { data, error } = await supabase
    .from("raffles")
    .update(patch)
    .eq("id", id)
    .select(
      "id, title, description, image_url, ends_at, winner_entry_id, winner_name, drawn_at, created_at",
    )
    .single();

  if (error || !data) {
    throw new Error("לא הצלחנו לעדכן את ההגרלה");
  }
  return data as Raffle;
}

export async function deleteRaffle(supabase: SupabaseClient, id: string) {
  const fromTables = await loadFromTables(supabase);
  if (fromTables === "missing") {
    const current = await loadFromStorage(supabase);
    if (!current || current.raffle.id !== id) {
      throw new Error("ההגרלה לא נמצאה");
    }
    await supabase.storage.from("media").remove([STORAGE_FILE]);
    return;
  }

  const { error } = await supabase.from("raffles").delete().eq("id", id);
  if (error) {
    throw new Error("לא הצלחנו למחוק את ההגרלה");
  }
}

export async function enterRaffle(
  supabase: SupabaseClient,
  input: { name: string; phone?: string },
) {
  const name = input.name.trim().replace(/\s+/g, " ");
  const nameNormalized = normalizeName(name);
  const phone = input.phone?.trim() ? normalizePhone(input.phone) : null;

  if (nameNormalized.length < 2) {
    throw new Error("כתבו שם מלא יותר");
  }
  if (phone && phone.length < 9) {
    throw new Error("מספר הטלפון קצר מדי");
  }

  const current = await loadRaffleAndDraw(supabase);
  if (!current) {
    throw new Error("אין הגרלה פתוחה עכשיו");
  }
  if (isRaffleEnded(current.raffle) || current.raffle.drawn_at) {
    throw new Error("ההגרלה כבר הסתיימה");
  }

  if (current.entries.some((entry) => entry.name_normalized === nameNormalized)) {
    throw new Error("השם הזה כבר נרשם להגרלה");
  }
  if (phone && current.entries.some((entry) => entry.phone === phone)) {
    throw new Error("מספר הטלפון הזה כבר נרשם להגרלה");
  }

  const entry: RaffleEntry = {
    id: crypto.randomUUID(),
    raffle_id: current.raffle.id,
    name,
    name_normalized: nameNormalized,
    phone,
    created_at: new Date().toISOString(),
  };

  const fromTables = await loadFromTables(supabase);
  if (fromTables === "missing") {
    await saveToStorage(supabase, {
      raffle: current.raffle,
      entries: [...current.entries, entry],
    });
    return entry;
  }

  const { data, error } = await supabase
    .from("raffle_entries")
    .insert({
      id: entry.id,
      raffle_id: entry.raffle_id,
      name: entry.name,
      name_normalized: entry.name_normalized,
      phone: entry.phone,
    })
    .select("id, raffle_id, name, name_normalized, phone, created_at")
    .single();

  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      throw new Error("השם הזה כבר נרשם להגרלה");
    }
    throw new Error("ההרשמה נכשלה");
  }
  return data as RaffleEntry;
}
