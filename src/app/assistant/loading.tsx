import { PageLoader } from "@/components/ui/page-loader";

export default function AssistantLoading() {
  return <PageLoader fullScreen message="Preparing your AI assistant..." absolute={false} />;
} 