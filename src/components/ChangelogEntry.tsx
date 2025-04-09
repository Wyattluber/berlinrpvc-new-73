
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type ChangelogType = 'feature' | 'bugfix' | 'improvement' | 'announcement';

export interface ChangelogEntryProps {
  id: string;
  title: string;
  description: string;
  date: string;
  type: ChangelogType;
}

const typeColors = {
  feature: 'bg-green-100 text-green-800 hover:bg-green-200',
  bugfix: 'bg-red-100 text-red-800 hover:bg-red-200',
  improvement: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  announcement: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
};

const typeLabels = {
  feature: 'Neue Funktion',
  bugfix: 'Fehlerbehebung',
  improvement: 'Verbesserung',
  announcement: 'Ankündigung'
};

const ChangelogEntry: React.FC<ChangelogEntryProps> = ({
  title,
  description,
  date,
  type
}) => {
  const badgeClass = typeColors[type] || 'bg-gray-100 text-gray-800';
  const formattedDate = new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="mb-4 overflow-hidden border-l-4 hover:shadow-md transition-shadow" 
          style={{ borderLeftColor: type === 'feature' ? '#22c55e' : 
                                  type === 'bugfix' ? '#ef4444' : 
                                  type === 'improvement' ? '#3b82f6' : '#f59e0b' }}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm text-gray-500">{formattedDate}</CardDescription>
          </div>
          <Badge className={`${badgeClass} font-normal`}>
            {typeLabels[type]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-sm text-gray-700 whitespace-pre-line">{description}</p>
      </CardContent>
    </Card>
  );
};

export default ChangelogEntry;
