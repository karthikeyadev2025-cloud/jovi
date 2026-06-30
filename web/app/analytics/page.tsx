// app/analytics/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Shell from "../../components/Shell";
import { createClient } from "../../lib/supabase";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const C = {
  surf:"#0F0F1A", hi:"#161625", bord:"#1E1E35",
  glow:"#8B5CF6", gbr:"#A78BFA", gold:"#F59E0B",
  grn:"#10B981", red:"#EF4444", cyn:"#06B6D4",
  txt:"#EEEEFF", mid:"#8888AA", dim:"#44445A",
};

const INTENT_COLORS: Record<string, string> = {
  appointment: C.grn, enquiry: C.cyn, callback: C.gold,
  transfer: C.gbr, emergency: C.red, unknown: C.dim,
};

function Card({ children, title, style }: { children: React.ReactNode; title?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.surf, border: "1px solid " + C.bord,
      borderRadius: 10, padding: 16, ...style }}>
      {title && <div style={{ color: C.txt, fontSize: 13, fontWeight: 800, marginBottom: 14 }}>{title}</div>}
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [calls, setCalls]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/login"; return; }
      const { data: tu } = await sb.from("tenant_users")
        .select("tenant_id").eq("user_id", data.user.id).single();
      if (!tu) return;
      const { data: c } = await sb.from("calls").select("*")
        .eq("tenant_id", tu.tenant_id)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
        .order("created_at", { ascending: true });
      setCalls(c || []);
      setLoading(false);
    });
  }, []);

  // 7-day volume
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const dayStr = d.toISOString().split("T")[0];
    return {
      day: label,
      calls: calls.filter(c => c.created_at?.startsWith(dayStr)).length,
    };
  });

  // Intent breakdown
  const intentCounts = calls.reduce((acc: Record<string, number>, c) => {
    const k = c.intent || "unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const intentData: Array<{ name: string; value: number }> = Object.entries(intentCounts).map(([name, value]) => ({ name, value: value as number }));

  // Peak hours heatmap
  const hourCounts = Array.from({ length: 24 }, (_, h) => ({
    hour: h + ":00",
    calls: calls.filter(c => c.created_at && new Date(c.created_at).getHours() === h).length,
  }));

  const totalCalls   = calls.length;
  const appointments = calls.filter(c => c.appointment_created).length;
  const waSent       = calls.filter(c => c.wa_sent).length;
  const avgDur       = calls.length
    ? Math.round(calls.reduce((s, c) => s + (c.duration_seconds || 0), 0) / calls.length)
    : 0;

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: C.hi, border: "1px solid " + C.bord,
        borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
        <div style={{ color: C.mid }}>{label}</div>
        <div style={{ color: C.gbr, fontWeight: 700 }}>{payload[0]?.value} calls</div>
      </div>
    );
  };

  return (
    <Shell title="Analytics">
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: C.mid }}>Loading analytics...</div>
      ) : (
        <>
          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Calls (30d)", value: totalCalls,   color: C.gbr  },
              { label: "Appointments",       value: appointments, color: C.grn  },
              { label: "WhatsApp Sent",      value: waSent,       color: C.cyn  },
              { label: "Avg Duration",       value: `${avgDur}s`, color: C.gold },
            ].map(s => (
              <Card key={s.label}>
                <div style={{ color: C.mid, fontSize: 11, textTransform: "uppercase",
                  letterSpacing: "0.1em", marginBottom: 6 }}>{s.label}</div>
                <div style={{ color: s.color, fontSize: 26, fontWeight: 900 }}>{s.value}</div>
              </Card>
            ))}
          </div>

          {/* 7-day volume */}
          <Card title="Call Volume — Last 7 Days" style={{ marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last7} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: C.mid, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.mid, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={customTooltip} cursor={{ fill: C.hi }} />
                <Bar dataKey="calls" fill={C.glow} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Intent breakdown */}
            <Card title="Intent Breakdown">
              {intentData.length === 0 ? (
                <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 30 }}>
                  No calls yet
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={intentData} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                        {intentData.map((entry, i) => (
                          <Cell key={i} fill={INTENT_COLORS[entry.name] || C.dim} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any, n: any) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {intentData.map(d => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%",
                          background: INTENT_COLORS[d.name] || C.dim }} />
                        <span style={{ color: C.mid, fontSize: 11 }}>{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Peak hours */}
            <Card title="Peak Call Hours">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourCounts.filter(h => h.calls > 0 || [9,10,11,12,13,14,15,16,17,18].includes(parseInt(h.hour)))}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="hour" tick={{ fill: C.dim, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.mid, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={customTooltip} cursor={{ fill: C.hi }} />
                  <Bar dataKey="calls" fill={C.gold} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </Shell>
  );
}
