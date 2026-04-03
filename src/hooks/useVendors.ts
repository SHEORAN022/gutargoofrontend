import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  status: "active" | "inactive" | "suspended" | "pending";
  total_content: number;
  pending_content: number;
  commission_rate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorFormData {
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  address?: string;
  status: "active" | "inactive" | "suspended" | "pending";
  commission_rate?: number;
  notes?: string;
}

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVendors((data as Vendor[]) || []);
    } catch (error: any) {
      toast({
        title: "Error fetching vendors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createVendor = async (vendorData: VendorFormData) => {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .insert([vendorData])
        .select()
        .single();

      if (error) throw error;

      setVendors((prev) => [data as Vendor, ...prev]);
      toast({
        title: "Vendor created",
        description: `${vendorData.name} has been added successfully.`,
      });
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error creating vendor",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateVendor = async (id: string, vendorData: Partial<VendorFormData>) => {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .update(vendorData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setVendors((prev) =>
        prev.map((v) => (v.id === id ? (data as Vendor) : v))
      );
      toast({
        title: "Vendor updated",
        description: "Vendor details have been updated successfully.",
      });
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error updating vendor",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from("vendors")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setVendors((prev) => prev.filter((v) => v.id !== id));
      toast({
        title: "Vendor deleted",
        description: "Vendor has been removed successfully.",
      });
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error deleting vendor",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateVendorStatus = async (id: string, status: Vendor["status"]) => {
    return updateVendor(id, { status });
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return {
    vendors,
    isLoading,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    updateVendorStatus,
  };
}
