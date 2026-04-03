import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000, subscriptions: 240 },
  { month: "Feb", revenue: 3000, subscriptions: 198 },
  { month: "Mar", revenue: 5000, subscriptions: 320 },
  { month: "Apr", revenue: 4500, subscriptions: 280 },
  { month: "May", revenue: 6000, subscriptions: 390 },
  { month: "Jun", revenue: 5500, subscriptions: 350 },
  { month: "Jul", revenue: 7000, subscriptions: 450 },
];

export function RevenueChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">
            Revenue Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            Monthly revenue and subscriptions
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Subscriptions</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(12, 76%, 61%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(12, 76%, 61%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(262, 83%, 58%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(262, 83%, 58%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(217, 33%, 17%)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="hsl(215, 20%, 65%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(215, 20%, 65%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 9%)",
                border: "1px solid hsl(217, 33%, 17%)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(210, 40%, 98%)" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(12, 76%, 61%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="subscriptions"
              stroke="hsl(262, 83%, 58%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSubs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
