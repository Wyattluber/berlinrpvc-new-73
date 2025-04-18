
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import StoreItemsWrapper from '@/components/admin/StoreItemsWrapper';

const StoreItemsManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Clothing Store verwalten
        </CardTitle>
        <CardDescription>
          Füge neue Artikel hinzu oder bearbeite bestehende Produkte im Shop.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StoreItemsWrapper />
      </CardContent>
    </Card>
  );
};

export default StoreItemsManagement;
