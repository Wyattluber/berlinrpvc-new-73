
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const partnerFormSchema = z.object({
  discordInvite: z.string().min(1, {
    message: 'Discord Einladungslink ist erforderlich',
  }),
  memberCount: z.coerce.number().min(1, {
    message: 'Bitte gib eine gültige Mitgliederzahl ein',
  }),
  reason: z.string().min(10, {
    message: 'Bitte gib einen ausführlichen Grund an (min. 10 Zeichen)',
  }),
  expectations: z.string().min(10, {
    message: 'Bitte beschreibe deine Erwartungen (min. 10 Zeichen)',
  }),
  advertisement: z.string().min(10, {
    message: 'Bitte gib einen Text für die Partnerwerbung an (min. 10 Zeichen)',
  }),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

const PartnershipRequestForm = () => {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      discordInvite: '',
      memberCount: undefined,
      reason: '',
      expectations: '',
      advertisement: '',
    },
  });
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });
  
  const uploadLogo = async (file: File, partnerId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${partnerId}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('partner-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
        
      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return null;
      }
      
      const { data: urlData } = supabase.storage
        .from('partner-assets')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in logo upload:', error);
      return null;
    }
  };
  
  const onSubmit = async (values: PartnerFormValues) => {
    if (!session) {
      toast({
        title: 'Fehler',
        description: 'Du musst eingeloggt sein, um eine Partnerschaft zu beantragen.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(10);
    
    try {
      // First, insert the partnership application
      const { data: partnerData, error: partnerError } = await supabase
        .from('partner_applications')
        .insert([
          {
            user_id: session.user.id,
            discord_invite: values.discordInvite,
            member_count: values.memberCount,
            reason: values.reason,
            expectations: values.expectations,
            advertisement: values.advertisement,
            is_renewal: false,
            is_active: false,
            status: 'pending',
          },
        ])
        .select()
        .single();
        
      if (partnerError) throw partnerError;
      setUploadProgress(50);
      
      // If a logo was provided, upload it
      let logoUrl = null;
      if (logoFile && partnerData) {
        logoUrl = await uploadLogo(logoFile, partnerData.id);
        setUploadProgress(80);
        
        // Update the partner application with the logo URL
        if (logoUrl) {
          const { error: updateError } = await supabase
            .from('partner_applications')
            .update({ logo_url: logoUrl })
            .eq('id', partnerData.id);
            
          if (updateError) {
            console.error('Error updating logo URL:', updateError);
          }
        }
      }
      setUploadProgress(100);
      
      toast({
        title: 'Anfrage eingereicht',
        description: 'Deine Partnerschaftsanfrage wurde erfolgreich eingereicht.',
      });
      
      form.reset();
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      console.error('Error submitting partnership request:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Einreichen der Partnerschaftsanfrage. Bitte versuche es später erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="discordInvite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discord Einladungslink (vollständiger Link)</FormLabel>
              <FormControl>
                <Input placeholder="z.B. https://discord.gg/berlinrpvc" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="memberCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anzahl der Mitglieder</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Server Logo (optional)</FormLabel>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-6 mt-2 cursor-pointer text-center transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            
            {logoPreview ? (
              <div className="flex flex-col items-center">
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  className="w-24 h-24 object-contain mb-4"
                />
                <p className="text-sm text-gray-500">Klicken zum Ändern</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  {isDragActive
                    ? 'Datei hier ablegen'
                    : 'Logo hier ablegen oder klicken zum Auswählen'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG oder GIF, max. 5MB
                </p>
              </div>
            )}
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warum möchtest du eine Partnerschaft eingehen?</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Beschreibe, warum du eine Partnerschaft mit uns eingehen möchtest..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="expectations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Was erwartest du von der Partnerschaft?</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Beschreibe deine Erwartungen an die Partnerschaft..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="advertisement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Werbung für den Partnerbereich</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Gib hier den Text ein, den wir in unserem Partnerbereich anzeigen sollen..." 
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Anfrage wird eingereicht...
            </>
          ) : (
            'Partnerschaftsanfrage einreichen'
          )}
        </Button>
        
        {isSubmitting && uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </form>
    </Form>
  );
};

export default PartnershipRequestForm;
