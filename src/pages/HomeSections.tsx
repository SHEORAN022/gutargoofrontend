import { useState, useEffect } from "react";
import {
  useHomeSections,
  HomeSection,
  SectionFormData,
  SectionType,
  ContentSource,
  DisplayStyle,
  AppTab,
  useSectionItems,
} from "@/hooks/useHomeSections";
import { useCategories } from "@/hooks/useCategories";
import { useMoviesDB } from "@/hooks/useMoviesDB";
import { useWebSeriesDB } from "@/hooks/useWebSeriesDB";
import { useTVShowsDB } from "@/hooks/useTVShowsDB";
import { useShortMoviesDB } from "@/hooks/useShortMoviesDB";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  LayoutGrid,
  Rows3,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  Star,
  Heart,
  FolderOpen,
  List,
  X,
  Film,
  Tv,
  GripVerticalIcon,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";




import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getSectionAPI,
  addSectionAPI,
  deleteSectionAPI,
  editSectionAPI,
  dragAndDropAPI
} from "../api/section";
import CommonDeleteModal from "../components/AntdComponents/Modal";

import {
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Spin,
  Switch,
  Table,
} from "antd";
import { getCategoriesAPI, getMoviesSelectAPI} from "../api/movies";
const SECTION_TYPES: {
  value: SectionType;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    value: "continue_watching",
    label: "Continue Watching",
    icon: Clock,
    description: "User's in-progress content",
  },
  {
    value: "trending_now",
    label: "Trending Now",
    icon: TrendingUp,
    description: "Popular content based on views",
  },
  {
    value: "latest_releases",
    label: "Latest Releases",
    icon: Star,
    description: "Recently added content",
  },
  {
    value: "top_rated",
    label: "Top Rated",
    icon: Star,
    description: "Highest rated content",
  },
  {
    value: "recommended",
    label: "Recommended",
    icon: Heart,
    description: "Personalized suggestions",
  },
  {
    value: "category_based",
    label: "Category Based",
    icon: FolderOpen,
    description: "Content from specific category",
  },
  {
    value: "custom_collection",
    label: "Custom Collection",
    icon: List,
    description: "Manually selected content",
  },
];

const CONTENT_SOURCES: { value: ContentSource; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "recently_added", label: "Recently Added" },
  { value: "watch_time_based", label: "Watch Time Based" },
  { value: "admin_selected", label: "Admin Selected" },
];

const CONTENT_TYPES = [
  { value: "all", label: "All Content" },
  { value: "movies", label: "Movies Only" },
  { value: "web_series", label: "Web Series Only" },
  { value: "tv_shows", label: "TV Shows Only" },
  { value: "short_movies", label: "Short Movies Only" },
];

const TAB_OPTIONS: { value: AppTab; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "originals", label: "Originals" },
  { value: "movies", label: "Movies" },
  { value: "tv_shows", label: "TV Shows" },
  { value: "web_series", label: "Web Series" },
  { value: "short_movies", label: "Short Movies" },
];

function SectionIcon({ type }: { type: SectionType }) {
  const section = SECTION_TYPES.find((s) => s.value === type);
  const Icon = section?.icon || List;
  return <Icon className="h-4 w-4" />;
}

