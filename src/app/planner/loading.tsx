import { PageLoader } from "@/components/ui/page-loader";

export default function PlannerLoading() {
  return <PageLoader fullScreen message="Loading your tasks and schedule..." absolute={false} />;
} 