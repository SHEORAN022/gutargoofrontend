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
import { Image, Input, message, Modal, Select, Spin, Table, Upload } from "antd";
import { addCastAndCrewAPI,getCastAndCrewAPI,deleteCastAndCrewAPI } from "../api/castCrew";
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
  ];
  const { Option } = Select;
  const { people, addPerson, updatePerson, deletePerson } = useCastCrew();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<PersonRole | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageInputType, setImageInputType] = useState<"upload" | "url">(
    "upload",
  );

  // Form state
  const [formName, setFormName] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formRoles, setFormRoles] = useState<PersonRole[]>([]);


  const resetForm = () => {
    setFormName("");
    setFormImage("");
    setFormBio("");
    setFormRoles([]);
    setImageInputType("upload");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddDialog = () => {
    resetForm();
    setEditingPerson(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (person: Person) => {
    setFormName(person.name);
    setFormImage(person.image || "");
    setFormBio(person.bio || "");
    setFormRoles([...person.roles]);
    setEditingPerson(person);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (formRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    if (editingPerson) {
      updatePerson(editingPerson.id, {
        name: formName.trim(),
        image: formImage.trim() || undefined,
        bio: formBio.trim() || undefined,
        roles: formRoles,
      });
      toast.success("Person updated successfully");
    } else {
      addPerson({
        name: formName.trim(),
        image: formImage.trim() || undefined,
        bio: formBio.trim() || undefined,
        roles: formRoles,
      });
      toast.success("Person added successfully");
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deletePerson(deleteConfirmId);
      toast.success("Person deleted successfully");
      setDeleteConfirmId(null);
    }
  };

  const toggleRole = (role: PersonRole) => {
    if (formRoles.includes(role)) {
      setFormRoles(formRoles.filter((r) => r !== role));
    } else {
      setFormRoles([...formRoles, role]);
    }
  };

  const stats = {
    total: people.length,
    actors: people.filter((p) => p.roles.includes("actor")).length,
    directors: people.filter((p) => p.roles.includes("director")).length,
    crew: people.filter((p) =>
      p.roles.some((r) =>
        [
          "producer",
          "writer",
          "music_director",
          "cinematographer",
          "editor",
        ].includes(r),
      ),
    ).length,
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
  const CustomRequestApi = async (info) => {
    setCommonBoolean((prev) => ({ ...prev, imageLoading: true }));

    try {
      if (info?.file?.status === "uploading") {
        getBase64(info?.file?.originFileObj, (imageUrl) => {
          setImageProcess((prev) => ({
            ...prev,
            showImage: imageUrl,
          }));
        });
        return;
      }

      // ✅ store FILE directly
      setFormData((prev) => ({
        ...prev,
        profileImage: info.file.originFileObj,
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setCommonBoolean((prev) => ({ ...prev, imageLoading: false }));
    }
  };
  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      onSuccess();
    } catch (error) {
      onError("Upload failed");
    }
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
   const [isLoading,setIsLoading] = useState(false)
  const [open,setOpen] = useState(false)
  const [deleteLoading,setDeleteLoading] = useState(false)
  const [deleteId,setDeleteId] = useState("")
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
            <div style={{ fontWeight: 500 }}>{record.title || "Person Name"}</div>
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        align: "center",
        render: (_,data) => {
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
            {/* <Button variant="ghost" size="icon"> */}
              {/* <Pencil className="h-4 w-4" /> */}
            {/* </Button> */}

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
        pagination={false}
        loading={isLoading}
        scroll={{x:'max-content'}}

      />
    );
  };
   const getCastCrewData = async () => {
    try {
      setIsLoading(true)
      const res = await getCastAndCrewAPI();
      if(res?.status===201){
        const Response = res?.data?.data  || []
        setCrewCaset(Response)
      }
     console.log(res,'get the response ')
    } catch (error) {
      console.log(error);
    }
    finally{
            setIsLoading(false)

    }
  };
    const deleteCastCrew = async () => {
    try {
      setDeleteLoading(true);
      const res = await deleteCastAndCrewAPI(deleteId);
      if (res?.status === 200) {
        setOpen(false);
        getCastCrewData();
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
 
useEffect(()=>{
  getCastCrewData()
},[])

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

      let res = await addCastAndCrewAPI(newFormData)

      // 🔥 EDIT CASE

      if (res?.status === 200 || res?.status === 201) {
        setFormData({});
        setPreviewLogo(null);

        setIsAddDialogOpen(false);

        message.success("Banner Added Successfully");
      }

      console.log(res);
    } catch (error) {
      console.log(error);
      message.error(error?.message)
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

      {/* Stats */}
      {/* <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total People", value: stats.total, color: "text-primary" },
          { label: "Actors", value: stats.actors, color: "text-blue-500" },
          {
            label: "Directors",
            value: stats.directors,
            color: "text-purple-500",
          },
          { label: "Crew Members", value: stats.crew, color: "text-green-500" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div> */}

      {/* Search & Filters */}
      {/* <div className="mb-6 glass-card rounded-xl p-4">
        <div className="flex  gap-4 ">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 !w-50 "
            />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as PersonRole | "all")}
          >
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Director">Directors</TabsTrigger>
              <TabsTrigger value="Producer">Producers</TabsTrigger>
              <TabsTrigger value="Writer">Writers</TabsTrigger>
              <TabsTrigger value="Editor">Cinematographer</TabsTrigger>
              <TabsTrigger value="Other">Other</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div> */}

      {/* People Grid */}
      {/* {filteredPeople.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPeople.map((person) => (
            <div
              key={person.id}
              className="glass-card group rounded-xl p-4 transition-all hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {person.image ? (
                    <img
                      src={person.image}
                      alt={person.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-2 ring-border">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{person.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Added {person.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(person)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirmId(person.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {person.roles.map((role) => {
                  const Icon = roleIcons[role];
                  return (
                    <Badge
                      key={role}
                      variant="outline"
                      className={cn("gap-1 text-xs", roleColors[role])}
                    >
                      <Icon className="h-3 w-3" />
                      {roleLabels[role]}
                    </Badge>
                  );
                })}
              </div>

              {person.bio && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {person.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl py-16 text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No people found</h3>
          <p className="mb-4 text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query"
              : "Start by adding your first cast or crew member"}
          </p>
          {!searchQuery && (
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Person
            </Button>
          )}
        </div>
      )} */}
      <CastCrewTable/>

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
          {/* <div className="image-upload-card box boxShadowData ">
            <h4 className="text-xl"> Profile Image</h4>
            <p className="image-hint">PNG preferred, transparent bg</p>
            <div className="file-upload">
              <input
                type="file"
                name="profileImage"
                onChange={handleFileChange}
                accept="image/*"
                id="profileImage"
              />
              <label htmlFor="profileImage" className="image-upload-label">
                {previewLogo || formData?.profileImage ? (
                  <img
                    // src={previewLogo || form?.logoImage}
                    src={previewLogo || formData?.profileImage?.url}
                    alt="Profile Pic Preview"
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
          </div> */}
          <div className=" ">
  <h4 className="text-xl font-semibold">Profile Image</h4>
  <p className="text-sm text-gray-500 mb-4">
    PNG preferred, transparent bg
  </p>

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
                  <Option key={r} value={r}>
                    {r}
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
                    value={formData.characterName}
                    onChange={(e) =>
                      handleChange("characterName", e.target.value)
                    }
                  />
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              className="border px-4 py-2 rounded"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </button>
            <Button onClick={() => finalAdd()}>{submitLoading?(<><Spin/></>):"Submit"}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Person?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              person from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
     <CommonDeleteModal
            open={open}
            onCancel={() => setOpen(false)}
            onConfirm={deleteCastCrew}
            loading={deleteLoading}
          /></>
   
  );
}
