export interface ProcessedText {
  raw: string;
  normalized: string;
  tokens: string[];
  cleanWords: string[];
  bigrams: string[];
}

const CONTRACTIONS: Record<string, string> = {
  "can't": "cannot",
  "won't": "will not",
  "n't": " not",
  "'re": " are",
  "'s": " is",
  "'d": " would",
  "'ll": " will",
  "'ve": " have",
  "'m": " am",
};

export function preprocessText(input: string): ProcessedText {
  const raw = input.trim();
  let normalized = raw.toLowerCase();

  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    normalized = normalized.replace(new RegExp(contraction, "gi"), expansion);
  }

  // Tokenize words
  const tokens = normalized
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const cleanWords = tokens.filter(
    (w) => w.length > 1 && !["the", "is", "at", "which", "on", "a", "an", "and", "or", "in", "to", "of", "for", "with"].includes(w)
  );

  // Generate bigrams
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }

  return {
    raw,
    normalized,
    tokens,
    cleanWords,
    bigrams,
  };
}
