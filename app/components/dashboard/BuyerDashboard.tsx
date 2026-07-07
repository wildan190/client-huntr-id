import React from "react";
import Layout from "../Layout";
import WeatherWidget from "../WeatherWidget";
import CurrencyWidget from "../CurrencyWidget";
import { 
  PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart as RechartsLineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis
} from "recharts";
import { 
  Activity, AlertTriangle, Clock, DollarSign, TrendingDown, PieChart, LineChart, ArrowDownCircle, ClipboardList
} from "lucide-react";

const chartTooltipStyle = (accent?: string) => ({
  contentStyle: {
    backgroundColor: "var(--ui-chart-tooltip-bg)",
    border: accent ?? "1px solid var(--ui-chart-tooltip-border)",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
  itemStyle: { color: "var(--ui-chart-tooltip-text)" },
  labelStyle: { color: "var(--ui-chart-legend)" },
});

export function BuyerDashboard({ user, activeCompany }: { user: any, activeCompany: any }) {
  // Recharts Data
  const spendData = [
    { name: 'IT Equipment', value: 5600000000 },
    { name: 'HR Services', value: 3750000000 },
    { name: 'Production', value: 3150000000 },
  ];
  const COLORS = ['#fb923c', '#fbbf24', '#f87171'];

  const cycleTimeData = [
    { month: 'Jan', time: 3.2 },
    { month: 'Feb', time: 2.8 },
    { month: 'Mar', time: 2.5 },
    { month: 'Apr', time: 2.1 },
    { month: 'May', time: 1.9 },
    { month: 'Jun', time: 1.8 },
  ];

  const savingsData = [
    { month: 'Jan', savings: 150000000 },
    { month: 'Feb', savings: 320000000 },
    { month: 'Mar', savings: 480000000 },
    { month: 'Apr', savings: 750000000 },
    { month: 'May', savings: 980000000 },
    { month: 'Jun', savings: 1200000000 },
  ];

  const [currencyState, setCurrencyState] = React.useState<{ baseCurrency: string; rates: Record<string, { code: string; value: number }> }>({ baseCurrency: 'IDR', rates: {} });

  React.useEffect(() => {
    const handleCurrencyUpdate = (e: any) => {
      setCurrencyState(e.detail);
    };
    window.addEventListener('currency-update', handleCurrencyUpdate);
    return () => window.removeEventListener('currency-update', handleCurrencyUpdate);
  }, []);

  const formatCurrency = (valueIdr: number | string | null | undefined) => {
    const numeric = Number(valueIdr ?? 0);
    if (isNaN(numeric)) return 'Rp 0';
    
    const base = currencyState.baseCurrency ?? 'IDR';
    let convertedValue = numeric;
    let symbol = 'Rp';
    
    if (base !== 'IDR' && currencyState.rates['IDR']?.value) {
      convertedValue = numeric / currencyState.rates['IDR'].value;
      symbol = base === 'USD' ? '$' : 
               base === 'EUR' ? '€' : 
               base === 'SGD' ? 'S$' : 
               base === 'MYR' ? 'RM' : 
               base === 'JPY' ? '¥' : base + ' ';
    }
    
    const absVal = Math.abs(convertedValue);
    let div = 1;
    let suffix = '';
    
    if (absVal >= 1000000000) { div = 1000000000; suffix = 'B'; }
    else if (absVal >= 1000000) { div = 1000000; suffix = 'M'; }
    else if (absVal >= 1000) { div = 1000; suffix = 'k'; }
    
    return `${convertedValue < 0 ? '- ' : ''}${symbol} ${Math.abs(convertedValue / div).toFixed(1)}${suffix}`;
  };

  return (
    <Layout title="Procurement Dashboard" subtitle="Overview of your organization's spend, supplier performance, and operational efficiency.">
      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40, boxSizing: "border-box", width: "100%" }}>
        {/* Weather + Currency compact row */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, alignItems: "stretch" }}>
          <WeatherWidget embedded />
          <CurrencyWidget embedded />
        </section>
        
        {/* 1. Spend Analysis — stat cards compact, chart full width */}
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, color: "#fb923c" }}>
            <PieChart size={18} /> Analisis Pengeluaran (Spend Analysis)
          </h2>
          {/* Stat cards row — compact, small */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #f97316" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Spend</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)", marginTop: 4, lineHeight: 1 }}>{formatCurrency(12500000000)}</div>
              <div style={{ fontSize: 10, color: "#34d399", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}><TrendingDown size={10}/> 4.2% vs last month</div>
            </div>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Maverick Spend</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#ef4444", marginTop: 4, lineHeight: 1 }}>8.5%</div>
              <div style={{ fontSize: 10, color: "#ef4444", marginTop: 4 }}>Off-contract purchases</div>
            </div>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Defect Rate</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#ef4444", marginTop: 4, lineHeight: 1 }}>2.1%</div>
              <div style={{ fontSize: 10, color: "var(--ui-text-muted)", marginTop: 4 }}>Target: &lt;2.0%</div>
            </div>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Lead Time Avg</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#60a5fa", marginTop: 4, lineHeight: 1 }}>7.2 Days</div>
              <div style={{ fontSize: 10, color: "var(--ui-text-muted)", marginTop: 4 }}>PO → Goods Receipt</div>
            </div>
          </div>
          {/* Chart — full width */}
          <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16, padding: "16px 20px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pengeluaran per Departemen</h3>
            <div style={{ height: 260, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={spendData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {spendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} {...chartTooltipStyle()} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, color: "var(--ui-chart-legend)" }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 2. Operational Efficiency */}
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, color: "#60a5fa" }}>
            <Activity size={18} /> Efisiensi Operasional
          </h2>
          {/* Stat cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Active PO</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fb923c", marginTop: 4, lineHeight: 1 }}>8</div>
              <div style={{ fontSize: 10, color: "var(--ui-text-muted)", marginTop: 4 }}>In-Transit</div>
            </div>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Unprocessed PRs</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)", marginTop: 4, lineHeight: 1 }}>24</div>
              <div style={{ fontSize: 10, color: "var(--ui-text-muted)", marginTop: 4 }}>Needs review</div>
            </div>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>POs/Staff/Mo</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#f472b6", marginTop: 4, lineHeight: 1 }}>45</div>
              <div style={{ fontSize: 10, color: "var(--ui-text-muted)", marginTop: 4 }}>Average</div>
            </div>
          </div>
          {/* Line chart — full width */}
          <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16, padding: "16px 20px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Rata-rata Waktu Siklus PO (Hari)</h3>
            <div style={{ height: 260, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={cycleTimeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-chart-grid)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
                  <Tooltip {...chartTooltipStyle("1px solid rgba(59,130,246,0.35)")} />
                  <Line type="monotone" dataKey="time" name="Cycle Time (Days)" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 3. Financial & Cost Management */}
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, color: "#fbbf24" }}>
            <LineChart size={18} /> Keuangan &amp; Penghematan
          </h2>
          {/* Stat card */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #34d399" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>PPV</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#34d399", marginTop: 4, lineHeight: 1 }}>{formatCurrency(-450000000)}</div>
              <div style={{ fontSize: 10, color: "var(--ui-text-muted)", marginTop: 4 }}>Favorable variance</div>
            </div>
          </div>
          {/* Area chart — full width */}
          <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16, padding: "16px 20px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Kumulatif Penghematan Cost (YTD)</h3>
            <div style={{ height: 260, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-chart-grid)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), "Savings"]}
                    {...chartTooltipStyle("1px solid rgba(245,158,11,0.35)")}
                  />
                  <Area type="monotone" dataKey="savings" name="Cost Savings" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
