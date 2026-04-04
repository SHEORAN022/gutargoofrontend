import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCategoryListingAPI,addCategoryAPI } from "../api/category.js";
import { message, Modal, Table } from "antd";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function Categories() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formIsActive, setFormIsActive] = useState(true);

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  // Add category mutation
  const addMutation = useMutation({
    mutationFn: async (category: {
      name: string;
      slug: string;
      description?: string | null;
      icon?: string | null;
      parent_id?: string | null;
      is_active?: boolean;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from("categories")
        .insert([category])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category added successfully");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormIcon("");
    setFormParentId(null);
    setFormIsActive(true);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };
    const [open, setOpen] = useState(false);
    const [form,setForm] = useState({})

  const [categoryData, setCategoryData] = useState([]);
  const [loading,setLoading] = useState(false)
  const addCategory  = async ()=>{
    try{
      if(form?.name===""){
        message.error("Category Name is required ")
        return 
      }
      const res = await addCategoryAPI(form)
      if(res?.status===201){
        setOpen(false)
        setForm({})
      }
      
    }
    catch(error){
      console.log(error)
      message.error(error?.data?.message || "Something went wrong")
    }
  }
  const BannerTable = () => {
    const columns = [
      {
        title: "Category Name",
        key: "name",
        align: "center",
        dataIndex:"name"
      },

      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: (_, banner) => (
          <div className="flex gap-1">
            <Button
              // onClick={() => {
              //   setDeleteId(banner?._id);
              //   setOpen(true);
              // }}
              variant="ghost"
              size="icon"
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ];

    return (
      <Table columns={columns} dataSource={categoryData} pagination={false} />
    );
  };

  const getCategoryData = async () => {
    try {
      const res = await getCategoryListingAPI();
      console.log(res, "get tesss");
      setLoading(true)
      if (res?.status === 200) {
        const Response = res?.data?.data || [];
        setCategoryData(Response);
        setLoading(false)
      }
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoading(false)
    }
  };
  useEffect(() => {
    getCategoryData();
  }, []);


   if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <>
     <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage content categories for your platform
          </p>
        </div>
        <Button className="gap-2" onClick={()=>setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>
      <BannerTable />
    </div>
            <Modal maskClosable={false} title={(<><div className="text-xl font-bold">Add Category</div></>)} footer={false} open={open} width={800}  onCancel={()=>setOpen(false)} >

            <div className="   rounded-2xl ">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Title"
                      className="border p-2 rounded"
                      value={form?.name}
                      onChange={(e) =>setForm({...form,name:e?.target?.value})}
                    />
                  </div>
                  
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                 <button
                onClick={()=>{
                  setForm({})
                  setOpen(false)
                }}
                className="border px-4 py-2 rounded">Cancel</button>
                <Button onClick={()=>addCategory()}>Submit</Button>
              </div>
            </div>
    </Modal>


    </>
   
  );
}
