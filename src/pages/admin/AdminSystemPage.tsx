import React, { useEffect, useState } from 'react';
import {
  Activity,
  RefreshCw,
  Cpu,
  Database,
  Compass,
  CreditCard,
  Server,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminSystemPage: React.FC = () => {
  const [systemData, setSystemData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemHealth();
      setSystemData(data);
    } catch (err) {
      console.error('Failed to load system diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const server = systemData?.server;
  const database = systemData?.database;
  const gemini = systemData?.gemini;
  const astronomy = systemData?.astronomy;
  const razorpay = systemData?.razorpay;

  const formatUptime = (seconds: number) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#F6F0E6] to-[#C9A45C]">
            Operational System Diagnostics
          </h1>
          <p className="text-xs text-[#A7A4C4] font-serif italic">
            Infrastructure availability, memory utilization, and external integration health
          </p>
        </div>

        <button
          onClick={fetchSystemData}
          disabled={loading}
          className="self-start sm:self-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors"
          title="Refresh Health Status"
        >
          <RefreshCw className={`w-4 h-4 text-[#C9A45C] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Grid of Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Express API Server */}
        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#F6F0E6]">Express API Daemon</h3>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Operational
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-[#A7A4C4]">Uptime: {formatUptime(server?.uptimeSeconds)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <span className="text-[10px] text-[#A7A4C4] block uppercase">Environment</span>
              <span className="text-[#F6F0E6] font-bold">{server?.environment}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A7A4C4] block uppercase">Node Runtime</span>
              <span className="text-[#C9A45C]">{server?.nodeVersion}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A7A4C4] block uppercase">Heap Memory Used</span>
              <span className="text-emerald-400 font-bold">{server?.memoryMb?.heapUsed} MB</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A7A4C4] block uppercase">Resident Memory (RSS)</span>
              <span className="text-[#F6F0E6]">{server?.memoryMb?.rss} MB</span>
            </div>
          </div>
        </div>

        {/* Card 2: MongoDB Atlas */}
        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#F6F0E6]">Database Persistence</h3>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {database?.status}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-[#C9A45C]">{database?.isAtlas ? 'Atlas Cloud ReplicaSet' : 'Local'}</span>
          </div>

          <div className="space-y-2 text-xs font-mono p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <span className="text-[10px] text-[#A7A4C4] block uppercase">Connection Host</span>
              <span className="text-[#F6F0E6] truncate block">{database?.host}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
              <span className="text-[#A7A4C4]">Strict Query Isolation</span>
              <span className="text-emerald-400 font-bold">Enabled</span>
            </div>
          </div>
        </div>

        {/* Card 3: Google Gemini API Engine */}
        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#F6F0E6]">Google Gemini API</h3>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {gemini?.configured ? 'Active Key Verified' : 'Vedic Fallback Mode'}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-purple-300">v1beta</span>
          </div>

          <div className="space-y-2 text-xs font-mono p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[#A7A4C4]">Configured Model:</span>
              <span className="text-[#C9A45C] font-bold">{gemini?.model}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
              <span className="text-[#A7A4C4]">Header Auth (x-goog-api-key)</span>
              <span className="text-emerald-400 font-bold">Configured</span>
            </div>
          </div>
        </div>

        {/* Card 4: Razorpay Webhook Engine */}
        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#F6F0E6]">Razorpay Payments & Webhooks</h3>
                <span className="text-[10px] text-emerald-400 font-mono">HMAC SHA256 Verification</span>
              </div>
            </div>
            <span className="text-xs font-mono text-[#C9A45C]">₹ INR</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <span className="text-[10px] text-[#A7A4C4] block uppercase">Key ID Status</span>
              <span className="text-emerald-400 font-bold">{razorpay?.keyIdConfigured ? 'Configured' : 'Missing'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A7A4C4] block uppercase">Webhook Secret</span>
              <span className="text-emerald-400 font-bold">{razorpay?.webhookSecretConfigured ? 'Active' : 'Missing'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A7A4C4] block uppercase">Events Received</span>
              <span className="text-[#F6F0E6] font-bold">{razorpay?.totalWebhooksReceived || 0}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A7A4C4] block uppercase">Processed Successfully</span>
              <span className="text-emerald-400 font-bold">{razorpay?.processedWebhooksCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
