import { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, 
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Filter, ChevronDown, CheckCircle, AlertTriangle, XCircle, X, Info
} from 'lucide-react';

const baseBarChartData = [
  { name: 'Sugarcane', yield: 400, need: 200, ethanol: 150 },
  { name: 'Maize', yield: 300, need: 250, ethanol: 40 },
  { name: 'Rice', yield: 200, need: 180, ethanol: 10 },
];

const baseAreaChartData = [
  { year: '2020', production: 210, needs: 160, forecast: 0 },
  { year: '2021', production: 220, needs: 165, forecast: 0 },
  { year: '2022', production: 215, needs: 170, forecast: 0 },
  { year: '2023', production: 235, needs: 175, forecast: 0 },
  { year: '2024', production: 245, needs: 180, forecast: 0 },
  { year: '2025', production: 260, needs: 185, forecast: 260 },
  { year: '2026', production: 275, needs: 190, forecast: 275 },
];

const baseHorizBarData = [
  { source: 'Molasses (B Heavy)', volume: 6.2 },
  { source: 'Sugarcane Juice', volume: 4.8 },
  { source: 'Maize/Grains', volume: 1.4 },
];

const regionalData = [
  { state: 'Maharashtra', crop: 'Sugarcane', yield: '105M', need: '45M', status: 'Surplus' },
  { state: 'Uttar Pradesh', crop: 'Sugarcane', yield: '120M', need: '60M', status: 'Surplus' },
  { state: 'Karnataka', crop: 'Maize', yield: '25M', need: '30M', status: 'Deficit' },
  { state: 'Punjab', crop: 'Rice', yield: '45M', need: '20M', status: 'Surplus' },
  { state: 'Tamil Nadu', crop: 'Rice', yield: '35M', need: '30M', status: 'Surplus' },
];

const targetGoals = [
  { title: 'Sugarcane Allocation', current: '150', target: '160', status: 'On Track', icon: CheckCircle, color: 'text-green-500' },
  { title: 'Maize Processing', current: '40', target: '65', status: 'At Risk', icon: AlertTriangle, color: 'text-yellow-500' },
  { title: 'New Molasses Distilleries', current: '12', target: '25', status: 'Off Track', icon: XCircle, color: 'text-red-500' },
];

const YEAR_OPTIONS = ['2022', '2023', '2024', '2025 Forecast'];

const yearContextData: Record<string, string> = {
  '2022': '2022 was characterized by average rainfall and steady initial steps toward the E20 blending roadmap.',
  '2023': '2023 saw a slight dip in sugarcane yields due to erratic monsoons, forcing a temporary shift toward maize-based distillation.',
  '2024': '2024 marked a strong agricultural recovery with normalized weather, allowing aggressive expansion of total ethanol allocations.',
  '2025 Forecast': '2025 projections assume robust total agricultural output and accelerated molasses distillation to confidently hit the E20 target.'
};

const SEASON_OPTIONS = ['Annual Total', 'Kharif', 'Rabi', 'Zaid'];
const REGION_OPTIONS = ['All India', 'Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Punjab', 'Tamil Nadu'];
const CROP_OPTIONS = ['Sugarcane', 'Maize', 'Rice', 'Sorghum', 'Broken Rice'];

