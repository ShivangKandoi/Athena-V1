import { PageLoader } from "@/components/ui/page-loader";

export default function FinanceLoading() {
  return <PageLoader fullScreen message="Loading your financial information..." absolute={false} />;
} 