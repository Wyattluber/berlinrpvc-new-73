
import React, { useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Upload, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileImageUploadProps {
  userId: string;  // Changed from uid to userId
  existingImageUrl?: string; // Changed from url to existingImageUrl
  onImageUploaded: (url: string) => void; // Changed from onUploadComplete to onImageUploaded
  size?: number;
}

const ProfileImageUpload = ({ userId, existingImageUrl, onImageUploaded, size = 100 }: ProfileImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Das Bild darf maximal 5MB groß sein.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wähle ein Bild (JPG, PNG, etc.).",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Create storage bucket if it doesn't exist (this will be handled by SQL migration)
      
      // Upload image to Supabase Storage
      const fileName = `avatar-${userId}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      if (!urlData.publicUrl) throw new Error("Couldn't get public URL");
      
      // Update user metadata with avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: urlData.publicUrl
        }
      });
      
      if (updateError) throw updateError;
      
      onImageUploaded(urlData.publicUrl);
      
      toast({
        title: "Bild hochgeladen",
        description: "Dein Profilbild wurde erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Hochladen des Bildes.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className={`w-${size/4} h-${size/4} border-2 border-blue-100`} style={{ width: size, height: size }}>
          <AvatarImage src={existingImageUrl} alt="Profilbild" />
          <AvatarFallback className="bg-blue-600 text-white">
            <Image className="w-10 h-10" />
          </AvatarFallback>
        </Avatar>
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleFileUpload}
        >
          <Upload className="w-8 h-8 text-white" />
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button 
        onClick={handleFileUpload}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Wird hochgeladen...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Bild ändern
          </>
        )}
      </Button>
    </div>
  );
};

export default ProfileImageUpload;
