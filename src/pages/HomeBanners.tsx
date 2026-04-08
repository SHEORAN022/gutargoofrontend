import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { ImageOffIcon, Pencil, Plus, Trash2 } from "lucide-react";

import axios from "axios";
import { toast } from "sonner";
// import { getAllBannersAPI, deleteBannerAPI,addBannerAPI } from "../api/banner";
// import {
//   getAllBannersAPI,
//   deleteBannerAPI,
//   addBannerAPI,
//   editBannerAPI,
// } from "../api/banner";
import CommonDeleteModal from "../components/AntdComponents/Modal";
// import { getMoviesSelectAPI, getCategoriesAPI } from "../api/movies";
import { Image, Input, message, Modal, Select, Spin, Table } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WebSeries from "./WebSeries";

export default function HomeBanners() {
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
  const bannerAPI = "/banners"

const getMoviesSelect = "/movies"
const getCategories = "/category"
 const getMoviesSelectAPI = async (params)=> await api.get(getMoviesSelect,{params})
 const getCategoriesAPI = async ()=>await api.get(getCategories)
   const getAllBannersAPI = async() => await api.get(bannerAPI) 
   const deleteBannerAPI = async (id)=> await api.delete(bannerAPI+"/"+id)
  
   const addBannerAPI = async (body)=> await api.post(bannerAPI,body)
  
   const editBannerAPI  = async(id,data) => await api.put(bannerAPI+"/"+id,data)
  const [form, setForm] = useState({});
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewBannerLogo, setPreviewBannerLogo] = useState(null);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    const file = files[0];
    // setForm({ ...form, [name]: file });

    setForm((prev) => ({
      ...prev,
      [name]: file,
    }));

    const makePreview = (setter) => {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    };

    if (name === "logoImage") makePreview(setPreviewLogo);
    if (name === "bannerImage") makePreview(setPreviewBannerLogo);
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const BannerTable = () => {
    const columns = [
      {
        title: "Banner Image",
        dataIndex: "bannerImage",
        key: "bannerImage",
        render: (img, banner) =>
          banner.bannerImage?.url ? (
            <img
              src={banner.bannerImage?.url}
              alt=""
              className="h-12 w-20 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-20 items-center justify-center rounded bg-muted">
              <ImageOffIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          ),
      },
      {
        title: "Mobile Image",
        dataIndex: "mobileImage",
        key: "mobileImage",
        render: (img, banner) =>
          banner.logoImage?.url ? (
            <img
              src={banner.logoImage?.url}
              alt=""
              className="h-12 w-20 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-20 items-center justify-center rounded bg-muted">
              <ImageOffIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          ),
      },
      {
        title: "Title",
        key: "title",
        align: "center",
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{record.title || "No Title"}</div>
          </div>
        ),
      },
      {
        title: "Category",
        dataIndex: "categoryId",
        key: "categoryId",
        align: "center",
        render: (data) => {
          return (
            <>
              <div style={{ fontWeight: 500 }}>{data?.name}</div>
            </>
          );
        },
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
                setOpen(true);
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
      <Table
        columns={columns}
        dataSource={banners}
        rowKey="_id" // or "id" depending on your data
        pagination={false}
        loading={isLoading}
        scroll={{x:'max-content'}}

      />
    );
  };

  const [allMovies, setAllMovies] = useState([]);

  const getMoviesData = async () => {
    try {
      const res = await getMoviesSelectAPI();
      const Response =
        res?.data?.data?.map((item) => ({
          label: item?.movieTitle,
          value: item?._id,
        })) || [];
      setAllMovies(Response);
    } catch (error) {
      console.log(error);
    }
  };
  // const [editData,setEditData] = useState(false)
  const [editData, setEditData] = useState(false);
  const [editId, setEditId] = useState(null);
  // const onEdit = (data) =>{
  //   // setEditData(!editData)
  //   // setDialogOpen(true)
  //   console.log(data,'data deeee')
  //   // const Response = data?.data
  //   setEditData(!editData)
  //   setDialogOpen(true)
  //   setPreviewBannerLogo(data?.bannerImage?.url)
  //   setPreviewLogo(data?.logoImage?.url)
  //   setForm({
  //     title:data?.title,
  //     bannerImage:data?.bannerImage||"",
  //     categoryId:data?.categoryId?._id || "",
  //     logoImage:data?.logoImage || "",
  //     WebSeries:data?.movieId ||"",
  //     movies:data?.movieId || ""

  //   })

  // }

  const onEdit = (data) => {
    setEditData(true); // ✅ always true (no toggle)
    setEditId(data?._id); // ✅ VERY IMPORTANT (ID store karo)

    setDialogOpen(true);

    setPreviewBannerLogo(data?.bannerImage?.url || null);
    setPreviewLogo(data?.logoImage?.url || null);

    setForm({
      title: data?.title || "",
      bannerImage: data?.bannerImage || "",
      categoryId: data?.categoryId?._id || "",
      logoImage: data?.logoImage || "",
      webseries: data?.movieId?._id || "",
      movieId: data?.movieId?._id || "",
    });
  };

  const [bannerLoading, setBannerLoading] = useState(false);

  const addBannerAPIData = async () => {
    
 if (
  (form?.title === "" || form?.title === undefined) ||
  (form?.categoryId === "" || form?.categoryId === undefined)
) {
  message.error("Title and Category is required");
  return;
}

if(!form?.bannerImage){
   message.error("Banner Image is required")
  return
}
if(!form?.logoImage){
   message.error("Logo Image is required")
  return
}

    try {
     
      setBannerLoading(true);
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        const value = form[key];

        // if (!value) return;

        if (value === undefined || value === null) return;

        if (["logoImage", "bannerImage"].includes(key)) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (value?.url) {
            formData.append(`existing_${key}`, value.url);
          }
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            formData.append(key, JSON.stringify(value));
          }
        } else {
          formData.append(key, value);
        }
      });

      let res;

      // 🔥 EDIT CASE
      if (editData && editId) {
        res = await editBannerAPI(editId, formData);
      }
      // ➕ ADD CASE
      else {
        res = await addBannerAPI(formData);
      }

      if (res?.status === 200 || res?.status === 201) {
          setForm({});
        setPreviewBannerLogo(null);
        setPreviewLogo(null);

        setEditData(false);
        setEditId(null);

        fetchBanners();

        setDialogOpen(false);
      

        message.success(editData ? "Banner Updated" : "Banner Added");
      }

      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      setBannerLoading(false);
    }
  };

  const [categories, setCategories] = useState([]);
  const fetchCategories = async () => {
    try {
      const res = await getCategoriesAPI();
      const Response = res?.data?.data?.map((item) => ({
        label: item?.name,
        value: item?._id,
      }));
      setCategories(Response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMoviesData();
    fetchCategories();
  }, []);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const deleteBanner = async () => {
    try {
      setDeleteLoading(true);
      const res = await deleteBannerAPI(deleteId);
      if (res?.status === 200) {
        setOpen(false);
        fetchBanners();
        message.success("Banner Delete Successfully");
      }
    } catch (error) {
      setDeleteLoading(false);
      setOpen(false);

      console.log(error);
    } finally {
      setDeleteLoading(false);
    }
  };
  const fetchBanners = async () => {
    try {
      // const response = await API.get("/public/banner/banners");
      const response = await getAllBannersAPI();
      if (response?.status === 200) {
        const Data = response?.data?.data || [];

        setBanners(Data);
        setIsLoading(false);
      }
      // setMovies(response.data.data || []);
    } catch {
      toast.error("Failed to fetch movies");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchBanners();
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // const openCreateDialog = () => {
  //   setEditingBanner(null);

  //   setDialogOpen(true);
  // };

  const openCreateDialog = () => {
    setEditData(false);
    setEditId("");
    setForm({});
    setPreviewBannerLogo(null);
    setPreviewLogo(null);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hero Banner Manager</h1>
            <p className="text-sm text-muted-foreground">
              Manage home screen hero banners - Genre is auto-fetched from
              selected content
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Banner
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Active Banners ({banners.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : banners.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No banners yet. Create your first banner!
              </p>
            ) : (
              <BannerTable />
            )}
          </CardContent>
        </Card>
      </div>
      <CommonDeleteModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={deleteBanner}
        loading={deleteLoading}
      />
      <Modal
      closable={false}
        maskClosable={false}
        title={
          <>
            <div className="text-xl font-bold">
              {editData ? "Edit" : "Add"} Banner
            </div>
          </>
        }
        footer={false}
        open={dialogOpen}
        width={800}
        onCancel={() => setDialogOpen(false)}
      >
        <div className="   rounded-2xl ">
          {/* BASIC INFO */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Title"
                  className="border p-2 rounded"
                  value={form?.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Movies
                </div>
                <Select
                  showSearch={true}
                  placeholder="Select Movies"
                  className="border p-2 rounded w-full"
                  value={form?.movieId}
                  // onChange={(e) =>handleChange("movieId",e?.target?.value)}
                  onChange={(e) => setForm({ ...form, movieId: e })}
                  options={allMovies}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
                {/* 
                      {allMovies?.map((item) => (
                        <option
                          key={item.value || item._id}
                          value={item.value || item._id}
                        >
                          {item.label || item.name}
                        </option>
                      ))}
                    </Select> */}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Webseries
                </div>
                <Select
                  placeholder="Select Webseries"
                  className="border p-2 rounded !w-full"
                  value={form?.webseries}
                  onChange={(e) => setForm({ ...form, webseries: e })}
                  options={allMovies}
                  showSearch
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Categories <span className="text-red-500">*</span>
                </div>
                <Select
                  placeholder="Select Category"
                  className="border p-2 rounded !w-full"
                  value={form?.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e })}
                  options={categories}
                  showSearch
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2   gap-3">
              <div className="image-upload-card  boxShadowData">
                <h4 className="text-xl"> Banner Image</h4>
                <p className="image-hint">PNG preferred, transparent bg</p>
                <div className="file-upload">
                  <input
                    type="file"
                    name="bannerImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    id="bannerImage"
                    className="h-[10vh]"
                  />

                  <label htmlFor="bannerImage" className="image-upload-label">
                    {previewBannerLogo || form?.bannerImage ? (
                      <img
                        className="h-[300px] w-[200px]"
                        src={previewBannerLogo || form?.bannerImage?.url}
                        alt="Banner preview"
                      />
                    ) : (
                      <div className="image-placeholder">
                        <span>🏷️</span>
                        <p>Upload Logo</p>
                      </div>
                    )}
                    <div className="image-overlay">📷 Change</div>
                  </label>
                </div>
              </div>

              <div className="image-upload-card box boxShadowData">
                <h4 className="text-xl"> Mobile Logo Image</h4>
                <p className="image-hint">PNG preferred, transparent bg</p>
                <div className="file-upload">
                  <input
                    type="file"
                    name="logoImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    id="logoImage"
                  />
                  <label htmlFor="logoImage" className="image-upload-label">
                    {previewLogo || form?.logoImage ? (
                      <img
                        // src={previewLogo || form?.logoImage}
                        src={previewLogo || form?.logoImage?.url}
                        alt="Logo Preview"
                        className="h-[300px] w-[200px]"
                      />
                    ) : (
                      <div className="image-placeholder">
                        <span>🏷️</span>
                        <p>Upload Logo</p>
                      </div>
                    )}
                    <div className="image-overlay">📷 Change</div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => {
                setForm({});
                setPreviewBannerLogo(null);
                setPreviewLogo(null);
                setEditData(false);
                setEditId(null);
                setDialogOpen(false);
              }}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
            {/* <Button onClick={()=>addBannerAPIData()}>Submit</Button> */}

            <Button onClick={addBannerAPIData}>
              {bannerLoading ? (
                <Spin />
              ) : (
                <> {editData ? "Update" : "Submit"}</>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      
    </>
  );
}
