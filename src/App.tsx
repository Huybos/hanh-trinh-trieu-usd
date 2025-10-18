import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Plus, Trash2, Download, Target, PiggyBank, Bitcoin, Calendar, Calculator, LineChart, RefreshCw, FileText, Bug, Moon, TimerReset } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

// ================= Helpers =================
const fmtUSD = (n:number) => (Number.isFinite(n) ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) : '—');
const fmtCOIN = (n:number, symbol:string) => `${(Number(n)||0).toFixed(8)} ${symbol}`;
const startOfWeek = (d: string | Date) => { const dt=new Date(d); const day=dt.getDay(); const diff=(day+6)%7; dt.setDate(dt.getDate()-diff); dt.setHours(0,0,0,0); return dt.toISOString().slice(0,10); };
const iso = (d: Date) => d.toISOString().slice(0,10);
const todayISO = () => iso(new Date());

// quick event types
type InputChange = React.ChangeEvent<HTMLInputElement>;
type SelectChange = React.ChangeEvent<HTMLSelectElement>;

// ================= Types =================
interface Farm { id: string; name: string; active: boolean }
interface WeeklyEntry { week: string; profits: Record<string, number> }
 type Asset = 'BTC' | 'ETH';
interface Purchase { id: string; date: string; usd: number; price: number; qty: number; asset: Asset }

// ================= Storage =================
const BASE_LS_KEY = "fxbtc_tracker_state_profile_v1";

