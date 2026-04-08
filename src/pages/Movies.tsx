import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Hls from "hls.js";
import "./Movies.css";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, Tag, Switch, Space, message, Select } from "antd";
import CommonDeleteModal from "../components/AntdComponents/Modal";
import { getAllCastAndCrewAPI } from "../api/castCrew.js";
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 300000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Avatar / Image Upload Component ────────────────────────────────────────
const PersonImageUpload = ({ person, index, role, onImageChange, label }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(person?.imageUrl || null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    onImageChange(file, index, role);
  };

  return (
    <div
      className="person-image-upload"
      onClick={handleClick}
      title={`Upload photo for ${label}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      {preview ? (
        <img src={preview} alt={label} className="person-avatar" />
      ) : (
        <div className="person-avatar-placeholder">
          <span className="avatar-icon">📷</span>
        </div>
      )}
      <div className="avatar-overlay">
        <span>📷</span>
      </div>
    </div>
  );
};

// ─── Video Player ────────────────────────────────────────────────────────────
const VideoPlayer = ({ url, type }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let isHls = false;
    if (type === "hls") isHls = true;
    else if (type === "mp4") isHls = false;
    else isHls = url?.includes(".m3u8") || url?.includes("playlist.m3u8");

    if (isHls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      hls.on(Hls.Events.ERROR, (_, data) => console.error("HLS Error:", data));
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => video.play());
    } else {
      video.src = url;
      video.load();
      video.play();
    }
  }, [url, type]);

  return (
    <video
      ref={videoRef}
      controls
      className="video-player"
      style={{ width: "100%", maxHeight: "500px" }}
    />
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const Movies = () => {

    const handleSelectCast = (id, field) => {
    const selectedPerson = getAllCast.find((p) => p._id === id);
    if (!selectedPerson) return;

    const existing = formData[field] || [];

    console.log(existing, "get existing here ", selectedPerson);

    const alreadyExists = existing.some(
      (item) => item.name === selectedPerson.personName,
    );
    if (alreadyExists) return;

    const newMember = {
      name: selectedPerson.personName,
      imageUrl: selectedPerson.imageUrl || "",
      publicId: selectedPerson.publicId || "",
    };

    console.log("Adding:", newMember); // 👈 check here

    handleArrayChange(field, [...existing, newMember]);
  };

  const handleSelectCastNew = (id) => {
  const selectedPerson = getAllCast.find((p) => p._id === id);
  if (!selectedPerson) return;

  const newCast = {
    name: selectedPerson.personName,
    character:selectedPerson?.characterName,
    imageUrl: selectedPerson.imageUrl || "",
  };

  setFormData((prev) => ({
    ...prev,
    castMembers: [...prev.castMembers, newCast],
  }));
};
  const { Option } = Select;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [listingCallingLoading, setListingCallingLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showList, setShowList] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedCrewRole, setSelectedCrewRole] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [newCrewName, setNewCrewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewPoster, setPreviewPoster] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [previewTrailerUrl, setPreviewTrailerUrl] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchMovie, setSearchMovie] = useState("");
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("auto");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(50);
  // Crew / cast image file maps: { "director_0": File, "cast_2": File, ... }
  const [crewImageFiles, setCrewImageFiles] = useState({});

  const [formData, setFormData] = useState({
    movieTitle: "",
    tagline: "",
    description: "",
    fullStoryline: "",
    genres: [],
    tags: [],
    lang: "",
    selectedLanguage: "",
    duration: "",
    ageRating: "",
    imdbRating: "",
    releaseYear: "",
    productionStudio: [],
    countryOfOrigin: [],
    budget: "",
    awardsAndNominations: "",
    movieFile: null,
    trailerFile: null,
    customVideoUrl: "",
    customTrailerUrl: "",
    horizontalBanner: null,
    verticalPoster: null,
    logo: null,
    videoQuality: "Auto (Adaptive)",
    audioFormat: "Stereo",
    director: [],
    producer: [],
    writer: [],
    musicDirector: [],
    cinematographer: [],
    editor: [],
    castMembers: [],
    audioTracks: [],
    subtitles: [],
    publishStatus: false,
    subscriptionRequired: false,
    enableAds: true,
    allowDownloads: true,
    featuredMovie: false,
    contentVendor: "Internal",
    vendorId: "",
    publishDate: "",
    expiryDate: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
    movieFileUrl: "",
    movieFileThumbnail: "",
    horizontalBannerUrl: "",
    verticalPosterUrl: "",
    logoUrl: "",
  });

  const genreOptions = [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Horror",
    "History",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Thriller",
    "War",
    "Western",
  ];
  // const languageOptions = [
  //   "English",
  //   "Hindi",
  //   "Spanish",
  //   "French",
  //   "German",
  //   "Chinese",
  //   "Japanese",
  //   "Korean",
  //   "Tamil",
  //   "Telugu",
  //   "Malayalam",
  //   "Kannada",
  // ];
  const languageOptions = [
    "English",
    "Hindi",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Korean",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Kannada",
    "Bengali",
    "Marathi",
    "Punjabi",
    "Gujarati",
    "Odia",
    "Assamese",
    "Urdu",
    "Nepali",
    "Arabic",
    "Russian",
    "Portuguese",
    "Italian",
    "Dutch",
    "Turkish",
    "Vietnamese",
    "Thai",
    "Indonesian",
    "Polish",
  ]?.map((item) => ({ value: item === "Hindi" ? "Hindi" : item, label: item }));
  const ageRatingOptions = ["U", "UA", "A", "R", "PG-13", "PG", "G", "NC-17"];

  const CREW_ROLES_CONFIG = [
    { role: "Director", field: "director", icon: "" },
    { role: "Producer", field: "producer", icon: "" },
    { role: "Writer", field: "writer", icon: "" },
    { role: "Music Director", field: "musicDirector", icon: "" },
    { role: "Cinematographer", field: "cinematographer", icon: "" },
    { role: "Editor", field: "editor", icon: "" },
  ];

  const fetchMovies = async () => {
    try {
      setListingCallingLoading(true);
      const response = await API.get(
        `/movies?limit=${limit}&page=${currentPage}?`,
      );
      setMovies(response.data.data || []);
    } catch {
      toast.error("Failed to fetch movies");
    } finally {
      setListingCallingLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [currentPage, limit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    const file = files[0];
    setFormData({ ...formData, [name]: file });

    const makePreview = (setter) => {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    };

    if (name === "verticalPoster") makePreview(setPreviewPoster);
    if (name === "horizontalBanner") makePreview(setPreviewBanner);
    if (name === "logo") makePreview(setPreviewLogo);
    if (name === "movieFile") {
      setUploadStatus(
        `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      );
      setPreviewVideoUrl(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, movieFile: file, customVideoUrl: "" }));
    }
    if (name === "trailerFile") {
      setPreviewTrailerUrl(URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        trailerFile: file,
        customTrailerUrl: "",
      }));
    }
  };

  // ── Crew / Cast image handlers ──────────────────────────────────────────
  const handleCrewImageChange = (file, index, roleField) => {
    const key = `crewImages_${roleField}_${index}`;
    setCrewImageFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleCastImageChange = (file, index) => {
    const key = `castImage_${index}`;
    setCrewImageFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleArrayChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const addCrewMember = () => {
    if (!newCrewName.trim()) return;
    const roleField = CREW_ROLES_CONFIG.find(
      (r) => r.role === selectedCrewRole,
    )?.field;
    if (!roleField) return;
    const existing = formData[roleField] || [];
    // Store as object so image can be attached
    handleArrayChange(roleField, [
      ...existing,
      { name: newCrewName.trim(), imageUrl: "", publicId: "" },
    ]);
    toast.success(`${newCrewName} added as ${selectedCrewRole}`);
    setNewCrewName("");
    setShowModal(false);
  };

  const removeCrewMember = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index);
    handleArrayChange(field, updated);
    // Clean up image file if any
    const key = `crewImages_${field}_${index}`;
    setCrewImageFiles((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    toast.info("Crew member removed");
  };

  const addCastMember = () => {
    if (!searchTerm.trim() || !characterName.trim()) {
      toast.error("Please enter cast name and character");
      return;
    }
    handleArrayChange("castMembers", [
      ...formData.castMembers,
      {
        name: searchTerm.trim(),
        character: characterName.trim(),
        imageUrl: "",
        publicId: "",
      },
    ]);
    toast.success(`${searchTerm} added as ${characterName}`);
    setSearchTerm("");
    setCharacterName("");
    setShowModal(false);
  };

  const removeCastMember = (index) => {
    const updated = formData.castMembers.filter((_, i) => i !== index);
    handleArrayChange("castMembers", updated);
    const key = `castImage_${index}`;
    setCrewImageFiles((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    toast.info("Cast member removed");
  };

  const updateCharacter = (index, newCharacter) => {
    const updated = formData.castMembers.map((c, i) =>
      i === index ? { ...c, character: newCharacter } : c,
    );
    handleArrayChange("castMembers", updated);
  };

  const addAudioTrack = () => {
    const language = prompt("Enter audio language:");
    if (language?.trim()) {
      handleArrayChange("audioTracks", [
        ...formData.audioTracks,
        language.trim(),
      ]);
      toast.success(`${language} audio track added`);
    }
  };

  const addSubtitle = () => {
    const language = prompt("Enter subtitle language:");
    if (language?.trim()) {
      handleArrayChange("subtitles", [...formData.subtitles, language.trim()]);
      toast.success(`${language} subtitles added`);
    }
  };

  const playVideo = (url, type = "auto") => {
    if (!url) {
      toast.error("No video URL available");
      return;
    }
    setCurrentVideoUrl(url);
    setVideoType(type);
    setShowVideoPlayer(true);
  };

  const togglePublishStatus = async (movieId) => {
    try {
      const response = await API.patch(`/movies/${movieId}/publish`);
      if (response.data.success) {
        // toast.success(
        //   `Movie ${response.data.data.publishStatus ? "Published" : "Unpublished"} successfully!`,
        // );
        message.success(
          `Movie ${response.data.data.publishStatus ? "Published" : "Unpublished"} successfully!`,
        );
        fetchMovies();
      }
    } catch {
      toast.error("Failed to toggle publish status");
    }
  };

  const handleSubmit = async (e, publishImmediately = false) => {
    e.preventDefault();

    if (
      !formData.movieTitle ||
      !formData.description ||
      !formData.lang ||
      !formData.duration ||
      !formData.ageRating ||
      !formData.releaseYear
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!formData.movieFile && !formData.customVideoUrl) {
      toast.error("Please upload a video file or provide a video URL");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadStatus("Preparing upload...");

    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value === null || value === undefined || value === "") return;

      if (
        [
          "movieFile",
          "trailerFile",
          "horizontalBanner",
          "verticalPoster",
          "logo",
        ].includes(key)
      ) {
        if (value instanceof File) submitData.append(key, value);
      } else if (key === "customVideoUrl" || key === "customTrailerUrl") {
        if (value) submitData.append(key, value);
      } else if (Array.isArray(value)) {
        if (value.length > 0) submitData.append(key, JSON.stringify(value));
      } else if (typeof value !== "object") {
        submitData.append(key, value);
      }
    });

    // Boolean overrides
    submitData.append(
      "publishStatus",
      publishImmediately ? "true" : formData.publishStatus ? "true" : "false",
    );
    submitData.append(
      "subscriptionRequired",
      formData.subscriptionRequired ? "true" : "false",
    );
    submitData.append("enableAds", formData.enableAds ? "true" : "false");
    submitData.append(
      "allowDownloads",
      formData.allowDownloads ? "true" : "false",
    );
    submitData.append(
      "featuredMovie",
      formData.featuredMovie ? "true" : "false",
    );

    // Crew & cast image files
    Object.entries(crewImageFiles).forEach(([key, file]) => {
      if (file instanceof File) submitData.append(key, file);
    });

    try {
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            const progress = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(progress);
            setUploadStatus(`Uploading: ${progress}%`);
          }
        },
      };

      if (editingMovie) {
        setUploadStatus("Updating movie...");
        await API.put(`/movies/${editingMovie._id}`, submitData, config);
        toast.success("Movie updated successfully!");
      } else {
        setUploadStatus("Uploading to Bunny CDN and transcoding...");
        const response = await API.post("/movies", submitData, config);
        if (response.data.success) {
          toast.success("Movie created successfully!");
          if (response.data.data.movieFile?.hlsUrl)
            toast.success("✅ Video uploaded & transcoded! HLS Stream ready");
        }
      }

      resetForm();
      await fetchMovies();
      setShowList(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save movie");
      setUploadStatus("Upload failed");
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadStatus("");
    }
  };

  const resetForm = () => {
    setFormData({
      movieTitle: "",
      tagline: "",
      description: "",
      fullStoryline: "",
      genres: [],
      tags: [],
      lang: "",
      selectedLanguage: "",
      duration: "",
      ageRating: "",
      imdbRating: "",
      releaseYear: "",
      productionStudio: [],
      countryOfOrigin: [],
      budget: "",
      awardsAndNominations: "",
      movieFile: null,
      trailerFile: null,
      customVideoUrl: "",
      customTrailerUrl: "",
      horizontalBanner: null,
      verticalPoster: null,
      logo: null,
      videoQuality: "Auto (Adaptive)",
      audioFormat: "Stereo",
      director: [],
      producer: [],
      writer: [],
      musicDirector: [],
      cinematographer: [],
      editor: [],
      castMembers: [],
      audioTracks: [],
      subtitles: [],
      publishStatus: false,
      subscriptionRequired: false,
      enableAds: true,
      allowDownloads: true,
      featuredMovie: false,
      contentVendor: "Internal",
      vendorId: "",
      publishDate: "",
      expiryDate: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
      movieFileUrl: "",
      movieFileThumbnail: "",
      horizontalBannerUrl: "",
      verticalPosterUrl: "",
      logoUrl: "",
    });
    setPreviewPoster(null);
    setPreviewBanner(null);
    setPreviewLogo(null);
    setPreviewVideoUrl("");
    setPreviewTrailerUrl("");
    setEditingMovie(null);
    setUploadStatus("");
    setCrewImageFiles({});
  };

  // const deleteMovie = async (id) => {
  //   if (
  //     window.confirm(
  //       "Delete this movie? This will also delete the video from Bunny CDN.",
  //     )
  //   ) {
  //     try {
  //       await API.delete(`/movies/${id}`);
  //       toast.success("Movie deleted from database and Bunny CDN");
  //       await fetchMovies();
  //     } catch {
  //       toast.error("Failed to delete");
  //     }
  //   }
  // };
  const [movieDeleteId, setMovieDeleteId] = useState("");

  const deleteMovie = async () => {
    try {
      setDeleteLoading(true);
      const res = await API.delete(`/movies/${movieDeleteId}`);
      if (res?.status === 200) {
        setDeleteOpen(false);
        await fetchMovies();
        message.success("Banner Delete Successfully");
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
  const editMovie = (movie) => {
    setEditingMovie(movie);
    setFormData({
      movieTitle: movie.movieTitle || "",
      tagline: movie.tagline || "",
      description: movie.description || "",
      fullStoryline: movie.fullStoryline || "",
      genres: movie.genres || [],
      tags: movie.tags || [],
      lang: movie.lang || "",
      selectedLanguage: movie.selectedLanguage || "",
      duration: movie.duration || "",
      ageRating: movie.ageRating || "",
      imdbRating: movie.imdbRating || "",
      releaseYear: movie.releaseYear || "",
      productionStudio: movie.productionStudio || [],
      countryOfOrigin: movie.countryOfOrigin || [],
      budget: movie.budget || "",
      awardsAndNominations: movie.awardsAndNominations || "",
      movieFile: null,
      trailerFile: null,
      customVideoUrl:
        movie.customVideoUrl ||
        movie.movieFile?.url ||
        movie.movieFile?.hlsUrl ||
        "",
      customTrailerUrl: movie.customTrailerUrl || movie.trailer?.hlsUrl || "",
      horizontalBanner: null,
      verticalPoster: null,
      logo: null,
      videoQuality: movie.videoQuality || "Auto (Adaptive)",
      audioFormat: movie.audioFormat || "Stereo",
      director: movie.director || [],
      producer: movie.producer || [],
      writer: movie.writer || [],
      musicDirector: movie.musicDirector || [],
      cinematographer: movie.cinematographer || [],
      editor: movie.editor || [],
      castMembers: movie.castMembers || [],
      audioTracks: movie.audioTracks || [],
      subtitles: movie.subtitles || [],
      publishStatus: movie.publishStatus || false,
      subscriptionRequired: movie.subscriptionRequired || false,
      enableAds: movie.enableAds !== undefined ? movie.enableAds : true,
      allowDownloads: movie.allowDownloads || true,
      featuredMovie: movie.featuredMovie || false,
      contentVendor: movie.contentVendor || "Internal",
      vendorId: movie.vendorId || "",
      publishDate: movie.publishDate
        ? new Date(movie.publishDate).toISOString().slice(0, 16)
        : "",
      expiryDate: movie.expiryDate
        ? new Date(movie.expiryDate).toISOString().slice(0, 16)
        : "",
      seoTitle: movie.seoTitle || "",
      seoDescription: movie.seoDescription || "",
      seoKeywords: movie.seoKeywords || [],
      movieFileUrl: movie.movieFile?.hlsUrl || movie.movieFile?.url || "",
      movieFileThumbnail: movie.movieFile?.thumbnailUrl || "",
      horizontalBannerUrl: movie.horizontalBanner?.url || "",
      verticalPosterUrl: movie.verticalPoster?.url || "",
      logoUrl: movie.logo?.url || "",
    });

    if (movie.verticalPoster?.url) setPreviewPoster(movie.verticalPoster.url);
    if (movie.horizontalBanner?.url)
      setPreviewBanner(movie.horizontalBanner.url);
    if (movie.logo?.url) setPreviewLogo(movie.logo.url);
    if (movie.movieFile?.hlsUrl || movie.customVideoUrl)
      setPreviewVideoUrl(movie.movieFile?.hlsUrl || movie.customVideoUrl);
    if (movie.trailer?.hlsUrl || movie.customTrailerUrl)
      setPreviewTrailerUrl(movie.trailer?.hlsUrl || movie.customTrailerUrl);

    setCrewImageFiles({});
    setShowList(false);
    setActiveTab("basic");
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.movieTitle
      ?.toLowerCase()
      .includes(searchMovie.toLowerCase());
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "published"
          ? movie.publishStatus
          : !movie.publishStatus;
    return matchesSearch && matchesStatus;
  });

  // paste your JSON here

  const [totalPages, setTotalPages] = useState(1);

  const [getAllCast, setGetAllCaset] = useState([]);

  const MovieTable = () => {
    const columns = [
      {
        title: "Poster",

        dataIndex: "verticalPoster",
        key: "poster",
        render: (poster, record) => (
          <img
            src={poster?.url}
            alt={record.movieTitle}
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ),
      },
      {
        title: "Title",
        dataIndex: "movieTitle",
        key: "title",
      },
      {
        title: "Genre",
        dataIndex: "genres",
        key: "genres",
        render: (genres) => genres?.join(", "),
      },
      {
        title: "Language",
        dataIndex: "lang",
        key: "lang",
      },
      {
        title: "Year",
        dataIndex: "releaseYear",
        key: "year",
      },
      {
        title: "Rating",
        dataIndex: "imdbRating",
        key: "rating",
        render: (rating) => `⭐ ${rating}`,
      },
      {
        title: "Status",
        dataIndex: "publishStatus",
        key: "status",
        render: (status, record) => (
          <Space>
            <Switch
              checked={status}
              onChange={() => togglePublishStatus(record._id)}
            />
            <Tag color={status ? "green" : "orange"}>
              {status ? "Published" : "Draft"}
            </Tag>
          </Space>
        ),
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Space>
            <button
              className="px-5 py-2 rounded-xl  text-black font-medium shadow-md  hover:shadow-md transition-all duration-200"
              onClick={() => editMovie(record)}
            >
              Edit
            </button>
            <button
              className="px-5 py-2 rounded-xl  text-black font-medium shadow-md  hover:shadow-md transition-all duration-200"
              onClick={() => {
                setDeleteOpen(true);
                setMovieDeleteId(record._id);
              }}
            >
              Delete
            </button>
          </Space>
        ),
      },
    ];

    return (
      <div style={{ padding: 16 }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredMovies}
          loading={loading}
          // pagination={{
          //   current: currentPage,
          //   pageSize: limit,
          //   total: total,
          //   showSizeChanger: true,
          //   pageSizeOptions: ["10", "25", "50", "100"],
          // }}
          // onChange={(pagination) => {
          //   setCurrentPage(pagination.current);
          //   setLimit(pagination.pageSize);
          // }}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </div>
    );
  };

  const [groupedData, setGroupedData] = useState({});

  const groupByRole = (data) => {
    const grouped = {};

    data.forEach((item) => {
      let role = item.role || "Other";

      // Treat "Other" as cast
      if (role === "Other") {
        role = "cast";
      }

      if (!grouped[role]) {
        grouped[role] = [];
      }

      grouped[role].push(item);
    });

    return grouped;
  };

  const getCastAndCrewAll = async () => {
    try {
      const res = await getAllCastAndCrewAPI();
      if (res?.status === 200) {
        const response = res?.data?.data || [];
        setGetAllCaset(response);

        const grouped = groupByRole(response);
        setGroupedData(grouped);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCastAndCrewAll();
  }, []);
  // ─── Crew name helper ────────────────────────────────────────────────────
  const getCrewName = (member) =>
    typeof member === "string" ? member : member?.name || "";
  if (listingCallingLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    // <AdminLayout>
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <div>
        {!showList && movies.length > 0 && !editingMovie && (
          <Button onClick={() => setShowList(true)}>
            View All Movies ({movies.length})
          </Button>
        )}
        {editingMovie && (
          <>
            <button
              onClick={() => {
                resetForm();
                if (movies.length) setShowList(true);
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </>
        )}

        {showList ? (
          <div className="movies-list ">
            <div className="list-header boxShadowNew  p-2 rounded-[12px] boxShadowNew">
              <h2>All Movies</h2>
              <div className="controls 0 flex gap-2 items-center relative top-1">
                <input
                  type="text"
                  className="text-black w-[200px]"
                  placeholder="Search..."
                  value={searchMovie}
                  onChange={(e) => setSearchMovie(e.target.value)}
                />
                <select
                  className="text-black w-[200px] custom-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowList(false);
                  }}
                  className="relative bottom-1"
                >
                  <Plus className="h-4 w-4" /> Add Movie
                </Button>
              </div>
            </div>
            {/* <div className="movies-grid"> */}
            <div>
              {/* {filteredMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))} */}
              <MovieTable />
            </div>
          </div>
        ) : (
          <div className="movie-form">
            <div className="tabs">
              <button
                className={activeTab === "basic" ? "active" : ""}
                onClick={() => setActiveTab("basic")}
              >
                {" "}
                Basic
              </button>
              <button
                className={activeTab === "media" ? "active" : ""}
                onClick={() => setActiveTab("media")}
              >
                {" "}
                Media
              </button>
              <button
                className={activeTab === "crew" ? "active" : ""}
                onClick={() => setActiveTab("crew")}
              >
                Crew & Cast
              </button>
              <button
                className={activeTab === "settings" ? "active" : ""}
                onClick={() => setActiveTab("settings")}
              >
                {" "}
                Settings
              </button>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)}>
              {/* ── BASIC TAB ── */}
              {/* {activeTab === "basic" && (
                <div className="tab-content">
                  <div className="form-row">

                  
                  <div className="form-group"><label>Movie Title *</label><input className="text-black w-[100%] " name="movieTitle" value={formData.movieTitle} onChange={handleChange} /></div>
                  <div className="form-group"><label>Tagline</label><input className="text-black w-full" name="tagline" value={formData.tagline} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Description *</label><textarea className="text-black" name="description" value={formData.description} onChange={handleChange} rows="4" /></div>
                  <div className="form-group"><label>Full Storyline</label><textarea className="text-black" name="fullStoryline" value={formData.fullStoryline} onChange={handleChange} rows="6" /></div>

                  <h3 className="text-black">Genres</h3>
                  <div className="genre-buttons">
                    {genreOptions.map((g) => (
                      <button className="text-black" type="button" key={g}
                        className={formData.genres.includes(g) ? "active" : ""}
                        onClick={() => {
                          const updated = formData.genres.includes(g)
                            ? formData.genres.filter((x) => x !== g)
                            : [...formData.genres, g];
                          handleArrayChange("genres", updated);
                        }}
                      >{g}</button>
                    ))}
                  </div>

                  <div className="form-group"><label>Tags</label><input className="text-black" value={formData.tags.join(", ")} onChange={(e) => handleArrayChange("tags", e.target.value.split(",").map((t) => t.trim()))} /></div>

                  <div className="form-row">
                    <div className="form-group"><label>Language *</label>
                      <select className="text-black" name="language" value={formData.language} onChange={handleChange}>
                        <option value="">Select</option>{languageOptions.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Duration (min) *</label><input className="text-black" type="number" name="duration" value={formData.duration} onChange={handleChange} /></div>
                  </div>

                  <div className="form-row">
                    <div className="form-group"><label>Age Rating *</label>
                      <select className="text-black" name="ageRating" value={formData.ageRating} onChange={handleChange}>
                        <option value="">Select</option>{ageRatingOptions.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Release Year *</label><input className="text-black" type="number" name="releaseYear" value={formData.releaseYear} onChange={handleChange} /></div>
                  </div>

                  <div className="form-row">
                    <div className="form-group"><label>IMDB Rating</label><input className="text-black"  type="number" name="imdbRating" value={formData.imdbRating} onChange={handleChange} step="0.1" /></div>
                    <div className="form-group"><label>Budget</label><input className="text-black" name="budget" value={formData.budget} onChange={handleChange} /></div>
                  </div>
                </div>
              )} */}
              {activeTab === "basic" && (
                <div className="px-2 mx-auto space-y-8">
                  <div className="grid grid-cols-2 items-start gap-3">
                    <div className="bg-white rounded-2xl p-6 space-y-6 boxShadowData">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Movie Details
                      </h2>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Movie Title *
                          </label>
                          <input
                            name="movieTitle"
                            value={formData.movieTitle}
                            onChange={handleChange}
                            placeholder="Enter movie title"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none text-gray-800"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medMium text-gray-700 mb-1">
                            Tagline
                          </label>
                          <input
                            name="tagline"
                            value={formData.tagline}
                            onChange={handleChange}
                            placeholder="A short catchy tagline"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none text-gray-800"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Write a compelling description of the movie..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none text-gray-800"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Storyline
                          </label>
                          <textarea
                            name="fullStoryline"
                            value={formData.fullStoryline}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Detailed storyline without spoilers..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none text-gray-800"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl  p-6 space-y-6 boxShadowData">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Movie Metadata
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Language *
                          </label>
                          <Select
                            name="lang"
                            value={formData.lang}
                            // onChange={(e)=>console.log(e,';get vaa')}
                            onChange={(e) =>
                              setFormData({ ...formData, lang: e })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          >
                            {languageOptions.map((l) => (
                              <option key={l?.value} value={l.value}>
                                {l?.label}
                              </option>
                            ))}
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Release Date *
                          </label>
                          <input
                            type="date"
                            name="releaseDate"
                            value={formData.releaseDate || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (minutes) *
                          </label>
                          <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age Rating *
                          </label>
                          <select
                            name="ageRating"
                            value={formData.ageRating}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          >
                            <option value="">Select rating</option>
                            {ageRatingOptions.map((r) => (
                              <option key={r}>{r}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            IMDB Rating
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            name="imdbRating"
                            value={formData.imdbRating}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Release Year *
                          </label>
                          <input
                            type="number"
                            name="releaseYear"
                            value={formData.releaseYear}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" rounded-2xl  p-6 space-y-6 boxShadowData mb-">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Genre & Categories
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Genres *
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {genreOptions.map((g) => {
                          const isActive = formData.genres.includes(g);

                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => {
                                const updated = isActive
                                  ? formData.genres.filter((x) => x !== g)
                                  : [...formData.genres, g];
                                handleArrayChange("genres", updated);
                              }}
                              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                                isActive
                                  ? "bg-orange-500 text-white border-orange-500"
                                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                              }`}
                            >
                              {g}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags / Keywords
                      </label>

                      <input
                        value={formData.tags.join(", ")}
                        onChange={(e) =>
                          handleArrayChange(
                            "tags",
                            e.target.value.split(",").map((t) => t.trim()),
                          )
                        }
                        placeholder="Add a tag"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── MEDIA TAB ── */}
              {activeTab === "media" && (
                <div className="tab-content">
                  {/* ── Main Movie Video ── */}
                  <div className="grid grid-cols-2 items-start gap-6">
                    <div className="media-section-card boxShadowData">
                      <div className="media-section-header">
                        <div className="font-semibold text-xl">Main Movie</div>
                      </div>

                      <div className="video-upload-grid">
                        <div className="video-upload-col">
                          <h4>Upload Video File</h4>
                          <div className="file-upload  w-full border border-red-600">
                            <input
                              type="file"
                              name="movieFile"
                              onChange={handleFileChange}
                              accept="video/*"
                              id="movieFile"
                            />
                            <label htmlFor="movieFile">
                              Click to upload video (MP4, MOV, MKV – up to 5GB)
                            </label>
                            {formData.movieFile instanceof File && (
                              <div className="file-info">
                                <p> {formData.movieFile.name}</p>
                                <p>
                                  Size:{" "}
                                  {(
                                    formData.movieFile.size /
                                    (1024 * 1024)
                                  ).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                            )}
                          </div>

                          <h4>OR External URL</h4>
                          <div className="video-url-option">
                            <input
                              type="text"
                              name="customVideoUrl"
                              value={formData.customVideoUrl}
                              onChange={(e) => {
                                const url = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  customVideoUrl: url,
                                }));
                                setPreviewVideoUrl(url);
                                if (url)
                                  setFormData((prev) => ({
                                    ...prev,
                                    movieFile: null,
                                  }));
                              }}
                              placeholder="https://example.com/video.m3u8 or .mp4"
                            />
                            {formData.customVideoUrl && (
                              <button
                                type="button"
                                className="test-video-btn"
                                onClick={() =>
                                  playVideo(
                                    formData.customVideoUrl,
                                    formData.customVideoUrl.includes(".m3u8")
                                      ? "hls"
                                      : "mp4",
                                  )
                                }
                              >
                                Test Video
                              </button>
                            )}
                          </div>
                        </div>

                        {(previewVideoUrl || formData.movieFileUrl) && (
                          <div className="video-preview-col">
                            <h4>Preview</h4>
                            <div
                              className="video-preview-thumb"
                              onClick={() =>
                                playVideo(
                                  previewVideoUrl || formData.movieFileUrl,
                                  "auto",
                                )
                              }
                            >
                              <div className="video-thumb-overlay">
                                <span className="play-circle">▶</span>
                              </div>
                              <video
                                src={previewVideoUrl || formData.movieFileUrl}
                                style={{ width: "100%", borderRadius: 8 }}
                              />
                            </div>
                            {formData.movieFileUrl &&
                              !formData.customVideoUrl &&
                              !formData.movieFile && (
                                <p className="existing-url-note">
                                  🎬 Existing HLS stream saved
                                </p>
                              )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Trailer Video ── */}
                    <div className="media-section-card trailer-card boxShadowData">
                      <div className="media-section-header">
                        <h3 className="text-xl">Trailer</h3>
                        <span className="optional-badge">Optional</span>
                      </div>

                      <div className="video-upload-grid">
                        <div className="video-upload-col">
                          <h4>Upload Trailer File</h4>
                          <div className="file-upload">
                            <input
                              type="file"
                              name="trailerFile"
                              onChange={handleFileChange}
                              accept="video/*"
                              id="trailerFile"
                            />
                            <label htmlFor="trailerFile">
                              {" "}
                              Click to upload trailer (MP4, MOV, MKV)
                            </label>
                            {formData.trailerFile instanceof File && (
                              <div className="file-info">
                                <p> {formData.trailerFile.name}</p>
                                <p>
                                  Size:{" "}
                                  {(
                                    formData.trailerFile.size /
                                    (1024 * 1024)
                                  ).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                            )}
                          </div>

                          <h4>OR External Trailer URL</h4>
                          <div className="video-url-option">
                            <input
                              type="text"
                              name="customTrailerUrl"
                              value={formData.customTrailerUrl}
                              onChange={(e) => {
                                const url = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  customTrailerUrl: url,
                                }));
                                setPreviewTrailerUrl(url);
                                if (url)
                                  setFormData((prev) => ({
                                    ...prev,
                                    trailerFile: null,
                                  }));
                              }}
                              placeholder="https://example.com/trailer.m3u8 or .mp4"
                            />
                            {formData.customTrailerUrl && (
                              <button
                                type="button"
                                className="test-video-btn"
                                onClick={() =>
                                  playVideo(
                                    formData.customTrailerUrl,
                                    formData.customTrailerUrl.includes(".m3u8")
                                      ? "hls"
                                      : "mp4",
                                  )
                                }
                              >
                                Test Trailer
                              </button>
                            )}
                          </div>
                        </div>

                        {previewTrailerUrl && (
                          <div className="video-preview-col">
                            <h4>Trailer Preview</h4>
                            <div
                              className="video-preview-thumb"
                              onClick={() =>
                                playVideo(previewTrailerUrl, "auto")
                              }
                            >
                              <div className="video-thumb-overlay">
                                <span className="play-circle">▶</span>
                              </div>
                              <video
                                src={previewTrailerUrl}
                                style={{ width: "100%", borderRadius: 8 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Upload Progress */}
                  {uploadProgress > 0 && (
                    <div className="upload-progress">
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="upload-status">{uploadStatus}</p>
                      {/* {uploadProgress === 100 && (
                        <p className="transcoding-note">
                          {" "}
                          Upload complete! Video is transcoding on Bunny CDN.
                        </p>
                      )} */}
                    </div>
                  )}

                  {/* ── Images ── */}
                  <div className="images-grid">
                    {/* Logo */}
                    <div className="image-upload-card box boxShadowData">
                      <h4 className="text-xl"> Logo</h4>
                      <p className="image-hint">
                        PNG preferred, transparent bg
                      </p>
                      <div className="file-upload">
                        <input
                          type="file"
                          name="logo"
                          onChange={handleFileChange}
                          accept="image/*"
                          id="logo"
                        />
                        <label htmlFor="logo" className="image-upload-label">
                          {previewLogo || formData.logoUrl ? (
                            <img
                              src={previewLogo || formData.logoUrl}
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

                    {/* Horizontal Banner */}
                    <div className="image-upload-card banner-card boxShadowData">
                      <h4 className="text-xl"> Horizontal Banner</h4>
                      <p className="image-hint">1920×1080 (16:9)</p>
                      <div className="file-upload">
                        <input
                          type="file"
                          name="horizontalBanner"
                          onChange={handleFileChange}
                          accept="image/*"
                          id="banner"
                        />
                        <label htmlFor="banner" className="image-upload-label">
                          {previewBanner || formData.horizontalBannerUrl ? (
                            <img
                              src={
                                previewBanner || formData.horizontalBannerUrl
                              }
                              alt="Banner Preview"
                              className="preview"
                            />
                          ) : (
                            <div className="image-placeholder wide">
                              <span>🖼️</span>
                              <p>Upload Banner</p>
                            </div>
                          )}
                          <div className="image-overlay">📷 Change</div>
                        </label>
                      </div>
                    </div>

                    {/* Vertical Poster */}
                    <div className="image-upload-card boxShadowData">
                      <h4 className="text-xl"> Vertical Poster</h4>
                      <p className="image-hint">600×900 (2:3)</p>
                      <div className="file-upload">
                        <input
                          type="file"
                          name="verticalPoster"
                          onChange={handleFileChange}
                          accept="image/*"
                          id="poster"
                        />
                        <label htmlFor="poster" className="image-upload-label">
                          {previewPoster || formData.verticalPosterUrl ? (
                            <img
                              src={previewPoster || formData.verticalPosterUrl}
                              alt="Poster Preview"
                              className="poster-preview"
                            />
                          ) : (
                            <div className="image-placeholder tall">
                              <span>🎭</span>
                              <p>Upload Poster</p>
                            </div>
                          )}
                          <div className="image-overlay">📷 Change</div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CREW & CAST TAB ── */}
              {activeTab === "crew" && (
                <div className="tab-content">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[12px] p-3 boxShadowData">
                      <h3 className="section-heading text-xl ">
                        {" "}
                        Crew Members
                      </h3>
                      <div className="crew-grid">
                        {CREW_ROLES_CONFIG.map(({ role, field, icon }) => (
                          <div key={role} className="crew-card boxShadowData">
                            <h4 className="text-lg">
                              {icon} {role}
                            </h4>
                            {/* <Select
                              showSearch
                              placeholder={`Select ${role}`}
                              style={{ width: "100%", marginBottom: 10 }}
                              onChange={(value) =>
                                handleSelectCast(value, field)
                              }

                               filterOption={(input, option) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                  }

                            >
                              {(groupedData[role] || []).map((person) => (
                                <Option key={person._id} value={person._id}>
                                  {person.personName}
                                </Option>
                              ))}
                            </Select> */}
                            <div className="crew-list">
                              {(formData[field] || []).map((member, idx) => (
                                <div key={idx} className="crew-member-row">
                                  {/* Avatar upload */}
                                  <PersonImageUpload
                                    person={member}
                                    index={idx}
                                    role={field}
                                    label={getCrewName(member)}
                                    onImageChange={handleCrewImageChange}
                                  />
                                  <div className="crew-member-info">
                                    <span className="crew-member-name">
                                      {getCrewName(member)}
                                    </span>
                                    {crewImageFiles[
                                      `crewImages_${field}_${idx}`
                                    ] && (
                                      <span className="image-selected-badge">
                                        📷 Photo selected
                                      </span>
                                    )}
                                    {typeof member === "object" &&
                                      member.imageUrl &&
                                      !crewImageFiles[
                                        `crewImages_${field}_${idx}`
                                      ] && (
                                        <span className="image-saved-badge">
                                          ✅ Photo saved
                                        </span>
                                      )}
                                  </div>
                                  <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeCrewMember(field, idx)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="add-crew-btn"
                              onClick={() => {
                                setModalType("crew");
                                setSelectedCrewRole(role);
                                setShowModal(true);
                              }}
                            >
                              + Add {role}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="boxShadowData rounded-[12px] p-4 ">
                      <h3 className=" text-xl font-semibold"> Cast Members</h3>
                        {/* <Select
                              showSearch
                              placeholder="Select Cast Member"
                              style={{ width: "100%", marginBottom: 10 }}
                              onChange={(value) => handleSelectCastNew(value)}
                            >
                              {(groupedData["cast"] || []).map((person) => (
                                <Option key={person._id} value={person._id}>
                                  {person.personName}
                                </Option>
                              ))}
                            </Select> */}
                      <div className="cast-section mt-4">
                        {formData.castMembers.length === 0 ? (
                          <div className="empty-cast">
                            No cast members added yet
                          </div>
                        ) : (
                          <div className="cast-grid">
                          
                            {formData.castMembers.map((cast, idx) => (
                              <div key={idx} className="cast-member-card">
                                {/* Cast photo upload */}
                                <div className="cast-photo-area">
                                  <PersonImageUpload
                                    person={cast}
                                    index={idx}
                                    role="cast"
                                    label={cast.name}
                                    onImageChange={(file, index) =>
                                      handleCastImageChange(file, index)
                                    }
                                  />
                                  {crewImageFiles[`castImage_${idx}`] && (
                                    <span className="image-selected-badge small">
                                      📷 Selected
                                    </span>
                                  )}
                                  {cast.imageUrl &&
                                    !crewImageFiles[`castImage_${idx}`] && (
                                      <span className="image-saved-badge small">
                                        ✅ Saved
                                      </span>
                                    )}
                                </div>
                                <div className="cast-member-details">
                                  <div className="cast-name">{cast.name}</div>
                                  <input
                                    className="cast-character-input"
                                    value={cast.character}
                                    onChange={(e) =>
                                      updateCharacter(idx, e.target.value)
                                    }
                                    placeholder="Character name"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="remove-btn cast-remove"
                                  onClick={() => removeCastMember(idx)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          type="button"
                          className="add-cast-btn"
                          onClick={() => {
                            setModalType("cast");
                            setShowModal(true);
                          }}
                        >
                          + Add Cast Member
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SETTINGS TAB ── */}
              {activeTab === "settings" && (
                <div className="tab-content grid grid-cols-2 gap-4 items-start">
                  {/* //grid here  */}
                  <div className=" p-4 boxShadowData rounded-[12px]">
                    <div className="settings-grid">
                      {[
                        {
                          key: "publishStatus",
                          title: "Publish Status",
                          desc: "Make this movie visible to users",
                        },
                        {
                          key: "subscriptionRequired",
                          title: "Subscription Required",
                          desc: "Only premium subscribers can watch",
                        },
                        {
                          key: "enableAds",
                          title: "Enable Ads",
                          desc: "Show ads before/after playback",
                        },
                        {
                          key: "allowDownloads",
                          title: "Allow Downloads",
                          desc: "Users can download for offline viewing",
                        },
                        {
                          key: "featuredMovie",
                          title: "Featured Movie",
                          desc: "Show in featured section",
                        },
                      ].map(({ key, title, desc }) => (
                        <div key={key} className="toggle-item">
                          <div>
                            <div className="toggle-title">{title}</div>
                            <div className="toggle-desc">{desc}</div>
                          </div>
                          <button
                            type="button"
                            className={`toggle-btn ${formData[key] ? "on" : "off"}`}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                [key]: !formData[key],
                              })
                            }
                          >
                            {formData[key] ? "ON" : "OFF"}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Publish Date</label>
                        <input
                          type="datetime-local"
                          name="publishDate"
                          value={formData.publishDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="datetime-local"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 boxShadowData rounded-[12px]">
                    <h3>Audio Tracks</h3>
                    <div className="tag-list">
                      {formData.audioTracks.map((track, i) => (
                        <div key={i} className="tag">
                          🎵 {track}
                          <button
                            onClick={() =>
                              handleArrayChange(
                                "audioTracks",
                                formData.audioTracks.filter((_, j) => j !== i),
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-tag-btn"
                        onClick={addAudioTrack}
                      >
                        + Add Audio
                      </button>
                    </div>

                    <h3>Subtitles</h3>
                    <div className="tag-list">
                      {formData.subtitles.map((sub, i) => (
                        <div key={i} className="tag">
                          📝 {sub}
                          <button
                            onClick={() =>
                              handleArrayChange(
                                "subtitles",
                                formData.subtitles.filter((_, j) => j !== i),
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-tag-btn"
                        onClick={addSubtitle}
                      >
                        + Add Subtitles
                      </button>
                    </div>

                    <h3>SEO</h3>
                    <div className="form-group">
                      <label>SEO Title</label>
                      <input
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>SEO Description</label>
                      <textarea
                        name="seoDescription"
                        value={formData.seoDescription}
                        onChange={handleChange}
                        rows="2"
                      />
                    </div>
                    <div className="form-group">
                      <label>SEO Keywords</label>
                      <input
                        value={formData.seoKeywords.join(", ")}
                        onChange={(e) =>
                          handleArrayChange(
                            "seoKeywords",
                            e.target.value.split(",").map((k) => k.trim()),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={() => {
                    resetForm();
                    if (movies.length) setShowList(true);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="draft" disabled={loading}>
                  {loading ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  className="publish"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                >
                  {loading ? (
                    "Publishing..."
                  ) : (
                    <>{editingMovie ? "Published" : "Publish"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {showVideoPlayer && (
        <div className="modal" onClick={() => setShowVideoPlayer(false)}>
          <div
            className="modal-content video-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Video Player</h3>
            <VideoPlayer url={currentVideoUrl} type={videoType} />
            <button className="close" onClick={() => setShowVideoPlayer(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="modal"
          onClick={() => {
            setShowModal(false);
            setNewCrewName("");
            setCharacterName("");
            setSearchTerm("");
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalType === "crew"
                ? `Add ${selectedCrewRole}`
                : "Add Cast Member"}
            </h3>
            {modalType === "crew" ? (
              <>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && addCrewMember()}
                />
                <p className="modal-hint">
                  💡 You can upload a photo after adding the member from the
                  crew list.
                </p>
                <button onClick={addCrewMember} disabled={!newCrewName.trim()}>
                  Add
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Cast name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Character name"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                />
                <p className="modal-hint">
                  💡 You can upload a photo after adding the cast member.
                </p>
                <button
                  onClick={addCastMember}
                  disabled={!searchTerm.trim() || !characterName.trim()}
                >
                  Add to Movie
                </button>
              </>
            )}
            <button className="close" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <CommonDeleteModal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={deleteMovie}
        loading={deleteLoading}
      />
    </>
  );
};

export default Movies;
