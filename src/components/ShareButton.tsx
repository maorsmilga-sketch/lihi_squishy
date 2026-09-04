"use client";

const SHARE_TITLE = "עולם הסקווישים של ליהי וארי";
const SHARE_TEXT = "בואו לראות את חנות הסקווישים של ליהי וארי!";

export function ShareButton() {
  async function handleShare() {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/`
        : "https://lihi-squishy.vercel.app/";
    const payload = {
      title: SHARE_TITLE,
      text: SHARE_TEXT,
      url: shareUrl,
    };

    try {
      if (typeof navigator.share === "function") {
        await navigator.share(payload);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      window.alert("הקישור הועתק!");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      try {
        await navigator.clipboard.writeText(shareUrl);
        window.alert("הקישור הועתק!");
      } catch {
        window.prompt("העתיקו את הקישור:", shareUrl);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="absolute bottom-[5.6rem] right-3 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-squishy-pink shadow-lg ring-4 ring-white active:scale-95"
      aria-label="שיתוף החנות"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="18" cy="5" r="3" fill="white" />
        <circle cx="6" cy="12" r="3" fill="white" />
        <circle cx="18" cy="19" r="3" fill="white" />
        <path
          d="M8.7 13.5 15.3 17.2M15.3 6.8 8.7 10.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
