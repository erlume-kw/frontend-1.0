// Arabic pages write numbers with Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩), decimal mark "٫" and "٪".
// This converts the digits in the Arabic message file when it is loaded, so text such as
// "14 يومًا" or "25% من القيمة" needs no special handling in the message files themselves.
// It leaves alone: anything inside { } (message syntax) and phone numbers, which stay in
// Western digits so they are easy to copy and dial.

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const PHONE_NUMBER = /\+\d[\d ]{6,}\d/g;

function convert(text: string): string {
  const protectedRanges: [number, number][] = [];
  for (const match of text.matchAll(PHONE_NUMBER)) {
    protectedRanges.push([match.index!, match.index! + match[0].length]);
  }
  let depth = 0;
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    if (ch === '}') depth = Math.max(0, depth - 1);
    const inPhone = protectedRanges.some(([start, end]) => i >= start && i < end);
    out += depth === 0 && !inPhone && ch >= '0' && ch <= '9' ? ARABIC_INDIC[Number(ch)] : ch;
  }
  return out.replace(/([٠-٩])\.([٠-٩])/g, '$1٫$2').replace(/([٠-٩])%/g, '$1٪');
}

export function localizeMessageDigits<T>(value: T): T {
  if (typeof value === 'string') return convert(value) as unknown as T;
  if (Array.isArray(value)) return value.map(localizeMessageDigits) as unknown as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, localizeMessageDigits(v)]),
    ) as unknown as T;
  }
  return value;
}
