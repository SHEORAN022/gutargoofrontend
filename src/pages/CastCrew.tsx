import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  User,
  Camera,
  X,
  Edit2,
  Trash2,
  Film,
  Clapperboard,
  Music,
  Pen,
  Video,
  Link,
  ImageOffIcon,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CameraOutlined, UploadOutlined } from "@ant-design/icons";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCastCrew } from "@/hooks/useCastCrew";
import { Person, PersonRole, roleLabels } from "@/lib/castCrewStore";
import { toast } from "sonner";
import {
  Image,
  Input,
  message,
  Modal,
  Select,
  Spin,
  Table,
  Upload,
} from "antd";
import {
  addCastAndCrewAPI,
  getCastAndCrewAPI,
  deleteCastAndCrewAPI,
  updateCastAndCrewAPI
} from "../api/castCrew";
import CommonDeleteModal from "../components/AntdComponents/Modal";

const roleIcons: Record<PersonRole, React.ElementType> = {
  actor: User,
  director: Clapperboard,
  producer: Film,
  writer: Pen,
  music_director: Music,
  cinematographer: Camera,
  editor: Video,
};

const roleColors: Record<PersonRole, string> = {
  actor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  director: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  producer: "bg-green-500/10 text-green-500 border-green-500/20",
  writer: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  music_director: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  cinematographer: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  editor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export default function CastCrew() {
  const CREW_ROLES = [
    "Director",
    "Producer",
    "Writer",
    "Music Director",
    "Cinematographer",
    "Editor",
    "Other",
  ]?.map((item)=>({value:item,label:item==="Other"?"Cast":item}))
  const { Option } = Select;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const openAddDialog = () => {
    setFormData({})
    setPreviewLogo(null)
    
    setEditingPerson(null);
    setIsAddDialogOpen(true);
  };

  //start main cast and crew
  const [imageProcess, setImageProcess] = useState({});

  const [formData, setFormData] = useState({
    personName: "",
    role: "",
    characterName: "",
    profileImage: null,
  });
  const [commonBoolean, setCommonBoolean] = useState({
    loading: false,
    imageLoading: false,
  });

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const [previewLogo, setPreviewLogo] = useState(null);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    const file = files[0];
    // setForm({ ...form, [name]: file });

    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

    const makePreview = (setter) => {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    };

    if (name === "profileImage") makePreview(setPreviewLogo);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [submitLoading, setSubmitLoading] = useState(false);
  const [crewCast, setCrewCaset] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [editData, setEditData] = useState(false);
  const [totalRecords,setTotalRecords]  = useState(0)
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(25);
  const onEdit = (data) => {
    setEditData(true); 
    setDeleteId(data?._id); 
    setIsAddDialogOpen(true);
    setPreviewLogo(data?.profileImage?.url || null);
    setFormData({
      personName: data?.personName || "",
      role: data?.role || "",
      characterName: data?.characterName || "",
      profileImage: data?.profileImage || "",
    });
  };
const getCastCrewData = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      const res = await getCastAndCrewAPI({page,limit});
      if (res?.status === 201) {
        const Response = res?.data?.data || [];
        setCrewCaset(Response);
        setTotalRecords(Response?.data?.total)
      }
      console.log(res, "get the response ");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const CastCrewTable = () => {
    const columns = [
      {
        title: "Profile Image",
        dataIndex: "profileImage",
        key: "profileImage",
        render: (img, banner) =>
          banner.profileImage?.url ? (
            <img
              src={banner.profileImage?.url}
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
        title: "Person Name",
        key: "personName",
        align: "center",
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.title || "Person Name"}
            </div>
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        align: "center",
        render: (_, data) => {
          return (
            <>
              <div style={{ fontWeight: 500 }}>{data?.role}</div>
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
            <Button variant="ghost" size="icon"
            onClick={()=>{
              onEdit(banner)
            }}
            >
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
        dataSource={crewCast}
        rowKey="_id" // or "id" depending on your data
        // pagination={false}
        pagination={{
  current: currentPage,
  pageSize: pageSize,
  total: totalRecords,
  showSizeChanger: true,
  pageSizeOptions: [ "25", "50","100","200"],
  onChange: (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  },
}}
        loading={isLoading}
        scroll={{ x: "max-content" }}
      />
    );
  };
  
  const deleteCastCrew = async () => {
    try {
      setDeleteLoading(true);
      const res = await deleteCastAndCrewAPI(deleteId);
      if (res?.status === 200) {
        setOpen(false);
        getCastCrewData(1,25);
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

  // const filteredPeople = people.filter((person) => {
  //   const matchesSearch = person?.personName
  //     ?.toLowerCase()
  //     ?.includes((searchQuery || "").toLowerCase());

  //   const matchesRole =
  //     activeTab === "all" || person.role === activeTab;

  //   return matchesSearch && matchesRole;
  // });

  useEffect(() => {
    getCastCrewData(currentPage,pageSize);
  }, [currentPage,pageSize]);

  const finalAdd = async () => {
    if (
      formData?.personName === "" ||
      formData?.personName === undefined ||
      formData?.role === "" ||
      formData?.role === undefined
    ) {
      message.error("Person Name and role is required");
      return;
    }

    try {
      setSubmitLoading(true);
      const newFormData = new FormData();

      Object.keys(formData).forEach((key) => {
        const value = formData[key];

        // if (!value) return;

        if (value === undefined || value === null) return;

        if (["profileImage"].includes(key)) {
          if (value instanceof File) {
            newFormData.append(key, value);
          } else if (value?.url) {
            newFormData.append(`existing_${key}`, value.url);
          }
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            newFormData.append(key, JSON.stringify(value));
          }
        } else {
          newFormData.append(key, value);
        }
      });

      let res = editData?await updateCastAndCrewAPI(deleteId,formData) : await addCastAndCrewAPI(newFormData);

      if (res?.status === 200 || res?.status === 201) {
        if(editData){
          setEditData(false)
        }
        setFormData({});
        setPreviewLogo(null);
        getCastCrewData(1,25);

        setIsAddDialogOpen(false);

        message.success(res?.data?.message||"Banner Added Successfully");
      }

      console.log(res);
    } catch (error) {
      console.log(error);
      message.error(error?.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen animate-fade-in">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Cast & Crew
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage all actors, directors, and crew members
            </p>
          </div>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Person
          </Button>
        </div>

       
        <CastCrewTable />

        {/* Add/Edit Dialog */}
        <Modal
          title="Add Cast / Crew"
          open={isAddDialogOpen}
          onCancel={() => setIsAddDialogOpen(false)}
          footer={null}
          closable={false}
          width={800}
        >
          <div className="rounded-2xl p-4 bg-white">
            <div className=" ">
              <h4 className="text-xl font-semibold">Profile Image</h4>

              <div className="flex items-center gap-6 ">
                <div className="relative group">
                  <input
                    type="file"
                    name="profileImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    id="profileImage"
                    className="hidden"
                  />

                  <label
                    htmlFor="profileImage"
                    className="cursor-pointer block"
                  >
                    {/* Image / Placeholder */}
                    {previewLogo || formData?.profileImage ? (
                      <img
                        src={previewLogo || formData?.profileImage?.url}
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-white text-sm flex items-center gap-1">
                        📷 Change
                      </span>
                    </div>
                  </label>
                </div>

                {/* Optional text */}
                <div className="text-sm text-gray-500">
                  <p>Click to upload</p>
                  <p>JPG, PNG up to 2MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Person Name <span className="text-red-600">*</span>
                </label>

                <Input
                  placeholder="Person Name"
                  value={formData.personName}
                  onChange={(e) => handleChange("personName", e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">
                  Role <span className="text-red-600">*</span>
                </label>

                <Select
                  className="w-full"
                  placeholder="Select Role"
                  value={formData.role || undefined}
                  onChange={(value) => handleChange("role", value)}
                >
                  {CREW_ROLES.map((r) => (
                    <Option key={r?.value} value={r?.value}>
                      {r?.label}
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                {formData.role === "Other" && (
                  <>
                    <label className="block text-sm font-medium mb-1">
                      Character name
                    </label>
                    <Input
                      placeholder="Character Name (Optional)"
                      value={formData?.characterName}
                      onChange={(e) =>
                        handleChange("characterName", e.target.value)
                      }
                    />
                  </>
                )}
              </div>
            </div>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                className="border px-4 py-2 rounded"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </button>
              <Button onClick={() => finalAdd()}>
                {submitLoading ? (
                  <>
                    <Spin />
                  </>
                ) : (
                  <>
                   {editData?"Update":"Submit"}
                  </>
                 
                )}
              </Button>
            </div>
          </div>
        </Modal>

       
      </div>
      <CommonDeleteModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={deleteCastCrew}
        loading={deleteLoading}
      />
    </>
  );
}
