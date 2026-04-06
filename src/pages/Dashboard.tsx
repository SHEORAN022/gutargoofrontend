import {
  Users,
  Film,
  Tv,
  Clapperboard,
  Video,
  CreditCard,
  TrendingUp,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentContent } from "@/components/dashboard/RecentContent";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PendingApprovals } from "@/components/dashboard/PendingApprovals";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

const stats = [
  {
    title: "Total Users",
    value: "0",
    icon: Users,
    trend: { value: 12.5, isPositive: true },
    variant: "primary" as const,
  },
  {
    title: "Total Movies",
    value: "0",
    icon: Film,
    trend: { value: 8.2, isPositive: true },
    variant: "info" as const,
  },
  {
    title: "Web Series",
    value: "0",
    icon: Tv,
    trend: { value: 15.3, isPositive: true },
    variant: "success" as const,
  },
  {
    title: "TV Shows",
    value: "0",
    icon: Clapperboard,
    variant: "default" as const,
  },
  {
    title: "Short Movies",
    value: "0",
    icon: Video,
    trend: { value: 5.1, isPositive: false },
    variant: "warning" as const,
  },
  {
    title: "Active Subscriptions",
   value: "0",
    icon: CreditCard,
    trend: { value: 22.4, isPositive: true },
    variant: "primary" as const,
  },
  {
    title: "Monthly Revenue",
    value: "0",
    icon: TrendingUp,
    trend: { value: 18.7, isPositive: true },
    variant: "success" as const,
  },
  {
    title: "Pending Approvals",
    value: "0",
    icon: Clock,
    variant: "warning" as const,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Charts & Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Content & Approvals */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentContent />
        <PendingApprovals />
      </div>
    </div>
  );
}
