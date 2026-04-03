import { useState, useMemo, useEffect } from "react";
import {
  HomeBanner,
  BannerFormData,
  AppTab,
  CtaRedirectType,
} from "@/hooks/useHomeBanners";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



import {
  Plus,
  Trash2,
  Image,
} from "lucide-react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import axios from "axios";
import { toast } from "sonner";
import { getAllBannersAPI, deleteBannerAPI,addBannerAPI } from "../api/banner";
import CommonDeleteModal from "../components/AntdComponents/Modal";
import { getMoviesSelectAPI, getCategoriesAPI } from "../api/movies";
import { Table } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export default function HomeBanners() {
  // const { banners, isLoading, createBanner, updateBanner, deleteBanner, reorderBanners } = useHomeBanners();
  const API = axios.create({
    baseURL: "https://gutargoobackend-cem4.onrender.com/api",
    timeout: 300000,
  });

  API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  const [form, setForm] = useState({
    title: "",
    logoImage: "",
    bannerImage: "",
    movies: "",
    webseries: "",
    categoryId: "",
  });
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewBannerLogo, setPreviewBannerLogo] = useState(null);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    const file = files[0];
    setForm({ ...form, [name]: file });

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
        title: "Mobile Image",
        dataIndex: "mobileImage",
        key: "mobileImage",
        render: (img, banner) =>
          banner?.mobileImage ? (
            <img
              src={banner.mobileImage}
              alt=""
              className="h-12 w-20 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-20 items-center justify-center rounded bg-muted">
              <Image className="h-5 w-5 text-muted-foreground" />
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
            <div style={{ fontSize: 12, color: "#888" }}>{record.subtitle}</div>
          </div>
        ),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        align: "center",
      },
      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: (_, banner) => (
          <div className="flex gap-1">
            {/* <Button variant="ghost" size="icon" onClick={() => onEdit(banner)}>
              <Pencil className="h-4 w-4" />
            </Button> */}

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
      console.log(res, "get the reee");
    } catch (error) {
      console.log(error);
    }
  };

