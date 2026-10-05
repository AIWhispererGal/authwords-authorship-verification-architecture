import { Suspense } from "react";
import Workspace from "@/components/workspace";

// Workspace reads the active view from the query string, so it must render inside Suspense.
export default function HomePage() {
  return <Suspense fallback={null}><Workspace/></Suspense>;
}
