const ONES = [
  "ZER",
  "ONE",
  "TWO",
  "THR",
  "FOR",
  "FIV",
  "SIX",
  "SEV",
  "EGT",
  "NIN",
];

export const getDigitWordPairs = (
  name: string,
): Array<{ digit: string; word: string }> => {
  const cleaned = name.trim();
  const numericOnly = cleaned.replace(/\D/g, "");
  if (numericOnly) {
    return numericOnly.split("").map((digit) => ({
      digit,
      word: ONES[Number(digit)],
    }));
  }

  const fallbackChars = cleaned
    .split("")
    .map((char) => {
      if (/[a-z]/i.test(char)) return char;
      return "";
    })
    .filter(Boolean);

  if (fallbackChars.length > 0) {
    return fallbackChars.map((char) => ({
      digit: char.toUpperCase(),
      word: char.toLowerCase(),
    }));
  }

  return [{ digit: "-", word: "-" }];
};

export const getLastTwoDigits = (name: string): number => {
  const numericOnly = name.trim().replace(/\D/g, "");
  if (numericOnly.length < 2) return Number(numericOnly) || 0;
  return Number(numericOnly.slice(-2));
};
