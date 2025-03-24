import { PageLoader } from "@/components/ui/page-loader";

export default function Loading() {
  return <PageLoader fullScreen message="Loading your experience..." absolute={false} />;
} 