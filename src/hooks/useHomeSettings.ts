import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface HomeSetting {
  id: string;
  setting_key: string;
  setting_value: { value: any };
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useHomeSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["home-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_settings")
        .select("*")
        .order("setting_key");

      if (error) throw error;
      return data as HomeSetting[];
    },
  });

  const getSettingValue = (key: string, defaultValue: any = null) => {
    const setting = settings.find((s) => s.setting_key === key);
    return setting?.setting_value?.value ?? defaultValue;
  };

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await supabase
        .from("home_settings")
        .update({ setting_value: { value } })
        .eq("setting_key", key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-settings"] });
      toast({ title: "Setting updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating setting", description: error.message, variant: "destructive" });
    },
  });

  return {
    settings,
    isLoading,
    getSettingValue,
    updateSetting,
  };
}
