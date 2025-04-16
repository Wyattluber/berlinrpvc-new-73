
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface PartnerStatusBadgeProps {
  status: string;
  isActive: boolean;
  isExpired: boolean;
  isPendingRenewal: boolean;
}

export const PartnerStatusBadge = ({ status, isActive, isExpired, isPendingRenewal }: PartnerStatusBadgeProps) => {
  if (isPendingRenewal) {
    return <Badge className="bg-orange-500">Verlängerung läuft</Badge>;
  } else if (status === 'approved') {
    return isActive && !isExpired ? 
      <Badge className="bg-green-500">Aktiv</Badge> : 
      <Badge className="bg-gray-500">Inaktiv</Badge>;
  } else if (status === 'rejected') {
    return <Badge className="bg-red-500">Abgelehnt</Badge>;
  } else {
    return <Badge className="bg-yellow-500">In Bearbeitung</Badge>;
  }
};

export const PartnerStatusIcon = ({ status, isActive, isExpired, isPendingRenewal }: PartnerStatusBadgeProps) => {
  if (isPendingRenewal) {
    return <RefreshCw className="h-6 w-6 text-orange-500" />;
  } else if (status === 'approved') {
    return isActive && !isExpired ? 
      <CheckCircle className="h-6 w-6 text-green-500" /> : 
      <XCircle className="h-6 w-6 text-gray-500" />;
  } else if (status === 'rejected') {
    return <XCircle className="h-6 w-6 text-red-500" />;
  } else {
    return <Clock className="h-6 w-6 text-yellow-500" />;
  }
};
