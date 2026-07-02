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

  const [currencyState, setCurrencyState] = React.useState({ base: 'IDR', rates: {} as Record<string, { code: string; value: number }> });

  React.useEffect(() => {
    const handleCurrencyUpdate = (e: any) => {
      setCurrencyState(e.detail);
    };
    window.addEventListener('currency-update', handleCurrencyUpdate);
    return () => window.removeEventListener('currency-update', handleCurrencyUpdate);
  }, []);

  const formatCurrency = (valueIdr: number | string | null | undefined) => {
    const numeric = Number(valueIdr ?? 0);
    
    let convertedValue = numeric;
    let symbol = 'Rp';
    
    if (currencyState.base !== 'IDR' && currencyState.rates['IDR']?.value) {
      convertedValue = numeric / currencyState.rates['IDR'].value;
      symbol = currencyState.base === 'USD' ? '$' : 
               currencyState.base === 'EUR' ? '€' : 
               currencyState.base === 'SGD' ? 'S$' : 
               currencyState.base === 'MYR' ? 'RM' : 
               currencyState.base === 'JPY' ? '¥' : currencyState.base + ' ';
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
      <div className="flex flex-col gap-8 pb-10 w-full" style={{ paddingBottom: 40, boxSizing: "border-box" }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "stretch" }}>
          <WeatherWidget embedded />
          <CurrencyWidget embedded />
        </section>
        
        {/* 1. Spend Analysis */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-400">
            <PieChart size={24} /> Analisis Pengeluaran (Spend Analysis)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            
            <div className="glass-panel p-5 md:col-span-1 border-l-4 border-l-orange-500" style={{ background: "var(--ui-bg-card)", borderTop: "1px solid var(--ui-border)", borderRight: "1px solid var(--ui-border)", borderBottom: "1px solid var(--ui-border)", borderRadius: "0 16px 16px 0" }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Total Pengeluaran</span>
                <DollarSign size={16} className="text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{formatCurrency(12500000000)}</div>
              <div className="text-xs text-green-400 flex items-center gap-1 mb-6"><TrendingDown size={12}/> 4.2% vs last month</div>
              
              <div className="flex justify-between items-start mb-2 pt-4 border-t border-white/10">
                <span className="text-xs text-gray-400 font-semibold uppercase">Maverick Spend</span>
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div className="text-xl font-bold text-white">8.5%</div>
              <div className="text-xs text-red-400 flex items-center gap-1">Off-contract purchases</div>
            </div>

            <div className="glass-panel p-5 md:col-span-1 lg:col-span-1" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Pengeluaran per Departemen</h3>
              <div style={{ height: 250, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={spendData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
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

            <div className="glass-panel p-5 bg-gradient-to-br from-red-500/5 to-transparent h-full flex flex-col justify-center" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Average Defect Rate</span>
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">2.1%</div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt;2.0%</div>
              <div className="w-full bg-gray-800 h-1.5 mt-4 rounded-full overflow-hidden"><div className="bg-red-500 h-full" style={{width: '15%'}}></div></div>
            </div>

            <div className="glass-panel p-5 h-full flex flex-col justify-center" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Lead Time Avg</span>
                <Clock size={16} className="text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">7.2 Days</div>
              <div className="text-xs text-gray-500 mt-1">From PO Creation to Goods Receipt</div>
            </div>
          </div>
        </section>

        {/* 3. Operational Efficiency */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
            <Activity size={24} /> Efisiensi Operasional (Operational Efficiency)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            
            <div className="glass-panel p-5 md:col-span-1 lg:col-span-1" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Rata-rata Waktu Siklus PO (Hari)</h3>
              <div style={{ height: 250, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={cycleTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-chart-grid)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
                    <Tooltip {...chartTooltipStyle("1px solid rgba(59,130,246,0.35)")} />
                    <Line type="monotone" dataKey="time" name="Cycle Time (Days)" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-5 h-full flex flex-col justify-center" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">PO vs PR Workload</span>
                <ClipboardList size={16} className="text-blue-400" />
              </div>
              <div className="flex justify-between items-center text-sm font-medium mt-3">
                <span className="text-gray-400">Active PO (In-Transit):</span> <span className="text-orange-400">8</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium mt-2">
                <span className="text-gray-400">Unprocessed PRs:</span> <span className="text-white">24</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium mt-2 pt-2 border-t border-white/10">
                <span className="text-gray-400">Average POs/Staff/Mo:</span> <span className="text-pink-400 font-bold">45</span>
              </div>
            </div>

          </div>
        </section>

        {/* 4. Financial & Cost Management */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
            <LineChart size={24} /> Keuangan & Penghematan (Financial)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            
            <div className="glass-panel p-5 md:col-span-1 lg:col-span-1" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Kumulatif Penghematan Cost (YTD)</h3>
              <div style={{ height: 250, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={savingsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

            <div className="glass-panel p-6 flex flex-col justify-center gap-2 h-full" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20 }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
                <ArrowDownCircle size={24} color="#fff" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase mb-1">Purchase Price Variance (PPV)</div>
                <div className="text-3xl font-bold text-emerald-400">{formatCurrency(-450000000)}</div>
                <div className="text-xs text-gray-500 mt-2 leading-relaxed">Below budget limit. Favorable variance achieved through bulk volume negotiation.</div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
}
