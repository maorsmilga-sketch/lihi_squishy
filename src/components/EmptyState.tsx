export function EmptyState({
  title,
  text,
  emoji = "🫧",
}: {
  title: string;
  text: string;
  emoji?: string;
}) {
  return (
    <div className="pop-in mx-auto mt-8 max-w-xs rounded-3xl bg-gradient-to-b from-squishy-yellow-soft to-squishy-pink-soft px-6 py-10 text-center shadow-sm">
      <div className="mb-3 text-5xl" aria-hidden>
        {emoji}
      </div>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">{text}</p>
    </div>
  );
}