export default function Dashboard() {
  const [season, setSeason] = useState('Current Season');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isNextSeason = season === 'Next Season';

  const defaultFilters = {
    year: '2025 Forecast',
    season: 'Annual Total',
    region: 'All India',
    crops: ['Sugarcane', 'Maize', 'Rice', 'Sorghum', 'Broken Rice'],
    blendingTarget: 20
  };

  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);

  // ── API State ──────────────────────────────────────────────────
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [liveYields, setLiveYields] = useState<Array<{cropName: string; year: number; yieldAmount: number; region: string}>>([]);
  const [liveConsumption, setLiveConsumption] = useState<Array<{cropName: string; year: number; consumptionAmount: number; region: string}>>([]);
  const [liveEthanol, setLiveEthanol] = useState<Array<{year: number; targetBlendingPercentage: number; achievedBlendingPercentage: number}>>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [yieldsRes, consumptionRes, ethanolRes] = await Promise.all([
          fetch('/api/yields'),
          fetch('/api/consumption'),
          fetch('/api/ethanol-targets'),
        ]);
        if (!yieldsRes.ok || !consumptionRes.ok || !ethanolRes.ok) throw new Error('API error');
        const [yields, consumption, ethanol] = await Promise.all([
          yieldsRes.json(),
          consumptionRes.json(),
          ethanolRes.json(),
        ]);
        setLiveYields(yields);
        setLiveConsumption(consumption);
        setLiveEthanol(ethanol);
        setApiStatus('connected');
      } catch {
        setApiStatus('error');
      }
    };
    fetchAll();
  }, []);

  // Derive Data based on filters
  const targetMultiplier = appliedFilters.blendingTarget / 20.0;
  const cropFilterMultiplier = appliedFilters.crops.length / CROP_OPTIONS.length;

  const yearMux: Record<string, number> = { '2022': 0.85, '2023': 0.92, '2024': 0.97, '2025 Forecast': 1.05 };
  const regionMux: Record<string, number> = { 'All India': 1.0, 'Maharashtra': 0.35, 'Uttar Pradesh': 0.40, 'Karnataka': 0.15, 'Punjab': 0.20, 'Tamil Nadu': 0.18 };
  
  // Forecast mode multiplies everything by 1.15 to simulate projected growth
  const seasonMux = isNextSeason ? 1.15 : 1.0;
  const globalMux = (yearMux[appliedFilters.year] || 1.0) * (regionMux[appliedFilters.region] || 1.0) * cropFilterMultiplier * seasonMux;

  const currentKPIs = useMemo(() => [
    { title: isNextSeason ? "Projected Production" : "Total Estimated Production", value: `${(245.5 * globalMux).toFixed(1)}M Tons`, trend: isNextSeason ? "+15.0% (Simulated)" : "+4.2%", isUp: true },
    { title: isNextSeason ? "Forecasted Consumption" : "Domestic Consumption Needs", value: `${(180.2 * globalMux).toFixed(1)}M Tons`, trend: isNextSeason ? "+12.5% (Simulated)" : "+1.5%", isUp: true },
    { title: isNextSeason ? "Simulated Net Surplus" : "Predicted Net Surplus", value: `${(65.3 * globalMux).toFixed(1)}M Tons`, trend: "-2.1%", isUp: false },
    { title: "Potential Ethanol Output", value: `${(12.4 * targetMultiplier * globalMux).toFixed(1)}B Liters`, trend: `+${(8.4 * targetMultiplier * seasonMux).toFixed(1)}%`, isUp: true },
    { title: "Ethanol Blending Feasibility", value: `${(18.5 * targetMultiplier * seasonMux).toFixed(1)}%`, trend: `Target: ${appliedFilters.blendingTarget}%`, isUp: targetMultiplier * seasonMux >= 1, isProgress: true, progress: Math.min(100, (18.5 / appliedFilters.blendingTarget) * seasonMux * 100) }
  ], [targetMultiplier, globalMux, appliedFilters.blendingTarget, isNextSeason, seasonMux]);

  const barChartData = useMemo(() => baseBarChartData.map(d => ({
    ...d, 
    yield: d.yield * globalMux,
    need: d.need * globalMux,
    ethanol: d.ethanol * targetMultiplier * globalMux
  })).filter(d => appliedFilters.crops.includes(d.name)), [targetMultiplier, globalMux, appliedFilters.crops]);

  const horizBarData = useMemo(() => baseHorizBarData.map(d => ({
    ...d,
    volume: Number((d.volume * targetMultiplier * globalMux).toFixed(1))
  })), [targetMultiplier, globalMux]);

  // ── Area chart: merge live API data with static structure ──────
  const areaChartData = useMemo(() => {
    if (liveYields.length > 0 && liveConsumption.length > 0) {
      // Build per-year totals from live data, filtered by selected region
      const regionFilter = appliedFilters.region === 'All India' ? null : appliedFilters.region;
      const years = [...new Set(liveYields.map(y => y.year))].sort();
      return years.map(yr => {
        const prod = liveYields
          .filter(y => y.year === yr && (!regionFilter || y.region === regionFilter) && appliedFilters.crops.includes(y.cropName))
          .reduce((s, y) => s + y.yieldAmount, 0);
        const needs = liveConsumption
          .filter(c => c.year === yr && (!regionFilter || c.region === regionFilter) && appliedFilters.crops.includes(c.cropName))
          .reduce((s, c) => s + c.consumptionAmount, 0);
        const isForecast = yr >= 2025;
        return {
          year: String(yr),
          production: Number((prod * (regionMux[appliedFilters.region] || 1.0) * seasonMux).toFixed(1)),
          needs: Number((needs * (regionMux[appliedFilters.region] || 1.0) * seasonMux).toFixed(1)),
          forecast: isForecast ? Number((prod * 1.05 * seasonMux).toFixed(1)) : 0,
        };
      });
    }
    // fallback to static data while loading
    return baseAreaChartData.map(d => ({
      ...d,
      production: d.production * (regionMux[appliedFilters.region] || 1.0),
      needs: d.needs * (regionMux[appliedFilters.region] || 1.0),
      forecast: d.forecast * (regionMux[appliedFilters.region] || 1.0),
    }));
  }, [liveYields, liveConsumption, appliedFilters.region, appliedFilters.crops, regionMux, seasonMux]);

  const toggleDraftCrop = (crop: string) => {
    setDraftFilters(prev => {
      const isSelected = prev.crops.includes(crop);
      return {
        ...prev,
        crops: isSelected ? prev.crops.filter(c => c !== crop) : [...prev.crops, crop]
      };
    });
  };

  const clearFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setIsFilterOpen(false);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  return (
    <div className="relative min-h-screen">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* 1. Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Agricultural & Ethanol Surplus Prediction</h1>
            <p className="text-gray-500 mt-1">Holistic view of crop yields mapped to ethanol blending targets.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-2">
               <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
                 E{appliedFilters.blendingTarget} Target Active
               </span>
               <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                 {appliedFilters.region}
               </span>
               <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                 apiStatus === 'connected' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                 apiStatus === 'error'     ? 'bg-red-100 text-red-800 border-red-200' :
                                            'bg-gray-100 text-gray-500 border-gray-200'
               }`}>
                 <span className={`w-2 h-2 rounded-full ${
                   apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                   apiStatus === 'error'     ? 'bg-red-500' : 'bg-gray-400 animate-pulse'
                 }`} />
                 {apiStatus === 'loading' ? 'Connecting...' : apiStatus === 'connected' ? `Live · ${liveYields.length} records` : 'Backend Offline'}
               </span>
            </div>
            
            <button onClick={() => setSeason(isNextSeason ? 'Current Season' : 'Next Season')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border shadow-sm transition-colors ${isNextSeason ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
              {isNextSeason ? 'Forecast Mode Active' : 'Current Season'} <ChevronDown className={`w-4 h-4 ${isNextSeason ? 'text-white/80' : 'text-gray-400'}`} />
            </button>
            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors">
              <Filter className="w-4 h-4" /> + Filter
            </button>
          </div>
        </div>



        {/* Predictive AI Recommendations (Only visible in Next Season) */}
        {isNextSeason && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 shadow-sm transition-all duration-500">
            <h3 className="flex items-center gap-2 font-bold text-purple-900 mb-3">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
              Predictive AI Action Recommendations for {appliedFilters.year}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 p-4 rounded-xl border border-purple-50">
                <p className="text-sm text-purple-900 font-bold">Reallocate 15% Maize Capacity</p>
                <p className="text-xs text-purple-700 mt-1 leading-relaxed">Simulated deficit in sugarcane yields suggests shifting maize processing capacity in <span className="font-bold">{appliedFilters.region !== 'All India' ? appliedFilters.region : 'Karnataka and Maharashtra'}</span> to securely hit the E{appliedFilters.blendingTarget} mandate.</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl border border-purple-50">
                <p className="text-sm text-purple-900 font-bold">Accelerate Distilleries</p>
                <p className="text-xs text-purple-700 mt-1 leading-relaxed">To optimize output across projected agricultural timelines, 4 new molasses distillation units must be operationalized before Q3.</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Top KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {currentKPIs.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between transition-all duration-300">
              <h3 className="text-sm font-medium text-gray-500 leading-tight">{kpi.title}</h3>
              <div className="mt-3">
                <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                {kpi.isProgress ? (
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between text-gray-500 mb-1">
                      <span>{kpi.progress.toFixed(1)}% achieved</span>
                      <span>{kpi.trend}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${kpi.progress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-center mt-1 text-sm font-medium ${kpi.isUp ? 'text-green-600' : 'text-red-500'}`}>
                    {kpi.isUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {kpi.trend} vs last year
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 3. Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 lg:col-span-2">
            <h3 className="font-semibold text-gray-800 mb-4">5-Year Production vs Consumption Timeline</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNeeds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                  <Area type="monotone" dataKey="production" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorProduction)" name="Total Production" />
                  <Area type="monotone" dataKey="needs" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#colorNeeds)" name="Domestic Needs" />
                  <Area type="monotone" dataKey="forecast" stroke="#10b981" strokeDasharray="5 5" fill="transparent" name="Forecast (Projected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Ethanol Supply Sources</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={horizBarData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="source" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Bar dataKey="volume" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={24} name="Billion Liters" animationDuration={500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 lg:col-span-1 flex flex-col">
             <h3 className="font-semibold text-gray-800 mb-4">Crop Distribution</h3>
             {barChartData.length > 0 ? (
               <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="yield" fill="#818cf8" radius={[4, 4, 0, 0]} name="Total Yield" />
                    <Bar dataKey="need" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Domestic Need" />
                    <Bar dataKey="ethanol" fill="#34d399" radius={[4, 4, 0, 0]} name="Ethanol Alloc." animationDuration={500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
             ) : (
               <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No crop selected in filters.</div>
             )}
          </div>

          {/* 4. Data Table & Target Tracking */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex-1 w-full overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-semibold text-gray-800">Regional Forecast Overview</h3>
                 <span className="text-xs text-gray-400">Filtering: {appliedFilters.region}</span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-sm font-medium text-gray-500">
                      <th className="pb-3 px-2">State</th>
                      <th className="pb-3 px-2">Major Crop</th>
                      <th className="pb-3 px-2">Forecasted Yield</th>
                      <th className="pb-3 px-2">Domestic Req.</th>
                      <th className="pb-3 px-2">Net Status</th>
                      <th className="pb-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {regionalData
                      .filter(r => appliedFilters.region === 'All India' || r.state === appliedFilters.region)
                      .map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-2 font-medium text-gray-800">{row.state}</td>
                        <td className="py-3 px-2 text-gray-600">{row.crop}</td>
                        <td className="py-3 px-2 text-gray-600">{row.yield}</td>
                        <td className="py-3 px-2 text-gray-600">{row.need}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            row.status === 'Surplus' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                            {row.status === 'Surplus' ? 'Export' : 'Import'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {targetGoals.map((goal, idx) => {
                const isDistillery = idx === 2; // Distilleries shouldn't format as Millions
                const scaledCurrent = isDistillery ? Math.max(1, Math.round(parseFloat(goal.current) * globalMux)) : (parseFloat(goal.current) * globalMux).toFixed(0);
                const scaledTarget = isDistillery ? Math.max(1, Math.round(parseFloat(goal.target) * globalMux)) : (parseFloat(goal.target) * globalMux).toFixed(0);
                return (
                <div key={idx} className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-4 flex items-start gap-3">
                  <div className={`mt-0.5 ${goal.color}`}>
                    <goal.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">{goal.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded border border-gray-100 bg-gray-50">{goal.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {scaledCurrent}{!isDistillery && 'M'} / {scaledTarget}{!isDistillery && 'M'} Goal
                    </p>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER DRAWER PANEL */}
      <div 
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
        
        {/* Slide-out Panel */}
        <div 
          className={`relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ${isFilterOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <p className="text-sm text-gray-500 mt-1">Refine dashboard data views</p>
            </div>
            <button 
              onClick={() => setIsFilterOpen(false)} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 flex-1 overflow-y-auto space-y-8 bg-white">
            
            {/* National Blending Target Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-gray-700">National Blending Target</label>
                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md text-xs">E{draftFilters.blendingTarget} ({draftFilters.blendingTarget}%)</span>
              </div>
              <input 
                type="range" 
                min="10" max="30" step="1"
                value={draftFilters.blendingTarget} 
                onChange={(e) => setDraftFilters({...draftFilters, blendingTarget: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>10% (Min)</span>
                <span>20% (Default)</span>
                <span>30% (Max)</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Time Period */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Time Period (Year)</label>
              <select 
                value={draftFilters.year}
                onChange={(e) => setDraftFilters({...draftFilters, year: e.target.value})}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-colors"
              >
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Region / State */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Region / State</label>
              <select 
                value={draftFilters.region}
                onChange={(e) => setDraftFilters({...draftFilters, region: e.target.value})}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-colors"
              >
                {REGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Agricultural Season (Radio Group) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Agricultural Season</label>
              <div className="space-y-2">
                {SEASON_OPTIONS.map(s => (
                  <label key={s} className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="season"
                      value={s}
                      checked={draftFilters.season === s}
                      onChange={(e) => setDraftFilters({...draftFilters, season: e.target.value})}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ms-2 text-sm font-medium text-gray-900">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Crop Type (Checkboxes) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Include Crop Types</label>
              <div className="space-y-2">
                {CROP_OPTIONS.map(c => (
                  <label key={c} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={draftFilters.crops.includes(c)}
                      onChange={() => toggleDraftCrop(c)}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ms-2 text-sm text-gray-700">{c}</span>
                  </label>
                ))}
              </div>
            </div>
            
          </div>

          {/* Drawer Footer Buttons */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
             <button 
               onClick={clearFilters}
               className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
             >
               Clear All
             </button>
             <button 
               onClick={applyFilters}
               className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
             >
               Apply Filters
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
