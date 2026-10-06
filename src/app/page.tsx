import Workspace from "@/components/workspace";

// The workspace reads its active view from the query string. Rendering per request keeps
// the server HTML in sync with the selected view and lets useSearchParams work without a
// Suspense boundary, so in-app navigation never unmounts the workspace.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <Workspace/>;
}
