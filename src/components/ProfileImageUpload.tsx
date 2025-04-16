
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image } from 'lucide-react';

interface ProfileImageUploadProps {
  userId: string;
  existingImageUrl?: string;
  onImageUploaded: (url: string) => void;
  size?: number;
}

const ProfileImageUpload = ({ 
  existingImageUrl, 
  size = 100 
}: ProfileImageUploadProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="border-2 border-blue-100" style={{ width: size, height: size }}>
        <AvatarImage src={existingImageUrl} alt="Profilbild" />
        <AvatarFallback className="bg-blue-600 text-white">
          <Image className="w-10 h-10" />
        </AvatarFallback>
      </Avatar>
      <p className="text-xs text-gray-500">Profilbild synchronisiert von Discord</p>
    </div>
  );
};

export default ProfileImageUpload;
