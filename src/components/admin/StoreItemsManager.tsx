
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Edit2, Trash2, Image, Euro, Gamepad2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Preis muss größer als 0 sein"),
  currency: z.enum(["EUR", "ROBUX"]),
  image_url: z.string().url("Gültige URL erforderlich"),
  product_url: z.string().url("Gültige URL erforderlich"),
});

type StoreItemFormData = z.infer<typeof formSchema>;

const StoreItemsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  
  const form = useForm<StoreItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'ROBUX',
      image_url: '',
      product_url: '',
    },
  });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (currentItem) {
      form.reset({
        name: currentItem.name,
        description: currentItem.description || '',
        price: currentItem.price,
        currency: currentItem.currency,
        image_url: currentItem.image_url || '',
        product_url: currentItem.product_url,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        currency: 'ROBUX',
        image_url: '',
        product_url: '',
      });
    }
  }, [currentItem, form]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching store items:', error);
      toast({
        title: 'Fehler',
        description: 'Artikel konnten nicht geladen werden',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: StoreItemFormData) => {
    setIsSubmitting(true);
    try {
      let result;
      
      if (currentItem) {
        // Update existing item
        result = await supabase
          .from('store_items')
          .update(data)
          .eq('id', currentItem.id)
          .select()
          .single();
      } else {
        // Insert new item
        result = await supabase
          .from('store_items')
          .insert(data)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      toast({
        title: 'Erfolg',
        description: currentItem ? 'Artikel aktualisiert' : 'Artikel erstellt',
      });
      
      setIsFormDialogOpen(false);
      setCurrentItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error saving store item:', error);
      toast({
        title: 'Fehler',
        description: 'Artikel konnte nicht gespeichert werden',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const { error } = await supabase
        .from('store_items')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;
      
      toast({
        title: 'Erfolg',
        description: 'Artikel gelöscht',
      });
      
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (error) {
      console.error('Error deleting store item:', error);
      toast({
        title: 'Fehler',
        description: 'Artikel konnte nicht gelöscht werden',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setIsFormDialogOpen(true);
  };

  const handleAddClick = () => {
    setCurrentItem(null);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Clothing Store verwalten</h2>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" /> Artikel hinzufügen
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Alle Artikel</TabsTrigger>
            <TabsTrigger value="robux">Robux Artikel</TabsTrigger>
            <TabsTrigger value="euro">Euro Artikel</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ItemsList 
              items={items} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick} 
            />
          </TabsContent>
          
          <TabsContent value="robux">
            <ItemsList 
              items={items.filter(item => item.currency === 'ROBUX')} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick} 
            />
          </TabsContent>
          
          <TabsContent value="euro">
            <ItemsList 
              items={items.filter(item => item.currency === 'EUR')} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentItem ? 'Artikel bearbeiten' : 'Neuer Artikel'}</DialogTitle>
            <DialogDescription>
              Füge Details zum Clothing Store Artikel hinzu.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Produktname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Produktbeschreibung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Preis</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Währung</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Währung auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ROBUX">Robux</SelectItem>
                          <SelectItem value="EUR">Euro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bild URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Bild-URL für die Produktvorschau
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produkt URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/product" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link, auf den Nutzer beim Klick auf "Kaufen" weitergeleitet werden
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Speichern...
                    </>
                  ) : (
                    'Speichern'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Artikel löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du "{itemToDelete?.name}" löschen möchtest? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ItemsList = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Keine Artikel gefunden</p>
      </div>
    );
  }

  const getCurrencyIcon = (currency) => {
    return currency === 'EUR' ? <Euro className="h-4 w-4" /> : <Gamepad2 className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      {items.map((item) => (
        <Card key={item.id}>
          <div className="aspect-video overflow-hidden bg-gray-100">
            <img 
              src={item.image_url || '/placeholder.svg'} 
              alt={item.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            {item.description && (
              <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {getCurrencyIcon(item.currency)}
                <span className="ml-1 font-semibold">{item.price} {item.currency === 'EUR' ? '€' : 'R$'}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StoreItemsManager;
