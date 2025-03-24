import { PageLoader } from "@/components/ui/page-loader";

export default function HealthLoading() {
  return <PageLoader fullScreen message="Loading your health data..." absolute={false} />;
} 