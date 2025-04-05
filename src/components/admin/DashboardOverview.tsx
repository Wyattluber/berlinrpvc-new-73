
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, FileText, CheckCircle, ShieldCheck
} from 'lucide-react';
import ServerStats from '@/components/ServerStats';
import { fetchApplications } from '@/lib/adminService';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';

interface DashboardOverviewProps {
  userCount: number;
  adminUsers: any[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ userCount, adminUsers }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: userCount,
    adminUsers: adminUsers.length,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getStats = async () => {
      try {
        const applicationsData = await fetchApplications();
        setApplications(applicationsData || []);
        
        const pendingCount = applicationsData?.filter(app => app.status === 'pending').length || 0;
        const approvedCount = applicationsData?.filter(app => app.status === 'approved').length || 0;
        const rejectedCount = applicationsData?.filter(app => app.status === 'rejected').length || 0;
        
        setStats({
          totalUsers: userCount,
          adminUsers: adminUsers.length,
          pendingApplications: pendingCount,
          approvedApplications: approvedCount,
          rejectedApplications: rejectedCount
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getStats();
  }, [userCount, adminUsers]);
  
  const applicationStatusData = [
    { name: 'Angenommen', value: stats.approvedApplications, color: '#4ade80' },
    { name: 'Abgelehnt', value: stats.rejectedApplications, color: '#f87171' },
    { name: 'Ausstehend', value: stats.pendingApplications, color: '#60a5fa' },
  ];
  
  const COLORS = ['#4ade80', '#f87171', '#60a5fa'];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Übersicht</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Benutzer gesamt
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registrierte Benutzer</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Admin-Benutzer
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">Team Mitglieder</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Neue Bewerbungen
            </CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Ausstehende Bewerbungen</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Genehmigte Bewerbungen
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedApplications}</div>
            <p className="text-xs text-muted-foreground">Angenommene Bewerbungen</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Server Statistiken</h3>
        <ServerStats isAdmin={true} />
      </div>
      
      {applications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="h-auto">
            <CardHeader>
              <CardTitle className="text-base">Bewerbungsstatus</CardTitle>
              <CardDescription>Verteilung der Bewerbungen nach Status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {applicationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="h-auto">
            <CardHeader>
              <CardTitle className="text-base">Neueste Bewerbungen</CardTitle>
              <CardDescription>Die 5 neuesten Bewerbungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Datum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.slice(0, 5).map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.username || "Unbekannt"}</TableCell>
                        <TableCell>
                          {app.status === 'pending' && <span className="text-amber-500">Ausstehend</span>}
                          {app.status === 'approved' && <span className="text-green-500">Angenommen</span>}
                          {app.status === 'rejected' && <span className="text-red-500">Abgelehnt</span>}
                        </TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString('de-DE')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
