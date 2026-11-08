import { useEffect, useState } from "react";

const QUERY = "(prefers-color-scheme: dark)";

export function usePrefersTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof window !== "undefined" && window.matchMedia(QUERY).matches
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const listener = () => setTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return theme;
}
