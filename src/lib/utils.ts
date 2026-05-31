export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string) {
  const date = getKoreanDateParts(value);
  return `${date.year}. ${date.month}. ${date.day}.`;
}

export function formatDateKey(value: string) {
  const date = getKoreanDateParts(value);
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function formatDateLabel(value: string) {
  const date = getKoreanDateParts(value);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.year}년 ${date.month}월 ${date.day}일 (${weekdays[date.weekday]})`;
}

function getKoreanDateParts(value: string) {
  const date = new Date(value);
  const koreanTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);

  return {
    year: koreanTime.getUTCFullYear(),
    month: koreanTime.getUTCMonth() + 1,
    day: koreanTime.getUTCDate(),
    weekday: koreanTime.getUTCDay()
  };
}

export function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
