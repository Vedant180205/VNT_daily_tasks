import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatsCard } from '../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/api/dashboard');
      return response.data.data;
    }
  });

  if (isLoading) {
    return <PageContainer><div className="p-8 text-muted">Loading Mission Control...</div></PageContainer>;
  }

  const { kpis, charts } = data;

  const mockSalesData = [
    { name: 'JAN', value: 300 },
    { name: 'FEB', value: 250 },
    { name: 'MAR', value: 320 },
    { name: 'APR', value: 280 },
    { name: 'MAY', value: 350 },
    { name: 'JUN', value: 380 },
    { name: 'JUL', value: 410 },
    { name: 'AUG', value: 390 },
    { name: 'SEP', value: 400 },
    { name: 'OCT', value: 420 },
    { name: 'NOV', value: 450 },
    { name: 'DEC', value: 480 },
  ];

  const pieData1 = [
    { name: 'New', value: 60, color: '#F59E0B' },
    { name: 'Returning', value: 28, color: '#FCD34D' },
    { name: 'Inactive', value: 12, color: '#FEF3C7' }
  ];

  const pieData2 = [
    { name: 'Paid', value: 70, color: '#4F46E5' },
    { name: 'Trial', value: 30, color: '#818CF8' }
  ];

  // Map backend charts to recharts format if it exists, otherwise use mock
  const lineData = charts?.registrationTrend?.length ? charts.registrationTrend.map((d: any) => ({
    name: d.date,
    value: d.count
  })) : [
    { name: 'Mon', value: 10 },
    { name: 'Tue', value: 15 },
    { name: 'Wed', value: 30 },
    { name: 'Thu', value: 25 },
    { name: 'Fri', value: 45 },
    { name: 'Sat', value: 35 },
    { name: 'Sun', value: 60 },
  ];

  return (
    <PageContainer>
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-bold text-text">Analytics</h1>
            <div className="text-[13px] text-muted bg-white border border-border px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
              01.08.2022 - 31.08.2022
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-secondary p-1 rounded-full items-center">
              <button className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              </button>
              <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20"></div>
              <span className="text-[14px] font-semibold">Admin User</span>
            </div>
          </div>
        </div>

        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Players" 
            value={kpis?.totalPlayers || "0"} 
            trend="12.5%" 
            trendUp={true} 
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>}
          />
          <StatsCard 
            title="Active Teams" 
            value={kpis?.activeTeams || "0"} 
            trend="5.2%" 
            trendUp={true}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
          />
          <StatsCard 
            title="Organizers" 
            value={kpis?.pendingOrganizers || "0"} 
            trend="2.1%" 
            trendUp={false}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
          />
          <StatsCard 
            title="Revenue" 
            value={`$${(kpis?.totalRevenue || 0).toLocaleString()}`} 
            trend="14%" 
            trendUp={true}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>}
          />
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Sales dynamics</CardTitle>
              <span className="text-sm text-muted">2021 ˅</span>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSalesData} barSize={8}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dx={-10} />
                    <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                    <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col gap-6">
            <Card className="flex-1 flex flex-col justify-center">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-muted font-medium mb-1">Users</div>
                    <div className="text-2xl font-bold mb-4">4,890</div>
                    <div className="space-y-1">
                      {pieData1.map(d => (
                        <div key={d.name} className="flex items-center gap-2 text-[10px] text-muted">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                          {d.value}% {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-[100px] h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData1} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                          {pieData1.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 flex flex-col justify-center">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-muted font-medium mb-1">Subscriptions</div>
                    <div className="text-2xl font-bold mb-4">1,201</div>
                    <div className="space-y-1">
                      {pieData2.map(d => (
                        <div key={d.name} className="flex items-center gap-2 text-[10px] text-muted">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                          {d.value}% {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-[100px] h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData2} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                          {pieData2.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Overall User Activity</CardTitle>
              <span className="text-sm text-muted">2021 ˅</span>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                    <Line type="monotone" dataKey="value" stroke="#C026D3" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Customer order</CardTitle>
              <button className="text-muted"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] text-muted uppercase">
                    <tr>
                      <th className="pb-3 font-medium">Profile</th>
                      <th className="pb-3 font-medium">Address</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="py-3 flex items-center gap-3 font-medium">
                        <div className="w-6 h-6 rounded-full bg-primary/20"></div>
                        Press
                      </td>
                      <td className="py-3 text-muted">London</td>
                      <td className="py-3 text-muted">22.08.2022</td>
                      <td className="py-3 text-muted">Delivered</td>
                      <td className="py-3 font-medium">$600</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-3 flex items-center gap-3 font-medium">
                        <div className="w-6 h-6 rounded-full bg-success/20"></div>
                        Marina
                      </td>
                      <td className="py-3 text-muted">Mancs</td>
                      <td className="py-3 text-muted">24.08.2022</td>
                      <td className="py-3 text-muted">Processed</td>
                      <td className="py-3 font-medium">$452</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-3 flex items-center gap-3 font-medium">
                        <div className="w-6 h-6 rounded-full bg-info/20"></div>
                        Alex
                      </td>
                      <td className="py-3 text-muted">Unknown</td>
                      <td className="py-3 text-muted">15.08.2022</td>
                      <td className="py-3 text-muted">Cancelled</td>
                      <td className="py-3 font-medium">$1200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </PageContainer>
  );
};
