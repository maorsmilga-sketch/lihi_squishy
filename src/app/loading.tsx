export default function Loading() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse rounded-3xl bg-squishy-yellow-soft"
        />
      ))}
    </div>
  );
}
