import React, { useState } from 'react';
import { MSMEProfile } from '../../types';
import { 
  Settings2, 
  Building2, 
  ShieldCheck, 
  Database, 
  Check, 
  RefreshCw, 
  Save, 
  Sparkles,
  Link2,
  Lock,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsViewProps {
  profile: MSMEProfile;
  onUpdateProfile: (updated: Partial<MSMEProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile
}) => {
  const [name, setName] = useState(profile.name);
  const [turnover, setTurnover] = useState(profile.turnover);
  const [location, setLocation] = useState(profile.location);
  const [employees, setEmployees] = useState(profile.employees);
  const [isSaved, setIsSaved] = useState(false);

  const integrations = [
    { name: 'GSTN & E-Way Portal', desc: 'Direct GSTR-1, 2B & 3B automated reconciliation', status: 'Connected', lastSync: '10 mins ago', active: true },
    { name: 'RBI Account Aggregator (AA)', desc: 'Bank statement fetch via Setu / Finvu protocol', status: 'Connected', lastSync: '1 hour ago', active: true },
    { name: 'Tally Prime / ERP 9 Connector', desc: 'Syncs ledger accounts, receivables & inventory', status: 'Connected', lastSync: 'Today, 09:30 AM', active: true },
    { name: 'Zoho Books & Busy ERP', desc: 'Real-time sales invoices and voucher streaming', status: 'Available', lastSync: 'Not synced', active: false },
    { name: 'TReDS Settlement (RXIL / Invoicemart)', desc: 'Automated invoice discounting auction bridge', status: 'Connected', lastSync: 'Yesterday', active: true }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      turnover,
      location,
      employees: Number(employees)
    });
    setIsSaved(true);
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.6 }
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <Settings2 className="w-4 h-4 text-purple-400" />
            <span>ENTERPRISE CONFIGURATION & DATA SYNC</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Settings & MSME Integrations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your company profile, verified GST credentials, and automated accounting connectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Edit Company Profile */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" /> Company Registration Details
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Entity Trade Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Annual Turnover</label>
                <input
                  type="text"
                  value={turnover}
                  onChange={(e) => setTurnover(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Location / Manufacturing Hub</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Total Employees</label>
                <input
                  type="number"
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">Udyam Registration</div>
                <div className="text-slate-400 font-mono text-[11px]">{profile.udyamNumber}</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">GSTIN Identifier</div>
                <div className="text-slate-400 font-mono text-[11px]">{profile.gstin}</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSaved ? 'Profile Updated!' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 cols: Connectors & Integrations */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Link2 className="w-4 h-4 text-sky-400" /> Live Data Connectors
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold">4 Active</span>
          </div>

          <div className="space-y-3">
            {integrations.map((conn, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {conn.name}
                    {conn.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  </div>
                  <div className="text-[11px] text-slate-400">{conn.desc}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Sync: {conn.lastSync}</div>
                </div>

                <button
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    conn.active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-purple-600 hover:text-white'
                  }`}
                >
                  {conn.active ? 'Synced' : 'Connect'}
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl text-xs text-purple-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
            <span>256-bit encrypted bank-grade telemetry stream with zero credential storage.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
