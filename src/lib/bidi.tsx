import React from 'react';

// Phone numbers and email addresses inside Arabic text must keep reading left to right
// ("+965 97226735", not "965 97226735+"). This wraps them in an isolated LTR run; the
// surrounding text is untouched, so English pages render exactly as before.
const LTR_RUN = /(\+\d[\d ]{6,}\d|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

export function isolateLtr(text: string): React.ReactNode {
  const parts = text.split(LTR_RUN);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <bdi key={i} dir="ltr">
        {part}
      </bdi>
    ) : (
      part
    ),
  );
}