const addBannerAPIData  = async ()=>{
  try{
    const res = await addBannerAPI(form)
    console.log(res,'add the banner data here ')
  }
  catch(error){
    console.log(error)
  }
}


  const [categories, setCategories] = useState([]);
  const fetchCategories = async () => {
    try {
      const res = await getCategoriesAPI();
      console.log(res, "reee");
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
        toast.success("Banner Delete Successfully");
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
      console.log(response, "ressss");
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
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    subtitle: "",
    background_image_url: "",
    mobile_image_url: "",
    logo_image_url: "",
    cta_text: "Watch Now",
    cta_redirect_type: "movie",
    content_id: "",
    is_active: true,
    display_order: 0,
    auto_slide_duration: 5,
    allow_swipe: true,
    visible_tabs: ["home"],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.id === active.id);
      const newIndex = banners.findIndex((b) => b.id === over.id);
      const newOrder = arrayMove(banners, oldIndex, newIndex);
      reorderBanners.mutate(newOrder.map((b) => b.id));
    }
  };

  const openCreateDialog = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      background_image_url: "",
      mobile_image_url: "",
      logo_image_url: "",
      cta_text: "Watch Now",
      cta_redirect_type: "movie",
      content_id: "",
      is_active: true,
      display_order: banners.length,
      auto_slide_duration: 5,
      allow_swipe: true,
      visible_tabs: ["home"],
    });
    setDialogOpen(true);
  };

  const openEditDialog = (banner: HomeBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      background_image_url: banner.background_image_url,
      mobile_image_url: banner.mobile_image_url || "",
      logo_image_url: banner.logo_image_url || "",
      cta_text: banner.cta_text || "Watch Now",
      cta_redirect_type: banner.cta_redirect_type,
      content_id: banner.content_id || "",
      is_active: banner.is_active,
      display_order: banner.display_order,
      auto_slide_duration: banner.auto_slide_duration || 5,
      allow_swipe: banner.allow_swipe ?? true,
      visible_tabs: banner.visible_tabs,
    });
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
              Active Banners ({banners.filter((b) => b.is_active).length})
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
              // <DndContext
              //   sensors={sensors}
              //   collisionDetection={closestCenter}
              //   onDragEnd={handleDragEnd}
              // >
              //   <Table>
              //     <TableHeader>
              //       <TableRow>
              //         <TableHead className="w-24">Mobile Image</TableHead>
              //         <TableHead>Title</TableHead>
              //         <TableHead>Description</TableHead>
              //         <TableHead className="w-20">Actions</TableHead>
              //       </TableRow>
              //     </TableHeader>
              //     <TableBody>
              //       <SortableContext
              //         items={banners.map((b) => b.id)}
              //         strategy={verticalListSortingStrategy}
              //       >
              //         {banners?.map((banner) => (
              //           <SortableBannerRow
              //             key={banner.id}
              //             banner={banner}
              //             onEdit={openEditDialog}
              //           />
              //         ))}
              //       </SortableContext>
              //     </TableBody>
              //   </Table>
              // </DndContext>
              <BannerTable />
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Edit Banner" : "Create New Banner"}
              </DialogTitle>
            </DialogHeader>

            <div className="   rounded-2xl ">
              {/* BASIC INFO */}
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Title"
                      className="border p-2 rounded"
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="block text-sm font-medium text-gray-700 mb-1">
                      Movies
                    </div>
                    {/* <Select
                      className="border p-2 rounded w-full"
                      value={form.movies}
                      onChange={(e) => console.log(e,'get event here ')}
                    >
                      {allMovies?.map((item) => (
                        <Option key={item._id} value={item._id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select> */}
                    <select
                      className="border p-2 rounded w-full"
                      value={form.movies}
                      // onChange={(e) =>handleChange("movies",e?.target?.value)}
                      onChange={(e) =>{console.log(e,'valjueee')}}
                    >

                      {allMovies?.map((item) => (
                        <option
                          key={item.value || item._id}
                          value={item.value || item._id}
                        >
                          {item.label || item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {console.log(form,'form her ')}
                <div className="grid grid-cols-2 gap-0">
                  <div className="w-[50%]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Webseries
                    </label>
                     <select
                      className="border p-2 rounded w-full"
                      value={form.webseries||""}
                      onChange={(e) =>handleChange("webseries",e?.target?.value)}
                    >
                      {allMovies?.map((item) => (
                        <option
                          key={item.value || item._id}
                          value={item.value || item._id}
                        >
                          {item.label || item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-[50%]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categories
                    </label>
                    <select
                      className="border p-2 rounded w-[300px]"
                      value={form.categoryId}
                      onChange={(e) =>
                        handleChange("categoryId", e?.target?.value)
                      }
                    >
                      {categories?.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2   gap-3">
                  <div className="image-upload-card  boxShadowData">
                    <h4 className="text-xl"> Banner Logo</h4>
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
                      <label htmlFor="logo" className="image-upload-label">
                        {previewBannerLogo || form?.bannerImage ? (
                          <img
                            src={previewBannerLogo || form?.bannerImage}
                            alt="Banner Preview"
                            className="logo-preview"
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
                    <h4 className="text-xl"> Logo Image</h4>
                    <p className="image-hint">PNG preferred, transparent bg</p>
                    <div className="file-upload">
                      <input
                        type="file"
                        name="logoImage"
                        onChange={handleFileChange}
                        accept="image/*"
                        id="logoImage"
                      />
                      <label htmlFor="logo" className="image-upload-label">
                        {previewLogo || form?.logoImage ? (
                          <img
                            src={previewLogo || form?.logoImage}
                            alt="Logo Preview"
                            className="logo-preview"
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
                <button className="border px-4 py-2 rounded">Cancel</button>
                <Button onClick={()=>addBannerAPIData()}>Submit</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <CommonDeleteModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={deleteBanner}
        loading={deleteLoading}
      />
    </>
  );
}
