const fs = require('fs');
const file = '/Users/wildanbelfiore/app.huntr.id/client-huntr-id/app/routes/home.tsx';
const content = `

function BuyerDashboard({ user, activeCompany }: { user: any, activeCompany: any }) {
  return (
    <Layout title="Procurement Dashboard" subtitle="Overview of your organization's spend, supplier performance, and operational efficiency.">
      <div className="flex flex-col gap-8 pb-10 w-full">
        
        {/* 1. Spend Analysis */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-400">
            <PieChart size={24} /> Analisis Pengeluaran (Spend Analysis)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 border-l-4 border-l-orange-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Total Pengeluaran</span>
                <DollarSign size={16} className="text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">Rp 12.5B</div>
              <div className="text-xs text-green-400 flex items-center gap-1"><TrendingDown size={12}/> 4.2% vs last month</div>
            </div>
            
            <div className="glass-panel p-5 border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Pengeluaran per Dept</span>
                <PieChart size={16} className="text-amber-400" />
              </div>
              <div className="text-sm font-bold text-white">IT: 45% (Rp 5.6B)</div>
              <div className="text-xs text-gray-500 mt-1">HR: 30%, Prod: 25%</div>
            </div>
            
            <div className="glass-panel p-5 border-l-4 border-l-yellow-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Spend by Vendor</span>
                <Building2 size={16} className="text-yellow-400" />
              </div>
              <div className="text-sm font-bold text-white">Nusantara Digital</div>
              <div className="text-xs text-gray-500 mt-1">Top Vendor: 32% of total spend</div>
            </div>

            <div className="glass-panel p-5 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Maverick Spend</span>
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">8.5%</div>
              <div className="text-xs text-red-400 flex items-center gap-1">Off-contract purchases (Needs review)</div>
            </div>
          </div>
        </section>

        {/* 2. Supplier Performance */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
            <ShieldCheck size={24} /> Kinerja Pemasok (Supplier Performance)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 bg-gradient-to-br from-green-500/5 to-transparent">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">On-Time Delivery</span>
                <Truck size={16} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">94%</div>
              <div className="text-xs text-gray-500 mt-1">Target: \u003e95%</div>
              <div className="w-full bg-gray-800 h-1.5 mt-2 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{width: '94%'}}></div></div>
            </div>

            <div className="glass-panel p-5 bg-gradient-to-br from-red-500/5 to-transparent">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Defect Rate</span>
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">2.1%</div>
              <div className="text-xs text-gray-500 mt-1">Target: \u003c2.0%</div>
              <div className="w-full bg-gray-800 h-1.5 mt-2 rounded-full overflow-hidden"><div className="bg-red-500 h-full" style={{width: '15%'}}></div></div>
            </div>

            <div className="glass-panel p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Lead Time Avg</span>
                <Clock size={16} className="text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">7.2 Days</div>
              <div className="text-xs text-gray-500 mt-1">From PO to Receipt</div>
            </div>

            <div className="glass-panel p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Fill Rate</span>
                <PackageCheck size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">98.5%</div>
              <div className="text-xs text-gray-500 mt-1">Quantity delivered vs ordered</div>
            </div>
          </div>
        </section>

        {/* 3. Operational Efficiency */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
            <Activity size={24} /> Efisiensi Operasional (Operational Efficiency)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Status PO</span>
                <ClipboardList size={16} className="text-blue-400" />
              </div>
              <div className="flex justify-between items-center text-sm font-medium mt-3">
                <span className="text-gray-400">Open:</span> <span className="text-white">12</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium mt-1">
                <span className="text-gray-400">In-Transit:</span> <span className="text-orange-400">8</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium mt-1">
                <span className="text-gray-400">Pending Approval:</span> <span className="text-yellow-400">3</span>
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Status PR</span>
                <Inbox size={16} className="text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">24</div>
              <div className="text-xs text-gray-500 mt-1">Unprocessed PRs from internal dept</div>
            </div>

            <div className="glass-panel p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">PO Cycle Time</span>
                <Timer size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">1.8 Days</div>
              <div className="text-xs text-gray-500 mt-1">Avg PR to PO processing time</div>
            </div>

            <div className="glass-panel p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">PO per Staff</span>
                <Users size={16} className="text-pink-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">45 POs/mo</div>
              <div className="text-xs text-gray-500 mt-1">Average workload per procurement staff</div>
            </div>
          </div>
        </section>

        {/* 4. Financial & Cost Management */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
            <LineChart size={24} /> Keuangan & Penghematan (Financial)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ArrowDownCircle size={32} color="#fff" />
              </div>
              <div>
                <div className="text-sm text-gray-400 font-semibold uppercase mb-1">Purchase Price Variance (PPV)</div>
                <div className="text-3xl font-bold text-emerald-400">- Rp 450M</div>
                <div className="text-xs text-gray-500 mt-1">Below budget limit. Favorable variance.</div>
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <PiggyBank size={32} color="#fff" />
              </div>
              <div>
                <div className="text-sm text-gray-400 font-semibold uppercase mb-1">Cost Savings & Avoidance</div>
                <div className="text-3xl font-bold text-yellow-400">Rp 1.2B</div>
                <div className="text-xs text-gray-500 mt-1">YTD savings from negotiations & volume discounts</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
`;
fs.appendFileSync(file, content);
console.log('Appended BuyerDashboard to home.tsx');
