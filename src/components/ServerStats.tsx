
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Share, Server } from 'lucide-react';

// Updated stats with real data
const stats = {
  discordMembers: 179,
  partnerServers: 2,
  servers: 1
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
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Server Statistiken
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Discord Mitglieder" 
            value={stats.discordMembers} 
            icon={Users} 
            className="border-t-4 border-t-blue-500 bg-gradient-to-br from-white to-blue-50"
          />
          <StatCard 
            title="Partner Server" 
            value={stats.partnerServers} 
            icon={Share}
            className="border-t-4 border-t-indigo-500 bg-gradient-to-br from-white to-indigo-50"
          />
          <StatCard 
            title="Server" 
            value={stats.servers} 
            icon={Server}
            className="border-t-4 border-t-purple-500 bg-gradient-to-br from-white to-purple-50"
          />
        </div>
      </div>
    </section>
  );
};

export default ServerStats;
