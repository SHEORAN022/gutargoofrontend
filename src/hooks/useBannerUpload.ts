import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useBannerUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, folder: string = "banners"): Promise<string | null> => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("banners").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlParts = url.split("/banners/");
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];
      const { error } = await supabase.storage.from("banners").remove([filePath]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  };

  return { uploadImage, deleteImage, uploading };
}
