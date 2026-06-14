import fs from 'fs';

const file = '/Users/wildanbelfiore/app.huntr.id/client-huntr-id/app/routes/home.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Recharts imports
content = content.replace('import { getAssetUrl } from "../lib/assets";', 
`import { getAssetUrl } from "../lib/assets";
import { 
  PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  LineChart as RechartsLineChart, Line, AreaChart, Area
} from "recharts";`);

// 2. Replace the Loader2 with Skeleton Loader
content = content.replace(
`  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={32} color="#f59e0b" />
      </div>
    );
  }`,
`  if (loading) {
    return <PageSkeleton />;
  }`);

// 3. Add PageSkeleton component
const skeletonCode = `
function PageSkeleton() {
  return (
    <div style={{ padding: "40px", width: "100%", maxWidth: 1400, margin: "0 auto", height: "100vh", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header Skeleton */}
        <div>
          <div style={{ width: "200px", height: "32px", background: "var(--ui-bg-card)", borderRadius: "8px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          <div style={{ width: "400px", height: "16px", background: "var(--ui-bg-card)", borderRadius: "4px", marginTop: "12px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "100ms" }} />
        </div>
        
        {/* Metric Cards Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "16px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: "120px", background: "var(--ui-bg-card)", borderRadius: "16px", border: "1px solid var(--ui-border)", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: \`\${i * 100}ms\` }} />
          ))}
        </div>

        {/* Large Chart Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
          <div style={{ height: "300px", background: "var(--ui-bg-card)", borderRadius: "16px", border: "1px solid var(--ui-border)", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          <div style={{ height: "300px", background: "var(--ui-bg-card)", borderRadius: "16px", border: "1px solid var(--ui-border)", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "200ms" }} />
        </div>
      </div>
    </div>
  );
}
`;

// Insert the skeletonCode before function BuyerDashboard
content = content.replace('function BuyerDashboard', skeletonCode + '\nfunction BuyerDashboard');

// 4. Update BuyerDashboard with actual Recharts!
const buyerDashboardRegex = /function BuyerDashboard[\s\S]+?<\/Layout>\s*\n\}/;
const newBuyerDashboardCode = `
function BuyerDashboard({ user, activeCompany }: { user: any, activeCompany: any }) {
  // Recharts Data
  const spendData = [
    { name: 'IT Equipment', value: 5600000000 },
    { name: 'HR Services', value: 3750000000 },
    { name: 'Production', value: 3150000000 },
  ];
  const COLORS = ['#fb923c', '#fbbf24', '#f87171'];

  const performanceData = [
    { month: 'Jan', otd: 92, fillRate: 95 },
    { month: 'Feb', otd: 94, fillRate: 96 },
    { month: 'Mar', otd: 91, fillRate: 94 },
    { month: 'Apr', otd: 95, fillRate: 98 },
    { month: 'May', otd: 96, fillRate: 99 },
    { month: 'Jun', otd: 94, fillRate: 98.5 },
  ];

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

  const formatRupiah = (value) => \`Rp \${(value / 1000000000).toFixed(1)}B\`;

  return (
    <div className="flex flex-col gap-8 pb-10 w-full" style={{ padding: "0 clamp(16px, 4vw, 32px)", maxWidth: 1400, margin: "0 auto" }}>
      
      {/* 1. Spend Analysis */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-400">
          <PieChart size={24} /> Analisis Pengeluaran (Spend Analysis)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <div className="glass-panel p-5 lg:col-span-1 border-l-4 border-l-orange-500" style={{ background: "var(--ui-bg-card)", borderTop: "1px solid var(--ui-border)", borderRight: "1px solid var(--ui-border)", borderBottom: "1px solid var(--ui-border)", borderRadius: "0 16px 16px 0" }}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-400 font-semibold uppercase">Total Pengeluaran</span>
              <DollarSign size={16} className="text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">Rp 12.5B</div>
            <div className="text-xs text-green-400 flex items-center gap-1 mb-6"><TrendingDown size={12}/> 4.2% vs last month</div>
            
            <div className="flex justify-between items-start mb-2 pt-4 border-t border-white/10">
              <span className="text-xs text-gray-400 font-semibold uppercase">Maverick Spend</span>
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <div className="text-xl font-bold text-white">8.5%</div>
            <div className="text-xs text-red-400 flex items-center gap-1">Off-contract purchases</div>
          </div>

          <div className="glass-panel p-5 lg:col-span-2" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Pengeluaran per Departemen</h3>
            <div style={{ height: 250, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={spendData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {spendData.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatRupiah(value), "Total Spend"]}
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Supplier Performance */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
          <ShieldCheck size={24} /> Kinerja Pemasok (Supplier Performance)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <div className="glass-panel p-5 lg:col-span-2" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Delivery vs Fill Rate (6 Bulan)</h3>
            <div style={{ height: 250, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="otd" name="On-Time Delivery (%)" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fillRate" name="Fill Rate (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-1">
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
        </div>
      </section>

      {/* 3. Operational Efficiency */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
          <Activity size={24} /> Efisiensi Operasional (Operational Efficiency)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <div className="glass-panel p-5 lg:col-span-2" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Rata-rata Waktu Siklus PO (Hari)</h3>
            <div style={{ height: 250, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={cycleTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Line type="monotone" dataKey="time" name="Cycle Time (Days)" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-1">
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

        </div>
      </section>

      {/* 4. Financial & Cost Management */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
          <LineChart size={24} /> Keuangan & Penghematan (Financial)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <div className="glass-panel p-5 lg:col-span-2" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatRupiah} />
                  <Tooltip 
                    formatter={(value) => [formatRupiah(value), "Savings"]}
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="savings" name="Cost Savings" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="glass-panel p-6 flex flex-col justify-center gap-2 h-full" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20 }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
                <ArrowDownCircle size={24} color="#fff" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase mb-1">Purchase Price Variance (PPV)</div>
                <div className="text-3xl font-bold text-emerald-400">- Rp 450M</div>
                <div className="text-xs text-gray-500 mt-2 leading-relaxed">Below budget limit. Favorable variance achieved through bulk volume negotiation.</div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
`;

content = content.replace(buyerDashboardRegex, newBuyerDashboardCode);

fs.writeFileSync(file, content);
console.log('Successfully updated home.tsx with Recharts and Skeleton Loader.');
