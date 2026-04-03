import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  login_method: string;
  subscription_plan: string;
  status: string;
  devices_count: number;
  total_watch_time: number;
  last_active_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppUserFormData {
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  login_method: string;
  subscription_plan: string;
  status: string;
  notes?: string;
}

export function useAppUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: AppUserFormData) => {
    try {
      const { data, error } = await supabase
        .from("app_users")
        .insert([userData])
        .select()
        .single();

      if (error) throw error;

      setUsers((prev) => [data, ...prev]);
      toast({
        title: "User created",
        description: `${userData.name} has been added successfully.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<AppUserFormData>) => {
    try {
      const { data, error } = await supabase
        .from("app_users")
        .update(userData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
      toast({
        title: "User updated",
        description: "User details have been updated successfully.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase.from("app_users").delete().eq("id", id);

      if (error) throw error;

      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({
        title: "User deleted",
        description: "User has been removed from the system.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    return updateUser(id, { status: newStatus });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  };
}
