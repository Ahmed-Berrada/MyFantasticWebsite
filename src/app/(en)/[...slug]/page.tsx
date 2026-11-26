import { notFound } from "next/navigation";

/** Any path nothing else claims is a real 404, rendered inside this language's layout. */
export default function CatchAll() {
  notFound();
}
