import { feedResponse } from "@/src/lib/feed";

export const dynamic = "force-static";

export function GET() {
  return feedResponse("en");
}
