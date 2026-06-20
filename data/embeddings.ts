/**
 * Hand-curated 2-D "embeddings". These are illustrative, not learned: the
 * coordinates were placed by hand so that (a) words of a kind point in a
 * similar direction from the origin — giving sensible cosine similarities —
 * and (b) the gender/royalty family forms a parallelogram, so the classic
 * analogy king − man + woman ≈ queen lands on the right word.
 *
 * Real embeddings live in hundreds or thousands of dimensions; this is a
 * deliberately flattened shadow of that idea.
 */

export type WordCategory = "animal" | "food" | "country" | "person";

export type WordVec = {
  word: string;
  x: number;
  y: number;
  category: WordCategory;
};

export const CATEGORY_LABEL: Record<WordCategory, string> = {
  animal: "Animals",
  food: "Foods",
  country: "Countries",
  person: "People & royalty",
};

export const embeddings: WordVec[] = [
  // animals — low angle from origin
  { word: "cat", x: 3.45, y: 0.61, category: "animal" },
  { word: "dog", x: 3.91, y: 0.83, category: "animal" },
  { word: "wolf", x: 5.05, y: 1.26, category: "animal" },
  { word: "lion", x: 5.53, y: 0.88, category: "animal" },
  { word: "tiger", x: 5.77, y: 1.23, category: "animal" },
  { word: "mouse", x: 2.51, y: 0.67, category: "animal" },
  { word: "horse", x: 4.55, y: 0.64, category: "animal" },
  { word: "cow", x: 3.78, y: 0.94, category: "animal" },

  // people & royalty — engineered parallelogram (gender ≈ +(0.15,0.95),
  // royalty ≈ +(0.95,0.35))
  { word: "man", x: 4.6, y: 3.86, category: "person" },
  { word: "woman", x: 4.75, y: 4.81, category: "person" },
  { word: "king", x: 5.55, y: 4.21, category: "person" },
  { word: "queen", x: 5.7, y: 5.16, category: "person" },
  { word: "boy", x: 4.15, y: 3.51, category: "person" },
  { word: "girl", x: 4.3, y: 4.46, category: "person" },
  { word: "prince", x: 5.1, y: 3.86, category: "person" },
  { word: "princess", x: 5.25, y: 4.81, category: "person" },

  // countries — mid-high angle
  { word: "france", x: 4.47, y: 6.63, category: "country" },
  { word: "germany", x: 4.33, y: 7.2, category: "country" },
  { word: "japan", x: 4.23, y: 7.95, category: "country" },
  { word: "china", x: 4.6, y: 7.97, category: "country" },
  { word: "italy", x: 4.58, y: 6.31, category: "country" },
  { word: "spain", x: 4.14, y: 6.37, category: "country" },
  { word: "egypt", x: 3.77, y: 7.73, category: "country" },
  { word: "brazil", x: 5.48, y: 7.01, category: "country" },

  // foods — high angle (near the vertical axis)
  { word: "apple", x: 1.33, y: 6.26, category: "food" },
  { word: "banana", x: 1.76, y: 6.57, category: "food" },
  { word: "bread", x: 1.27, y: 7.19, category: "food" },
  { word: "cheese", x: 2.05, y: 6.69, category: "food" },
  { word: "rice", x: 0.85, y: 6.04, category: "food" },
  { word: "pizza", x: 1.71, y: 7.41, category: "food" },
  { word: "sushi", x: 2.19, y: 6.75, category: "food" },
  { word: "soup", x: 0.69, y: 6.56, category: "food" },
];

export const wordMap = new Map(embeddings.map((w) => [w.word, w]));

export const WORLD = { min: 0, max: 8.5 };

/** Nearest word to a point by Euclidean distance, optionally excluding some. */
export function nearestWord(
  x: number,
  y: number,
  exclude: string[] = [],
): WordVec {
  let best = embeddings[0];
  let bestD = Infinity;
  for (const w of embeddings) {
    if (exclude.includes(w.word)) continue;
    const d = (w.x - x) ** 2 + (w.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = w;
    }
  }
  return best;
}
