import { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeliveryPhotoUploadProps {
  orderId: string;
  onPhotoUploaded: (url: string) => void;
  existingPhotoUrl?: string | null;
}

const DeliveryPhotoUpload = ({ orderId, onPhotoUploaded, existingPhotoUrl }: DeliveryPhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('delivery-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('delivery-photos')
        .getPublicUrl(fileName);

      // Update order with photo URL
      await supabase
        .from('orders')
        .update({ delivery_photo_url: publicUrl })
        .eq('id', orderId);

      onPhotoUploaded(publicUrl);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const clearPhoto = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Delivery Photo</label>
      
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Delivery" 
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={clearPhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
            <Check className="h-3 w-3" />
            Photo uploaded
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <>
                <Camera className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Tap to take or upload a photo
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!previewUrl && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      )}
    </div>
  );
};

export default DeliveryPhotoUpload;