function SortableSectionCard({
  section,
  onEdit,
  onDelete,
}: {
  section: HomeSection;
  onEdit: (s: HomeSection) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getDisplayStyleLabel = () => {
    const labels: Record<string, string> = {
      horizontal_banner: "H Banner",
      vertical_banner: "V Banner",
      big_horizontal: "Big H",
      big_vertical: "Big V",
      index_horizontal: "Index H",
      index_vertical: "Index V",
    };
    return labels[section.display_style] || section.display_style;
  };

  return (
    <Card ref={setNodeRef} style={style} className="group">
      <CardContent className="flex items-center gap-4 p-4">
        <div {...attributes} {...listeners} className="cursor-grab p-1">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <SectionIcon type={section.section_type} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{section.title}</h3>
            {section.is_active ? (
              <Badge className="bg-green-500/10 text-green-600 text-xs">
                <Eye className="mr-1 h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <EyeOff className="mr-1 h-3 w-3" />
                Inactive
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {section.section_type.replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground capitalize">
              {section.content_type}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <Badge variant="outline" className="text-[10px]">
              {getDisplayStyleLabel()}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 max-w-32">
          {section.visible_tabs.slice(0, 3).map((tab) => (
            <Badge key={tab} variant="secondary" className="text-[10px]">
              {tab}
            </Badge>
          ))}
          {section.visible_tabs.length > 3 && (
            <Badge variant="secondary" className="text-[10px]">
              +{section.visible_tabs.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => onEdit(section)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove "{section.title}" from all tabs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(section.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

interface SelectedContent {
  id: string;
  title: string;
  content_type: string;
  thumbnail_url?: string;
}

export default function HomeSections() {
  const { sections, createSection, updateSection, reorderSections } =
    useHomeSections();
  const { categories } = useCategories();
  const { movies } = useMoviesDB();
  const { webSeries } = useWebSeriesDB();
  const { tvShows } = useTVShowsDB();
  const { shortMovies } = useShortMoviesDB();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(
    null,
  );
  const [selectedContent, setSelectedContent] = useState<SelectedContent[]>([]);
  const [contentSearchType, setContentSearchType] = useState<string>("movies");

  //
//   const DraggableRow = (props) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: props["data-row-key"] });

//   const style = {
//     ...props.style,
//     transform: CSS.Transform.toString(transform),
//     transition,
//     cursor: "move",
//   };

//   return <tr ref={setNodeRef} style={style} {...attributes} {...listeners} {...props} />;
// };


const DraggableRow = (props) => {
  const { setNodeRef, transform, transition } = useSortable({
    id: props["data-row-key"],
  });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return <tr ref={setNodeRef} style={style} {...props} />;
};
const DragHandle = ({ id }) => {
  const { attributes, listeners } = useSortable({ id });

  return (
    <span {...attributes} {...listeners}>
      <GripVerticalIcon className="cursor-grab text-gray-400" />
    </span>
  );
}; 

  const {
    items: sectionItems,
    addItem,
    removeItem,
  } = useSectionItems(editingSection?.id || null);

  const [formData, setFormData] = useState<SectionFormData>({
    title: "",
    section_type: "trending_now",
    content_type: "all",
    content_source: "auto",
    category_id: undefined,
    display_style: "horizontal_banner",
    item_limit: 20,
    is_active: true,
    display_order: 0,
    visible_tabs: ["home"],
    trending_period_days: 7,
    is_original_only: false,
  });

  // Load existing section items when editing
  useEffect(() => {
    if (editingSection && sectionItems.length > 0) {
      const loadedContent: SelectedContent[] = sectionItems.map((item) => {
        let content: any = null;
        switch (item.content_type) {
          case "movies":
            content = movies.find((m) => m.id === item.content_id);
            break;
          case "web_series":
            content = webSeries.find((w) => w.id === item.content_id);
            break;
          case "tv_shows":
            content = tvShows.find((t) => t.id === item.content_id);
            break;
          case "short_movies":
            content = shortMovies.find((s) => s.id === item.content_id);
            break;
        }
        return {
          id: item.content_id,
          title: content?.title || "Unknown",
          content_type: item.content_type,
          thumbnail_url: content?.thumbnail_url,
        };
      });
      setSelectedContent(loadedContent);
    }
  }, [editingSection, sectionItems, movies, webSeries, tvShows, shortMovies]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );



  const openEditDialog = (section: HomeSection) => {
    setEditingSection(section);
    setSelectedContent([]);
    setFormData({
      title: section.title,
      section_type: section.section_type,
      content_type: section.content_type,
      content_source: section.content_source,
      category_id: section.category_id || undefined,
      display_style: section.display_style,
      item_limit: section.item_limit || 20,
      is_active: section.is_active,
      display_order: section.display_order,
      visible_tabs: section.visible_tabs,
      trending_period_days: section.trending_period_days || 7,
      is_original_only: section.is_original_only || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) return;

    const payload = {
      ...formData,
      category_id: formData.category_id || null,
    };

    let sectionId: string;

    if (editingSection) {
      await updateSection.mutateAsync({ id: editingSection.id, ...payload });
      sectionId = editingSection.id;
    } else {
      const result = await createSection.mutateAsync(payload);
      sectionId = result.id;
    }

    // Save selected content for admin_selected source
    if (
      formData.content_source === "admin_selected" &&
      selectedContent.length > 0
    ) {
      // Remove existing items if editing
      if (editingSection) {
        for (const item of sectionItems) {
          await removeItem.mutateAsync(item.id);
        }
      }
      // Add new items
      for (let i = 0; i < selectedContent.length; i++) {
        await addItem.mutateAsync({
          section_id: sectionId,
          content_type: selectedContent[i].content_type,
          content_id: selectedContent[i].id,
          display_order: i,
        });
      }
    }

    setDialogOpen(false);
  };

  const toggleTab = (tab: AppTab) => {
    setFormData((prev) => ({
      ...prev,
      visible_tabs: prev.visible_tabs.includes(tab)
        ? prev.visible_tabs.filter((t) => t !== tab)
        : [...prev.visible_tabs, tab],
    }));
  };

  const getContentList = () => {
    switch (contentSearchType) {
      case "movies":
        return movies.map((m) => ({ ...m, content_type: "movies" }));
      case "web_series":
        return webSeries.map((w) => ({ ...w, content_type: "web_series" }));
      case "tv_shows":
        return tvShows.map((t) => ({ ...t, content_type: "tv_shows" }));
      case "short_movies":
        return shortMovies.map((s) => ({ ...s, content_type: "short_movies" }));
      default:
        return [];
    }
  };

  const addContentToSelection = (item: any) => {
    if (!selectedContent.find((c) => c.id === item.id)) {
      setSelectedContent([
        ...selectedContent,
        {
          id: item.id,
          title: item.title,
          content_type: item.content_type,
          thumbnail_url: item.thumbnail_url,
        },
      ]);
    }
  };

  const removeContentFromSelection = (id: string) => {
    setSelectedContent(selectedContent.filter((c) => c.id !== id));
  };

  //New section module start from here
  const { Option } = Select;
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [sectionData, setSectionData] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editData, setEditData] = useState(false);

  const onEdit = (data) => {
    setEditData(true);
    setOpen(true);
    setDeleteId(data?._id);
    setForm({
      title: data?.title || "",
      contentSource: data?.contentSource || "",
      categoryId: data?.categoryId || "",
      movies: data?.sectionData?.movies || [],
      displayStyle: data?.displayStyle || "",
      trendingPeriodDays: data?.trendingPeriodDays || "",
      isActive: data?.isActive || false,
      isOriginalOnly: data?.isOriginalOnly || false,
    });
  };

  const arrayMove = (array, from, to) => {
  const newArr = [...array];
  const startIndex = from < 0 ? newArr.length + from : from;

  if (startIndex >= 0 && startIndex < newArr.length) {
    const endIndex = to < 0 ? newArr.length + to : to;
    const [item] = newArr.splice(from, 1);
    newArr.splice(endIndex, 0, item);
  }

  return newArr;
};

const [data, setData] = useState(sectionData);

useEffect(() => {
  setData(sectionData);
}, [sectionData]);

// const handleDragEnd = (event) => {
//   const { active, over } = event;

//   if (active.id !== over?.id) {
//     const oldIndex = data.findIndex((i) => i._id === active.id);
//     const newIndex = data.findIndex((i) => i._id === over.id);

//     setData(arrayMove(data, oldIndex, newIndex));
//   }
// };

// const handleDragEnd = async (event) => {
//   const { active, over } = event;

//   if (!over || active.id === over.id) return;

//   const oldIndex = data.findIndex((i) => i._id === active.id);
//   const newIndex = data.findIndex((i) => i._id === over.id);

//   const newData = arrayMove(data, oldIndex, newIndex);
//   setData(newData);

//   // 🔥 Send updated order to backend
//   try {
//     const payload = newData.map((item, index) => ({
//       _id: item._id,
//       displayOrder: index, // or position
//     }));

//     await dragAndDropAPI(payload); // create this API
//     message.success("Order updated");
    
//   } catch (error) {
//     message.error("Failed to update order");
//     console.log(error);
//   }
// };
const handleDragEnd = async (event) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const oldIndex = data.findIndex((i) => i._id === active.id);
  const newIndex = data.findIndex((i) => i._id === over.id);

  const newData = arrayMove(data, oldIndex, newIndex);
  setData(newData);

  try {
    // 🔥 Only send affected range
    const start = Math.min(oldIndex, newIndex);
    const end = Math.max(oldIndex, newIndex);

    const payload = newData.slice(start, end + 1).map((item, index) => ({
      _id: item._id,
      displayOrder: start + index,
    }));
const finalData = payload?.map((item)=>item?._id)
    await dragAndDropAPI({ids:[...finalData]});

    message.success("Order updated");
  } catch (error) {
    message.error("Failed to update order");
    console.log(error);
  }
};
  const SectionTable = () => {
    const columns = [
     {
  title: "",
  key: "sort",
  width: 50,
  align: "center",
  render: (_, record) => <DragHandle id={record._id} />,
},
      {
        title: "Title",
        key: "title",
        align: "center",
        render: (_, record) => (
          <div style={{ fontWeight: 500 }}>{record.title || "No Title"}</div>
        ),
      },

     
      {
        title: "Content Source",
        dataIndex: "contentSource",
        key: "contentSource",
        align: "center",
        render: (data) => <span>{data?.replaceAll("_", " ")}</span>,
      },

      {
        title: "Category",
        dataIndex: "categoryId",
        key: "categoryId",
        align: "center",
        render: (data) => (
          <div style={{ fontWeight: 500 }}>{data?.name || "N/A"}</div>
        ),
      },

      {
        title: "Display Style",
        dataIndex: "displayStyle",
        key: "displayStyle",
        align: "center",
        render: (data) => <span>{data?.replaceAll("_", " ")}</span>,
      },

      ,
      {
        title: "Active",
        dataIndex: "isActive",
        key: "isActive",
        align: "center",
        render: (val) => (
          <span style={{ color: val ? "green" : "red" }}>
            {val ? "Active" : "Inactive"}
          </span>
        ),
      },

      {
        title: "Original Only",
        dataIndex: "isOriginalOnly",
        key: "isOriginalOnly",
        align: "center",
        render: (val) => (val ? "Yes" : "No"),
      },

      {
        title: "Trending Days",
        dataIndex: "trendingPeriodDays",
        key: "trendingPeriodDays",
        align: "center",
      },

      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: (_, item) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={(e) => {
  e.stopPropagation();
  onEdit(item);
}}>
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => {
                setDeleteId(item?._id);
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
      // <Table
      //   columns={columns}
      //   dataSource={sectionData}
      //   pagination={false}
      //   scroll={{ x: "max-content" }}
      //   loading={isLoading}
      // />
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext
    items={data.map((i) => i._id)}
    strategy={verticalListSortingStrategy}
  >
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={data}
      pagination={false}
        scroll={{x:'max-content'}}
      components={{
        body: {
          row: DraggableRow,
        },
      }}
    />
  </SortableContext>
</DndContext>
    );
  };

  const openCreateDialog = () => {
    setForm({});

    setOpen(true);
  };
  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };
  const [open, setOpen] = useState(false);

  const getSectionDataAll = async () => {
    try {
      setIsLoading(true);
      const res = await getSectionAPI();
      if (res?.status === 200) {
        setSectionData(res?.data?.data || []);
      }

      console.log(res, "reeees of section here ");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const deleteSection = async () => {
    try {
      setDeleteLoading(true);
      const res = await deleteSectionAPI(deleteId);
      if (res?.status === 200) {
        setDeleteOpen(false);
        getSectionDataAll();
        message.success("Banner Delete Successfully");
      }
    } catch (error) {
      setDeleteLoading(false);
      setDeleteOpen(false);

      console.log(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    getSectionDataAll();
  }, []);

  const addSectionBuilder = async () => {
    if (!form || !form.title) {
      message.error("Title is required");
      return;
    }
    try {
      setSectionLoading(true);
       const finaldata = {
      ...form,
      sectionData: {
        movies: form?.movies || [], // ✅ safe fallback
      },
    };

      if ("movies" in finaldata) {
      delete finaldata.movies;
    }
      const res = editData
        ? await editSectionAPI(deleteId, finaldata)
        : await addSectionAPI(finaldata);
      if (res?.status === 201 || res?.status === 200) {
        if (editData) {
          setEditData(false);
        }
        getSectionDataAll();

        message.success(res?.data?.message || "Add Section Builder");
        setForm({});
        setOpen(false);
      }
      console.log(res, "get the response here ");
    } catch (error) {
      message.error(error?.message || "Something went wrong ");
      console.log(error);
    } finally {
      setSectionLoading(false);
    }
  };

  const [categorie, setCategories] = useState([]);
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
  useEffect(() => {
    getMoviesData();

    fetchCategories();
  }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Section Builder </h1>
            <p className="text-sm text-muted-foreground">
              {" "}
              Total Section {sectionData?.length}
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Section
          </Button>
        </div>
        <SectionTable />
      </div>
      <Modal
        maskClosable={false}
        title={
          <>
            <div className="text-xl font-bold">
              {editData ? "Edit" : "Add"} Section Builder
            </div>
          </>
        }
        footer={false}
        open={open}
        width={800}
        closable={false}
        onCancel={() => setOpen(false)}
      >
        <div className="rounded-2xl p-4 bg-white">
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input
                placeholder="Enter title"
                value={form?.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Content Source
              </label>
              <Select
                className="w-full"
                value={form.contentSource}
                onChange={(value) => handleChange("contentSource", value)}
              >
                <Option value="auto">Auto</Option>
                <Option value="most_viewed">Most Viewed</Option>
                <Option value="recently_added">Recently Added</Option>
                <Option value="watch_time_based">Watch Time Based</Option>
                <Option value="admin_selected">Admin Selected</Option>
              </Select>
            </div>

            {/* Category Id */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>

              <Select
                className="w-full"
                value={form?.categoryId}
                onChange={(value) => handleChange("categoryId", value)}
              >
                {categorie?.map((item) => {
                  return (
                    <>
                      <Option value={item?.value}>{item?.label}</Option>
                    </>
                  );
                })}
              </Select>
            </div>

            {/* Display Style */}
            {form?.contentSource === "admin_selected" && form?.categoryId && (
              <div>
                <label className="block text-sm font-medium mb-1">Movies</label>
                <Select
                maxTagCount={2}
    maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} more`}
                  mode="multiple"
                  showSearch={true}
                  // placeholder="Select Movies"
                  className="border p-2 rounded w-full"
                  value={form?.movies}
                  // onChange={(e) =>handleChange("movies",e?.target?.value)}
                  onChange={(e) => setForm({ ...form, movies: e })}
                  options={allMovies}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Display Style
              </label>
              <Select
                className="w-full"
                value={form.displayStyle}
                onChange={(value) => handleChange("displayStyle", value)}
              >
                <Option value="horizontal_banner">Horizontal Banner</Option>
                <Option value="vertical_banner">Vertical Banner</Option>
                <Option value="big_horizontal">Big Horizontal</Option>
                <Option value="big_vertical">Big Vertical</Option>
                <Option value="index_horizontal">Index Horizontal</Option>
                <Option value="index_vertical">Index Vertical</Option>
              </Select>
            </div>

            {/* Item Limit */}
            {/* <div>
          <label className="block text-sm font-medium mb-1">Item Limit</label>
          <InputNumber
            className="w-full"
            min={1}
            max={100}
            value={form.itemLimit}
            onChange={(value) => handleChange("itemLimit", value)}
          />
        </div> */}

            {/* Display Order */}
            {/* <div>
          <label className="block text-sm font-medium mb-1">Display Order</label>
          <InputNumber
            className="w-full"
            value={form.displayOrder}
            onChange={(value) => handleChange("displayOrder", value)}
          />
        </div> */}

            {/* Trending Days */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Trending Period (Days)
              </label>
              <InputNumber
                className="w-full"
                value={form.trendingPeriodDays}
                onChange={(value) => handleChange("trendingPeriodDays", value)}
              />
            </div>

           

            {/* Switches */}
            <div className="flex gap-6 col-span-2">
              <div>
                <label className="block text-sm mb-1">Active</label>
                <Switch
                  checked={form.isActive}
                  onChange={(val) => handleChange("isActive", val)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Original Only</label>
                <Switch
                  checked={form.isOriginalOnly}
                  onChange={(val) => handleChange("isOriginalOnly", val)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => {
                setEditData(false);
                setOpen(false);
                setForm({});
              }}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>

            <Button onClick={() => addSectionBuilder()}>
              {sectionLoading ? <Spin /> : <>{editData ? "Edit" : "Add"}</>}
            </Button>
          </div>
        </div>
      </Modal>

      <CommonDeleteModal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={deleteSection}
        loading={deleteLoading}
      />
    </>
  );
}
