import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getCategoryListingAPI,
  addCategoryAPI,
  editCategoryAPI,
  deleteCategoryAPI,
} from "../api/category.js";
import { Input, message, Modal, Select, Spin, Table } from "antd";
import CommonDeleteModal from "../components/AntdComponents/Modal";
import axios from "axios";

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
  const API_BASE_URL =import.meta.env.VITE_BACKEND_URL || "https://gutargooplus.com/api/api"
  
  // Create axios instance
   const api = axios.create({
    baseURL: API_BASE_URL,
    // withCredentials: true,
    // headers: {
    //   'Content-Type': 'application/json',
    // },
  });
  
  // ✅ Add request interceptor
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
  
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
  
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

const categoryAPI = '/category'

 const getCategoryListingAPI = async () => await api.get(categoryAPI)

 const addCategoryAPI = async (body) => await api.post(categoryAPI,body)

 const deleteCategoryAPI = async (id) => await api.delete(categoryAPI+"/"+id)


 const editCategoryAPI = async (id,data) => await api.put(categoryAPI+"/"+id,data)
  const {Option} = Select

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
  const [form, setForm] = useState({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const deleteCategory = async () => {
    try {
      setDeleteLoading(true);
      const res = await deleteCategoryAPI(deleteId);
      if (res?.status === 200) {
        setDeleteOpen(false);
        getCategoryData();
        message.success("Category Delete Successfully");
      }
    } catch (error) {
      setDeleteLoading(false);
      setDeleteOpen(false);

      console.log(error);
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };
  const [editData, setEditData] = useState(false);

  const onEdit = (data) => {
    // setEditData(!editData)
    // setDialogOpen(true)
    // const Response = data?.data
    setEditData(true);
    setOpen(true);
    setDeleteId(data?._id);
    setForm({
      name: data?.name,
      categoryType:data?.categoryType
    });
  };
  const BannerTable = () => {
    const columns = [
      {
        title: "Category Name",
        key: "name",
        align: "center",
        dataIndex: "name",
      },

      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: (_, banner) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(banner)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setDeleteId(banner?._id);
                setDeleteOpen(true);
              }}
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
      setLoading(true);
      if (res?.status === 200) {
        const Response = res?.data?.data || [];
        setCategoryData(Response);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getCategoryData();
  }, []);
  const [categoryAddLoading, setCategoryAddLoading] = useState(false);
  const addCategory = async () => {
    try {
      setCategoryAddLoading(true);
      if (form?.name === "") {
        message.error("Category Name is required ");
        return;
      }
      const res = editData
        ? await editCategoryAPI(deleteId, form)
        : await addCategoryAPI(form);
      if (res?.status === 201 || res?.status === 200) {
        if (editData) {
          setEditData(false);
        }
        setOpen(false);
        setForm({});
        getCategoryData();
      }
    } catch (error) {
      console.log(error);
      message.error(error?.data?.message || "Something went wrong");
    } finally {
      setCategoryAddLoading(false);
    }
  };
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
          <Button
            className="gap-2"
            onClick={() => {
              setEditData(false);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
        <BannerTable />
      </div>
      <Modal
      closable={false}
        maskClosable={false}
        title={
          <>
            <div className="text-xl font-bold">
              {editData ? "Edit" : "Add"} Category
            </div>
          </>
        }
        footer={false}
        open={open}
        width={800}
        onCancel={() => setOpen(false)}
      >
        <div className="   rounded-2xl ">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Title"
                  className="border p-2 rounded"
                  value={form?.name}
                  onChange={(e) => setForm({ ...form, name: e?.target?.value })}
                />
              </div>
               <div>
          <label className="block text-sm font-medium mb-1">Category Type</label>
          <Select
            className="w-full"
            value={form?.categoryType}
                  onChange={(e) => setForm({ ...form, categoryType: e })}
          >
            {/* <Option value="home">Home</Option> */}
            <Option value="movie">Movie</Option>
            <Option value="webseries">Webseries</Option>
            <Option value="tvshows">Tv Shows</Option>
          </Select>
        </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => {
                setForm({});
                setOpen(false);
                                setEditData(false);

              }}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
            <Button onClick={() => addCategory()}>
              {categoryAddLoading ? (
                <Spin />
              ) : (
                <>{editData ? "Update" : "Submit"}</>
              )}
            </Button>
          </div>
        </div>
      </Modal>
      <CommonDeleteModal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={deleteCategory}
        loading={deleteLoading}
      />
    </>
  );
}
