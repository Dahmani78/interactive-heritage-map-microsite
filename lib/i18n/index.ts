import fr from "./fr.json";
import en from "./en.json";

export type Locale = "fr" | "en";

const dict = { fr, en };

export function getDictionary(locale: Locale) {
  return dict[locale] ?? dict.fr;
}

// t(dict, "plaque.viewDetails")
export function t(obj: any, path: string): string {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj) ?? path;
}
