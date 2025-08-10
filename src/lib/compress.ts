import natural from "natural";

const sentenceTokenizer = new natural.SentenceTokenizer([]);
const wordTokenizer = new natural.WordTokenizer();
const stem = natural.PorterStemmer.stem;

//normalize string for tokenization
const normalize = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

//create tokens
const tokenize = (t: string) => {
  const tokens = wordTokenizer.tokenize(normalize(t));
  return tokens.filter((x) => !natural.stopwords.includes(x)).map(stem);
};

//compare sentence if near duplicates
//actual algorithm came from ChatGPT and the natural npm package
const isNearDup = (a: string, b: string, n = 3, thr = 0.6) => {
  const grams = (arr: Array<string>) =>
    natural.NGrams.ngrams(arr, n).map((g) => g.join(" "));
  const A = new Set(grams(tokenize(a)));
  const B = new Set(grams(tokenize(b)));
  if (!A.size && !B.size) return false;
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return inter / union >= thr;
};

// Compress one page by keeping top K sentences by TF-IDF
// actual algorithm came from ChatGPT and the natural npm package
export function compressPage(pageText: string, perPageLimit = 7) {
  const sents = sentenceTokenizer
    .tokenize(pageText)
    .map((s) => s.trim())
    .filter(Boolean);

  // de-dup within page
  const uniq: Array<string> = [];
  for (const s of sents) if (!uniq.some((u) => isNearDup(u, s))) uniq.push(s);

  const tfidf = new natural.TfIdf();
  uniq.forEach((s) => tfidf.addDocument(normalize(s)));

  const scored = uniq.map((s, i) => {
    let score = 0;
    tfidf
      .listTerms(i)
      .slice(0, 8)
      .forEach((t) => (score += t.tfidf));
    if (/\d/.test(s)) score *= 1.1;
    return { s, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, perPageLimit)
    .map((x) => x.s);
}

// Build a global compact context under a rough token budget
// actual algorithm came from ChatGPT and the natural npm package
export function buildCompactContext(
  pages: Array<string>,
  approxTokenBudget = 900
) {
  const approxTokens = (t: string) => Math.ceil(t.length / 4);

  // compress each page a bit, then merge and de-dup across pages
  const perPageSnippets = pages.flatMap((p) => compressPage(p, 4));

  const merged: Array<string> = [];
  for (const s of perPageSnippets) {
    if (!merged.some((m) => isNearDup(m, s))) merged.push(s);
  }

  const compact = [];
  let total = 0;
  for (const s of merged) {
    const t = approxTokens(s);
    if (total + t > approxTokenBudget) break;
    compact.push(s);
    total += t;
  }

  return compact.join(" ");
}
