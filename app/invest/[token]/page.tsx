
import { InvestorDashboard } from "@/components/investor/InvestorDashboard";

export default function InvestorPage({ params }: { params: { token: string } }) {
    return <InvestorDashboard token={params.token} />;
}
