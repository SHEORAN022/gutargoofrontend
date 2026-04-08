import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, GripVerticalIcon } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// import {
//   getSectionAPI,
//   addSectionAPI,
//   deleteSectionAPI,
//   editSectionAPI,
//   dragAndDropAPI
// } from "../api/section";
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
// import { getCategoriesAPI, getMoviesSelectAPI} from "../api/movies";
import axios from "axios";

export default function HomeSections() {
  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "https://gutargooplus.com/api/api";

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
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  const getSection = "/admin/sections";
  const reorder = "/admin/sections/reorder";
  const getSectionAPI = async () => await api.get(getSection);

  const addSectionAPI = async (data) => await api.post(getSection, data);

  const deleteSectionAPI = async (id) =>
    await api.delete(getSection + "/" + id);

  const editSectionAPI = async (id, body) =>
    await api.put(getSection + "/" + id, body);

  const dragAndDropAPI = async (body) => await api.put(reorder, body);
  const getMoviesSelect = "/movies";
  const getCategories = "/category";
  const getMoviesSelectAPI = async (params) =>
    await api.get(getMoviesSelect, { params });

  const getCategoriesAPI = async () => await api.get(getCategories);

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
      const finalData = payload?.map((item) => item?._id);
      await dragAndDropAPI({ ids: [...finalData] });

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
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
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
            scroll={{ x: "max-content" }}
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
                  maxTagCount={1}
                  maxTagPlaceholder={(omittedValues) =>
                    `+ ${omittedValues.length} more`
                  }
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
