
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Share, MessageSquare } from 'lucide-react';

// Mock data - in a real app, these would come from an API
const stats = {
  discordMembers: 584,
  partnerServers: 12,
  activeRoles: 8
};

const StatCard = ({ title, value, icon: Icon, className = "" }) => (
  <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const ServerStats = () => {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-hamburg-blue">
          Server Statistiken
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Discord Mitglieder" 
            value={stats.discordMembers} 
            icon={Users} 
            className="border-t-4 border-t-hamburg-red"
          />
          <StatCard 
            title="Partner Server" 
            value={stats.partnerServers} 
            icon={Share}
            className="border-t-4 border-t-hamburg-lightblue"
          />
          <StatCard 
            title="Aktive Rollen" 
            value={stats.activeRoles} 
            icon={MessageSquare}
            className="border-t-4 border-t-hamburg-blue"
          />
        </div>
      </div>
    </section>
  );
};

export default ServerStats;
