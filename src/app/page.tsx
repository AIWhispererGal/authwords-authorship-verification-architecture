import { Suspense } from "react";
import Workspace from "@/components/workspace";

// The workspace reads its active view from the query string, so render this page per
// request: a static shell would ship an empty document and paint only after hydration.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <Suspense fallback={null}><Workspace/></Suspense>;
}