export default function App() {
  // ======= Theme (dark mặc định, khóa cứng) =======
  const theme = 'dark';
  const themeClasses = {
    page: "min-h-screen bg-[#0f172a] text-gray-100 p-6",
    card: "rounded-2xl bg-slate-800 border border-slate-700 shadow-lg",
    textMuted: "text-gray-300",
    tableHeader: "bg-slate-700/70",
    accent: "text-cyan-400",
    subtitle: "bg-slate-700/60",
    btnGhost: "hover:bg-slate-700/80",
    progressTrack: "bg-white/10",
    progressFill: "bg-gradient-to-r from-cyan-400 to-teal-500",
  };

  // ===== Buttons FX wrapper =====
  const btnFx = "transition active:scale-95 hover:opacity-90";
  const Btn: React.FC<React.ComponentProps<typeof Button>> = ({ className, ...rest }) => (
    <Button className={`${btnFx} ${className||''}`} {...rest} />
  );

  // ======= Multi-user (2 profiles) =======
  const [profile, setProfile] = useState<'carl'|'lamvu'>('carl');
  const LS_KEY = `${BASE_LS_KEY}:${profile}`;

  // ======= Core state =======
  const [farms, setFarms] = useState<Farm[]>([
    { id: crypto.randomUUID(), name: "Farm #1", active: true },
    { id: crypto.randomUUID(), name: "Farm #2", active: true },
    { id: crypto.randomUUID(), name: "Farm #3", active: true },
    { id: crypto.randomUUID(), name: "Farm #4", active: true },
    { id: crypto.randomUUID(), name: "Farm #5", active: true },
  ]);
  const [weekly, setWeekly] = useState<WeeklyEntry[]>([]);
  const [priceBTC, setPriceBTC] = useState<number>(0);
  const [priceETH, setPriceETH] = useState<number>(0);
  const [target, setTarget] = useState<number>(100000);
  const [buys, setBuys] = useState<Purchase[]>([]);
  const [baseUSDBTC, setBaseUSDBTC] = useState<number>(50);
  const [baseUSDETH, setBaseUSDETH] = useState<number>(0);
  const [personalExtra, setPersonalExtra] = useState<number>(0); // chỉ cộng khi profile = Carl

  // ======= Load/Persist (per profile) + PIN =======
  const pinKey = (p: 'carl'|'lamvu') => `${BASE_LS_KEY}:${p}:pin`;
  const [unlocked, setUnlocked] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');

  useEffect(() => {
    const hasPin = !!localStorage.getItem(pinKey(profile));
    if (hasPin) {
      setUnlocked(false);
      return; // chờ nhập PIN, không load dữ liệu
    }
    // Không có PIN: coi như profile mới, reset sạch
    setFarms([
      { id: crypto.randomUUID(), name: 'Farm #1', active: true },
      { id: crypto.randomUUID(), name: 'Farm #2', active: true },
      { id: crypto.randomUUID(), name: 'Farm #3', active: true },
      { id: crypto.randomUUID(), name: 'Farm #4', active: true },
      { id: crypto.randomUUID(), name: 'Farm #5', active: true },
    ]);
    setWeekly([]);
    setPriceBTC(0); setPriceETH(0);
    setTarget(100000);
    setBuys([]);
    setBaseUSDBTC(50); setBaseUSDETH(0);
    setPersonalExtra(0);
  }, [profile]);

  useEffect(() => {
    if (!unlocked) return;
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      if (p.farms) setFarms(p.farms);
      if (p.weekly) setWeekly(p.weekly);
      if (p.priceBTC) setPriceBTC(p.priceBTC);
      if (p.priceETH) setPriceETH(p.priceETH);
      if (p.target) setTarget(p.target);
      if (p.buys) setBuys(p.buys);
      if (p.baseUSDBTC !== undefined) setBaseUSDBTC(p.baseUSDBTC);
      if (p.baseUSDETH !== undefined) setBaseUSDETH(p.baseUSDETH);
      if (p.personalExtra !== undefined) setPersonalExtra(p.personalExtra);
    } catch {}
  }, [profile, unlocked]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ farms, weekly, priceBTC, priceETH, target, buys, baseUSDBTC, baseUSDETH, personalExtra }));
  }, [farms, weekly, priceBTC, priceETH, target, buys, baseUSDBTC, baseUSDETH, personalExtra, profile]);

  // ======= Derived values =======
  const farmIds = useMemo(()=> farms.map(f=>f.id), [farms]);
  const totalFarmProfitBase = useMemo(()=> weekly.reduce((acc,w)=> acc + farmIds.reduce((t,id)=> t + (Number(w.profits[id])||0),0), 0), [weekly, farmIds]);
  const totalFarmProfit = (profile==='carl' ? totalFarmProfitBase + (Number(personalExtra)||0) : totalFarmProfitBase);

  const totalSpentUSD = useMemo(()=> buys.reduce((s,b)=> s + (Number(b.usd)||0), 0), [buys]);
  const qtyBTC = useMemo(()=> buys.filter(b=>b.asset==='BTC').reduce((s,b)=> s + (Number(b.qty)||0), 0), [buys]);
  const qtyETH = useMemo(()=> buys.filter(b=>b.asset==='ETH').reduce((s,b)=> s + (Number(b.qty)||0), 0), [buys]);
  const updateBuy = (id: string, patch: Partial<Purchase>) => setBuys(prev => prev.map(b => b.id===id ? { ...b, ...patch, qty: (patch.price ?? b.price) > 0 ? ((patch.usd ?? b.usd) / (patch.price ?? b.price)) : b.qty } : b));
  const deleteBuy = (id: string) => setBuys(prev => prev.filter(b => b.id !== id));
  const holdingsValue = qtyBTC*(priceBTC||0) + qtyETH*(priceETH||0);
  const remainingCash = Math.max(0, totalFarmProfit - totalSpentUSD); // lãi còn lại sau khi đã dùng để mua coin
  const netAfter = remainingCash + holdingsValue; // giá trị ròng sau mua

  const avgWeeklyProfit = useMemo(()=>{
    if (weekly.length===0) return 0;
    const totals = weekly.map(w=> farmIds.reduce((t,id)=> t + (Number(w.profits[id])||0), 0));
    return totals.reduce((a,b)=>a+b,0)/totals.length;
  }, [weekly, farmIds]);
  const dailyInflow = avgWeeklyProfit/7;
  const daysToTarget = useMemo(()=>{
    if (!Number.isFinite(dailyInflow) || dailyInflow<=0) return Infinity;
    const remaining = Math.max(0, target - netAfter);
    return remaining / dailyInflow;
  }, [target, netAfter, dailyInflow]);

  // ETA countdown (ước tính dựa trên daysToTarget)
  const [now, setNow] = useState<number>(Date.now());
  useEffect(()=>{ const t = setInterval(()=> setNow(Date.now()), 1000); return ()=>clearInterval(t); }, []);
  const etaTimestamp = Number.isFinite(daysToTarget) ? Date.now() + Math.max(0, daysToTarget)*86400000 : NaN;
  const msLeft = isFinite(etaTimestamp) ? Math.max(0, etaTimestamp - now) : NaN;
  const fmtCountdown = () => {
    if (!Number.isFinite(msLeft)) return '—';
    const totalSec = Math.floor(msLeft/1000);
    const d = Math.floor(totalSec/86400);
    const h = Math.floor((totalSec%86400)/3600).toString().padStart(2,'0');
    const m = Math.floor((totalSec%3600)/60).toString().padStart(2,'0');
    const s = Math.floor(totalSec%60).toString().padStart(2,'0');
    return `${d}d ${h}:${m}:${s}`;
  };

  // ======= Price functions =======
  const [fetchingPrice, setFetchingPrice] = useState<boolean>(false);
  const [lastPriceAt, setLastPriceAt] = useState<string>('');
  const fetchPrices = async () => {
    try {
      setFetchingPrice(true);
      const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
      const j = await r.json();
      const pb = j?.bitcoin?.usd; const pe = j?.ethereum?.usd;
      if (pb) setPriceBTC(pb); if (pe) setPriceETH(pe);
      setLastPriceAt(new Date().toLocaleTimeString());
    } catch { alert('Không lấy được giá BTC/ETH. Anh có thể nhập tay.'); }
    finally { setFetchingPrice(false); }
  };

  // Auto-update every 15 minutes & on mount
  useEffect(() => { fetchPrices(); const it = setInterval(fetchPrices, 15*60*1000); return () => clearInterval(it); }, []);

  // ======= Historical daily prices (range) =======
  async function fetchDailyPrices(asset: Asset, fromISO: string, toISO: string): Promise<Record<string, number>> {
    const id = asset==='BTC' ? 'bitcoin' : 'ethereum';
    const from = Math.floor(new Date(fromISO).getTime()/1000);
    const to = Math.floor(new Date(toISO).getTime()/1000) + 86399;
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
    const r = await fetch(url);
    const j = await r.json();
    const arr: [number, number][] = j?.prices || [];
    const byDate: Record<string, number> = {};
    arr.forEach(([ts, price]) => { const d = new Date(ts); const key = iso(d); byDate[key] = price; });
    return byDate;
  }

  // ======= Weekly profits handlers =======
  const addFarm = () => setFarms(prev => [...prev, { id: crypto.randomUUID(), name: `Farm #${prev.length+1}`, active: true }]);
  const removeFarm = (id: string) => setFarms(prev => prev.filter(f => f.id !== id));
  const upsertWeek = (weekISO: string) => {
    const wk = startOfWeek(weekISO);
    setWeekly(prev => prev.find(x=>x.week===wk) ? prev : [...prev, { week: wk, profits: Object.fromEntries(farms.map(f => [f.id, 0])) }]);
  };
  const setProfit = (week: string, farmId: string, val: number) => setWeekly(prev => prev.map(w => w.week === week ? { ...w, profits: { ...w.profits, [farmId]: val } } : w));
  const deleteWeek = (week: string) => setWeekly(prev => prev.filter(w => w.week !== week));

  // ======= CSV Export (lãi tuần + BUY + snapshot) =======
  const csvJoin = (rows: string[]) => rows.join('\n');

  const exportCSV = () => {
    const rows: string[] = [];
    rows.push('Type,Asset,Date,Week,Farm,USD,Qty,Price,CurrentBTC,CurrentETH');
    weekly.forEach(w => farms.forEach(f => rows.push(['WEEK','', '', w.week, f.name,(w.profits[f.id]||0).toString(),'','','',''].join(','))));
    buys.forEach(b => rows.push(['BUY', b.asset, b.date, '', '', b.usd.toString(), b.qty.toFixed(8), b.price.toString(), '', ''].join(',')));
    rows.push(['SNAPSHOT','', todayISO(), '', '', totalFarmProfit.toString(), (qtyBTC+qtyETH).toString(), '', priceBTC.toString(), priceETH.toString()].join(','));
    const blob = new Blob([csvJoin(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fx-crypto-export-${todayISO()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ======= Quick state for inputs =======
  const [newWeekDate, setNewWeekDate] = useState<string>(startOfWeek(todayISO()));
  // Buys state per asset
  const [buyPriceBTCToday, setBuyPriceBTCToday] = useState<number>(0);
  const [buyPriceETHToday, setBuyPriceETHToday] = useState<number>(0);
  const [bulkStart, setBulkStart] = useState<string>(todayISO());
  const [bulkEnd, setBulkEnd] = useState<string>(todayISO());

  // ================== UI ==================
  if (!unlocked) {
    return (
      <div className={themeClasses.page}>
        <div className="max-w-md mx-auto mt-20">
          <Card className={themeClasses.card}>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Hồ sơ "{profile==='carl'?'Carl':'Lâm Vũ'}" đang được khoá</h2>
              <div className="space-y-2">
                <Label>Nhập PIN để mở</Label>
                <Input type="password" value={pinInput} onChange={(e: InputChange)=>setPinInput(e.target.value)} placeholder="••••" />
                <div className="flex gap-2">
                  <Btn onClick={()=>{ const saved = localStorage.getItem(pinKey(profile)); if (pinInput && saved===pinInput) { setUnlocked(true); setPinInput(''); } else { alert('PIN không đúng'); } }}>Mở khoá</Btn>
                  <select className="px-3 py-2 rounded-xl border text-black" value={profile} onChange={(e: SelectChange)=>setProfile(e.target.value as any)}>
                    <option value="carl">Carl</option>
                    <option value="lamvu">Lâm Vũ</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label>Đặt/đổi PIN cho hồ sơ này</Label>
                <Input type="password" value={newPin} onChange={(e: InputChange)=>setNewPin(e.target.value)} placeholder="PIN mới" />
                <div className="flex gap-2">
                  <Btn variant="secondary" onClick={()=>{ if(!newPin){ alert('Nhập PIN'); return;} localStorage.setItem(pinKey(profile), newPin); setNewPin(''); alert('Đã đặt/đổi PIN'); }}>Lưu PIN</Btn>
                  <Btn variant="destructive" onClick={()=>{ localStorage.removeItem(pinKey(profile)); alert('Đã xoá PIN. Hồ sơ sẽ reset khi chuyển sang và quay lại.'); }}>Xoá PIN</Btn>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // chart data (dashboard mini)
  const dashboardAlloc = [
    { name: 'BTC', value: qtyBTC * (priceBTC||0) },
    { name: 'ETH', value: qtyETH * (priceETH||0) },
    { name: 'Tiền mặt', value: remainingCash }
  ];
  const COLORS = ['#22d3ee', '#34d399', '#64748b'];

  return (
    <div className={themeClasses.page}>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${themeClasses.accent}`}>Hành trình triệu $</h1>
            <p className={`text-sm ${themeClasses.textMuted}`}>Theo dõi lãi farm ➜ mua BTC/ETH từ lãi • Lấy giá tự động mỗi 15′ • ETA tới mục tiêu.</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 text-sm">
              <Label>Người dùng</Label>
              <select className="px-3 py-2 rounded-xl border text-black" value={profile} onChange={(e: SelectChange)=>setProfile(e.target.value as any)}>
                <option value="carl">Carl</option>
                <option value="lamvu">Lâm Vũ</option>
              </select>
            </div>
            {/* PIN quick actions */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Input type="password" placeholder="PIN mới" onChange={(e: InputChange)=>setNewPin(e.target.value)} className="w-28" />
              <Btn variant="secondary" onClick={()=>{ if(!newPin){ alert('Nhập PIN'); return;} localStorage.setItem(pinKey(profile), newPin); setNewPin(''); alert('Đã lưu PIN'); }}>Lưu PIN</Btn>
              <Btn variant="destructive" onClick={()=>{ localStorage.removeItem(pinKey(profile)); alert('Đã xoá PIN'); }}>Xoá PIN</Btn>
            </div>
            <Btn variant="secondary" onClick={fetchPrices} disabled={fetchingPrice}>
              <RefreshCw className={`w-4 h-4 mr-2 ${fetchingPrice? 'animate-spin':''}`} />{fetchingPrice? 'Đang lấy...' : 'Lấy giá'}
            </Btn>
            <Btn variant="secondary" onClick={exportCSV}><Download className="w-4 h-4 mr-2"/>Xuất CSV</Btn>
            <Btn variant="secondary" onClick={()=>window.print()}><FileText className="w-4 h-4 mr-2"/>In báo cáo</Btn>
          </div>
        </header>

        {/* Overview */}
        <div className="grid lg:grid-cols-5 gap-4">
          <Card className={themeClasses.card}><CardContent className="p-4"><div className={`flex items-center gap-2 ${themeClasses.textMuted}`}><PiggyBank className="w-4 h-4"/>Tổng lãi (trước mua)</div><div className="text-2xl font-semibold mt-1">{fmtUSD(totalFarmProfit)}</div>{profile==='carl' && (<div className="mt-2 text-sm"><Label>Nguồn khác (Carl)</Label><Input type="number" value={personalExtra} onChange={(e: InputChange)=>setPersonalExtra(Number(e.target.value)||0)} placeholder="Ví dụ: 200" /></div>)}</CardContent></Card>
          <Card className={themeClasses.card}><CardContent className="p-4"><div className={`flex items-center gap-2 ${themeClasses.textMuted}`}><Bitcoin className="w-4 h-4"/>BTC nắm giữ</div><div className="text-xl font-semibold mt-1">{fmtCOIN(qtyBTC,'BTC')}</div><div className={`text-xs ${themeClasses.textMuted} mt-1`}>Giá BTC: {fmtUSD(priceBTC)}{lastPriceAt && ` • cập nhật ${lastPriceAt}`}</div></CardContent></Card>
          <Card className={themeClasses.card}><CardContent className="p-4"><div className={`flex items-center gap-2 ${themeClasses.textMuted}`}><Bitcoin className="w-4 h-4 rotate-45"/>ETH nắm giữ</div><div className="text-xl font-semibold mt-1">{fmtCOIN(qtyETH,'ETH')}</div><div className={`text-xs ${themeClasses.textMuted} mt-1`}>Giá ETH: {fmtUSD(priceETH)}{lastPriceAt && ` • cập nhật ${lastPriceAt}`}</div></CardContent></Card>
          <Card className={themeClasses.card}><CardContent className="p-4"><div className={`flex items-center gap-2 ${themeClasses.textMuted}`}><Calculator className="w-4 h-4"/>Giá trị ròng</div><div className="text-2xl font-semibold mt-1">{fmtUSD(netAfter)}</div><div className={`text-xs ${themeClasses.textMuted} mt-2`}>= (Lãi còn lại) + (BTC/ETH * giá hiện tại)</div></CardContent></Card>
          <Card className={themeClasses.card}><CardContent className="p-4">
            <div className={`flex items-center gap-2 ${themeClasses.textMuted}`}><Target className="w-4 h-4"/>Mục tiêu</div>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div>
                <Label>Target</Label>
                <Input type="number" value={target} onChange={(e: InputChange)=>setTarget(Number(e.target.value)||0)} className="w-full" />
              </div>
              <div className={`flex items-center gap-2 text-sm ${themeClasses.textMuted}`}>
                <TimerReset className="w-4 h-4"/> ETA ước tính: <span className="font-medium text-green-400">{Number.isFinite(daysToTarget)?`${Math.ceil(daysToTarget)} ngày`:'—'}</span>
              </div>
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="text-xs">Tiến độ: {Math.min(100, Math.max(0, Math.round((netAfter/Math.max(1,target))*100)))}%</div>
                <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-500" style={{width: `${Math.min(100, Math.max(0, (netAfter/Math.max(1,target))*100))}%`}} />
                </div>
              </div>
              <div className={`text-xs ${themeClasses.textMuted}`}>Đếm ngược: {fmtCountdown()}</div>
            </div>
          </CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profits">Lãi hàng tuần</TabsTrigger>
            <TabsTrigger value="buys">Mua BTC/ETH</TabsTrigger>
            <TabsTrigger value="diagnostics"><Bug className="w-4 h-4 mr-1"/>Diagnostics</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <Card className={themeClasses.card}>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-5 gap-3">
                  <div className="md:col-span-1">
                    <div className="text-sm mb-2">Phân bổ hiện tại</div>
                    <div className="h-48">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={dashboardAlloc}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label={({ name, percent }: { name?: string; percent?: number }) =>
                              `${name ?? ''}: ${(((percent ?? 0) * 100).toFixed(1))}%`
                            }
                          >
                            {dashboardAlloc.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v:any)=>fmtUSD(Number(v)||0)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="grid md:grid-cols-4 gap-3">
                      <div className="rounded-xl p-3 bg-slate-700/40">
                        <div className="text-xs text-gray-400">Lãi gốc</div>
                        <div className="text-lg font-semibold">{fmtUSD(totalFarmProfitBase)}</div>
                      </div>
                      <div className="rounded-xl p-3 bg-slate-700/40">
                        <div className="text-xs text-gray-400">Đã dùng mua</div>
                        <div className="text-lg font-semibold">{fmtUSD(totalSpentUSD)}</div>
                      </div>
                      <div className="rounded-xl p-3 bg-slate-700/40">
                        <div className="text-xs text-gray-400">Tiền mặt còn</div>
                        <div className="text-lg font-semibold">{fmtUSD(remainingCash)}</div>
                      </div>
                      <div className="rounded-xl p-3 bg-slate-700/40">
                        <div className="text-xs text-gray-400">Giá trị coin</div>
                        <div className="text-lg font-semibold">{fmtUSD(holdingsValue)}</div>
                      </div>
                    </div>
                    <div className="h-64 mt-4">
                      <ResponsiveContainer>
                        <RLineChart data={[{date: todayISO(), total: netAfter}]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v)=>fmtUSD(Number(v)||0)} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value:any)=> fmtUSD(Number(value)||0)} />
                          <Legend />
                          <Line type="monotone" dataKey="total" name="Giá trị ròng (ước tính)" dot={false} />
                        </RLineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Profits */}
          <TabsContent value="profits">
            <Card className={themeClasses.card}>
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <Label>Thêm tuần (chọn ngày)</Label>
                    <Input type="date" value={newWeekDate} onChange={(e: InputChange)=>setNewWeekDate(e.target.value)} />
                  </div>
                  <Btn onClick={()=>upsertWeek(newWeekDate)}><Plus className="w-4 h-4 mr-2"/>Thêm tuần</Btn>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Btn variant="secondary"><Plus className="w-4 h-4 mr-2"/>Quản lý Farm</Btn>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Quản lý Farm</DialogTitle></DialogHeader>
                      <div className="space-y-2">
                        {farms.map(f => (
                          <div key={f.id} className="flex items-center gap-2">
                            <Input value={f.name} onChange={(e: InputChange)=>setFarms(prev=>prev.map(x=>x.id===f.id?{...x,name:e.target.value}:x))} />
                            <Btn variant="destructive" onClick={()=>removeFarm(f.id)}><Trash2 className="w-4 h-4"/></Btn>
                          </div>
                        ))}
                        <Btn onClick={addFarm}><Plus className="w-4 h-4 mr-2"/>Thêm Farm</Btn>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="overflow-auto rounded-2xl border border-slate-700">
                  <table className="min-w-full text-sm">
                    <thead className={themeClasses.tableHeader}>
                      <tr>
                        <th className="p-3 text-left">Tuần (Thứ 2)</th>
                        {farms.map(f => <th key={f.id} className="p-3 text-left">{f.name}</th>)}
                        <th className="p-3 text-right">Tổng tuần</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekly.sort((a,b)=>a.week.localeCompare(b.week)).map(w => {
                        const total = farmIds.reduce((t,id)=>t+(Number(w.profits[id])||0),0);
                        return (
                          <tr key={w.week} className="border-t border-slate-700/60">
                            <td className="p-3 font-medium"><div className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{w.week}</div></td>
                            {farms.map(f => (
                              <td key={f.id} className="p-2">
                                <Input type="number" value={w.profits[f.id] ?? 0} onChange={(e: InputChange) => setProfit(w.week, f.id, Number(e.target.value)||0)} />
                              </td>
                            ))}
                            <td className="p-3 text-right font-semibold">{fmtUSD(total)}</td>
                            <td className="p-3 text-right"><Btn variant="ghost" className={themeClasses.btnGhost} onClick={()=>deleteWeek(w.week)}><Trash2 className="w-4 h-4"/></Btn></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buys */}
          <TabsContent value="buys">
            <Card className={themeClasses.card}>
              <CardContent className="p-4 space-y-6">
                {/* BTC */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">BTC</h3>
                    <div className={`text-sm ${themeClasses.textMuted}`}>Giá: {fmtUSD(priceBTC)}</div>
                  </div>
                  <div className="grid md:grid-cols-5 gap-3 items-end">
                    <div>
                      <Label>USD/ngày (mặc định)</Label>
                      <Input type="number" value={baseUSDBTC} onChange={(e: InputChange)=>setBaseUSDBTC(Number(e.target.value)||0)} />
                    </div>
                    <div>
                      <Label>Giá hôm nay (USD)</Label>
                      <Input type="number" value={buyPriceBTCToday||priceBTC} onChange={(e: InputChange)=>setBuyPriceBTCToday(Number(e.target.value)||0)} placeholder="Mặc định dùng giá hiện tại" />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Btn onClick={()=>{ const price = (buyPriceBTCToday||priceBTC); if(!price){alert('Chưa có giá BTC'); return;} const qty = baseUSDBTC/price; setBuys(prev=>[...prev,{ id: crypto.randomUUID(), date: todayISO(), usd: baseUSDBTC, price, qty, asset:'BTC' }]); }}>
                        <Plus className="w-4 h-4 mr-2"/> Thêm giao dịch hôm nay ($50)
                      </Btn>
                      <Btn variant="secondary" onClick={fetchPrices}><RefreshCw className="w-4 h-4 mr-2"/>Lấy giá</Btn>
                    </div>
                    <div className={`text-xs ${themeClasses.textMuted}`}>* Giao dịch mua dùng “lãi” (không cộng trực tiếp vào lãi). Tổng lãi còn lại = Lãi - Tổng USD đã mua.</div>
                  </div>
                </div>

                {/* ETH */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">ETH</h3>
                    <div className={`text-sm ${themeClasses.textMuted}`}>Giá: {fmtUSD(priceETH)}</div>
                  </div>
                  <div className="grid md:grid-cols-5 gap-3 items-end">
                    <div>
                      <Label>USD/ngày (mặc định)</Label>
                      <Input type="number" value={baseUSDETH} onChange={(e: InputChange)=>setBaseUSDETH(Number(e.target.value)||0)} />
                    </div>
                    <div>
                      <Label>Giá hôm nay (USD)</Label>
                      <Input type="number" value={buyPriceETHToday||priceETH} onChange={(e: InputChange)=>setBuyPriceETHToday(Number(e.target.value)||0)} placeholder="Mặc định dùng giá hiện tại" />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Btn onClick={()=>{ const price = (buyPriceETHToday||priceETH); if(!price){alert('Chưa có giá ETH'); return;} const qty = baseUSDETH/price; setBuys(prev=>[...prev,{ id: crypto.randomUUID(), date: todayISO(), usd: baseUSDETH, price, qty, asset:'ETH' }]); }}>
                        <Plus className="w-4 h-4 mr-2"/> Thêm giao dịch hôm nay
                      </Btn>
                      <Btn variant="secondary" onClick={fetchPrices}><RefreshCw className="w-4 h-4 mr-2"/>Lấy giá</Btn>
                    </div>
                  </div>
                </div>

                {/* Bulk by historical daily prices */}
                <div className="space-y-3">
                  <div className="font-semibold">Tạo hàng loạt theo <b>giá mỗi ngày thực tế</b> (CoinGecko)</div>
                  <div className="grid md:grid-cols-6 gap-3 items-end">
                    <div>
                      <Label>Từ ngày</Label>
                      <Input type="date" value={bulkStart} onChange={(e: InputChange)=>setBulkStart(e.target.value)} />
                    </div>
                    <div>
                      <Label>Đến ngày</Label>
                      <Input type="date" value={bulkEnd} onChange={(e: InputChange)=>setBulkEnd(e.target.value)} />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Btn variant="secondary" onClick={async()=>{
                        const s=new Date(bulkStart); const e=new Date(bulkEnd); if(e<s){alert('Khoảng ngày không hợp lệ'); return;}
                        const map = await fetchDailyPrices('BTC', bulkStart, bulkEnd);
                        const list: Purchase[] = [];
                        for(let d=new Date(s); d<=e; d.setDate(d.getDate()+1)){
                          const key = iso(d); const price = map[key]; if(!price) continue;
                          const amount = baseUSDBTC; const q = amount/price; list.push({ id: crypto.randomUUID(), date:key, usd:amount, price, qty:q, asset:'BTC' });
                        }
                        if(list.length===0){ alert('Không có dữ liệu giá BTC cho khoảng ngày'); return; }
                        setBuys(prev=>[...prev, ...list]);
                      }}><Plus className="w-4 h-4 mr-2"/>BTC: tạo $/ngày theo giá từng ngày</Btn>

                      <Btn variant="secondary" onClick={async()=>{
                        const s=new Date(bulkStart); const e=new Date(bulkEnd); if(e<s){alert('Khoảng ngày không hợp lệ'); return;}
                        const map = await fetchDailyPrices('ETH', bulkStart, bulkEnd);
                        const list: Purchase[] = [];
                        for(let d=new Date(s); d<=e; d.setDate(d.getDate()+1)){
                          const key = iso(d); const price = map[key]; if(!price) continue;
                          const amount = baseUSDETH; const q = amount/price; list.push({ id: crypto.randomUUID(), date:key, usd:amount, price, qty:q, asset:'ETH' });
                        }
                        if(list.length===0){ alert('Không có dữ liệu giá ETH cho khoảng ngày'); return; }
                        setBuys(prev=>[...prev, ...list]);
                      }}><Plus className="w-4 h-4 mr-2"/>ETH: tạo $/ngày theo giá từng ngày</Btn>
                    </div>
                  </div>

                  <div className="overflow-auto rounded-2xl border border-slate-700">
                    <table className="min-w-full text-sm">
                      <thead className={themeClasses.tableHeader}>
                        <tr>
                          <th className="p-3 text-left">Asset</th>
                          <th className="p-3 text-left">Ngày</th>
                          <th className="p-3 text-right">USD</th>
                          <th className="p-3 text-right">Giá</th>
                          <th className="p-3 text-right">Số lượng</th>
                        </tr>
                      </thead>
                      <tbody>
                      {buys.sort((a,b)=> a.date===b.date ? (a.asset<b.asset?-1:1) : a.date.localeCompare(b.date)).map(b => (
                        <tr key={b.id} className="border-t border-slate-700/60">
                          <td className="p-3 font-medium">{b.asset}</td>
                          <td className="p-3">{b.date}</td>
                          <td className="p-2 text-right"><Input className="text-right" type="number" value={b.usd} onChange={(e: InputChange)=>updateBuy(b.id,{ usd:Number(e.target.value)||0 })}/></td>
                          <td className="p-2 text-right"><Input className="text-right" type="number" value={b.price} onChange={(e: InputChange)=>updateBuy(b.id,{ price:Number(e.target.value)||0 })}/></td>
                          <td className="p-3 text-right">{b.qty.toFixed(8)}</td>
                          <td className="p-3 text-right"><Btn variant="ghost" className={themeClasses.btnGhost} onClick={()=>deleteBuy(b.id)}><Trash2 className="w-4 h-4"/></Btn></td>
                        </tr>
                      ))}
                    </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnostics */}
          <TabsContent value="diagnostics">
            <Card className={themeClasses.card}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2"><Bug className="w-4 h-4"/> <span className="font-medium">Diagnostics</span></div>
                <ul className={`list-disc pl-5 text-sm ${themeClasses.textMuted}`}>
                  <li>Giá BTC/ETH auto cập nhật 15′ (CoinGecko) hoặc bấm “Lấy giá”.</li>
                  <li>Mua BTC/ETH **trích từ lãi**: Lãi còn lại = Tổng lãi − Tổng USD đã mua.</li>
                  <li>Bulk dùng **giá mỗi ngày thực tế** theo khoảng chọn.</li>
                  <li>ETA = (Target - Giá trị ròng) / (TB lãi tuần / 7). Có đếm ngược realtime.</li>
                  <li>2 người dùng tách biệt nhờ profile **Carl / Lâm Vũ**.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card className={themeClasses.card}>
          <CardContent className="p-4">
            <h3 className={`font-semibold mb-2 ${themeClasses.accent}`}>Gợi ý quy trình</h3>
            <ol className={`list-decimal pl-5 space-y-1 text-sm ${themeClasses.textMuted}`}>
              <li>Nhập lãi từng farm mỗi tuần.</li>
              <li>Bấm “Lấy giá” → Thêm giao dịch BTC/ETH hôm nay, hoặc tạo hàng loạt theo khoảng ngày.</li>
              <li>Kiểm tra “Lãi còn lại”, BTC/ETH nắm giữ, và ETA tới mục tiêu.</li>
              <li>Xuất CSV/In báo cáo khi cần.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
