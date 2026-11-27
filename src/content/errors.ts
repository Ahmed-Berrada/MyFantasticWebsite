import type { Lang } from "./types";

/**
 * Copy for the error boundary. Kept apart from the dictionaries because error boundaries are client components,
 * and importing the full dictionary would ship all of it to the browser.
 */
export const errorCopy: Record<Lang, { code: string; title: string; body: string; retry: string; back: string }> = {
  en: {
    code: "Error",
    title: "Something on this page broke.",
    body: "The rest of the site still works. Try again, or go back to the home page.",
    retry: "Try again",
    back: "Back to the home page",
  },
  fr: {
    code: "Erreur",
    title: "Quelque chose a cassé sur cette page.",
    body: "Le reste du site fonctionne. Réessayez, ou revenez à l'accueil.",
    retry: "Réessayer",
    back: "Retour à l'accueil",
  },
};
