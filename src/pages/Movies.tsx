// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, X, Clock, Star, Globe, Play, LayoutGrid, List, Building2, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
// } from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { toast } from "sonner";
// import { useMoviesDB, MovieDB } from "@/hooks/useMoviesDB";
// import axios from "axios";

// const statusStyles = {
//   published: "bg-success/10 text-success border-success/20",
//   pending: "bg-warning/10 text-warning border-warning/20",
//   draft: "bg-muted text-muted-foreground border-border",
// };

// export default function Movies() {

// const API = axios.create({
//   baseURL: "https://gutargoobackend-cem4.onrender.com/api",
//   timeout: 300000,
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
//   const navigate = useNavigate();
//   // const { movies, isLoading, deleteMovie } = useMoviesDB();

//   const [movies,setMovies] = useState([]);
//   const [isLoading,setIsLoading] = useState(true);

//     useEffect(() => { fetchMovies(); }, []);

//   const fetchMovies = async () => {
//     try {
//       const response = await API.get("/public/movies");
//       console.log(response,'get response');
//       setMovies(response.data.data || []);
//       setIsLoading(false);
//     } catch {
//       toast.error("Failed to fetch movies");
//       setIsLoading(false);
//     }
//   };

//   const [searchQuery, setSearchQuery] = useState("");
//   const [previewMovie, setPreviewMovie] = useState<MovieDB | null>(null);
//   const [deleteMovieId, setDeleteMovieId] = useState<string | null>(null);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [genreFilter, setGenreFilter] = useState<string>("all");

//   const filteredMovies = movies.filter((movie) => {
//     const matchesSearch = movie?.movieTitle?.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesStatus = statusFilter === "all" || movie.status === statusFilter;
//     const matchesGenre = genreFilter === "all" || movie.genre.toLowerCase() === genreFilter;
//     return matchesSearch && matchesStatus && matchesGenre;
//   });

//   //   const filteredMovies = movies.filter((movie) => {
//   //   const matchesSearch = movie.movieTitle?.toLowerCase().includes(searchMovie.toLowerCase());
//   //   const matchesStatus =
//   //     filterStatus === "all" ? true :
//   //     filterStatus === "published" ? movie.publishStatus :
//   //     !movie.publishStatus;
//   //   return matchesSearch && matchesStatus;
//   // });

//   const handlePreview = (movie: MovieDB) => {
//     setPreviewMovie(movie);
//   };

//   const handleEdit = (movieId: string) => {
//     navigate(`/movies/edit/${movieId}`);
//   };

//   const handleDelete = async () => {
//     if (deleteMovieId) {
//       const success = await deleteMovie(deleteMovieId);
//       if (success) {
//         toast.success("Movie deleted successfully");
//       }
//       setDeleteMovieId(null);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex h-[50vh] items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="font-display text-3xl font-bold tracking-tight">Movies</h1>
//           <p className="mt-1 text-muted-foreground">
//             Manage your movie catalog ({movies.length} total)
//           </p>
//         </div>
//         <Button className="gap-2" onClick={() => navigate("/movies/add")}>
//           <Plus className="h-4 w-4" />
//           Add Movie
//         </Button>
//       </div>

//       {/* Filters */}
//       <div className="glass-card flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             placeholder="Search movies..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <div className="flex gap-2">
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[130px]">
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="published">Published</SelectItem>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="draft">Draft</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={genreFilter} onValueChange={setGenreFilter}>
//             <SelectTrigger className="w-[130px]">
//               <SelectValue placeholder="Genre" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Genres</SelectItem>
//               <SelectItem value="action">Action</SelectItem>
//               <SelectItem value="drama">Drama</SelectItem>
//               <SelectItem value="comedy">Comedy</SelectItem>
//               <SelectItem value="sci-fi">Sci-Fi</SelectItem>
//             </SelectContent>
//           </Select>

//           {/* View Toggle */}
//           <div className="flex items-center rounded-lg border border-border bg-secondary/30 p-0.5">
//             <button
//               onClick={() => setViewMode("grid")}
//               className={cn(
//                 "flex items-center justify-center rounded-md p-1.5 transition-all",
//                 viewMode === "grid"
//                   ? "bg-primary text-primary-foreground"
//                   : "text-muted-foreground hover:text-foreground"
//               )}
//             >
//               <LayoutGrid className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => setViewMode("list")}
//               className={cn(
//                 "flex items-center justify-center rounded-md p-1.5 transition-all",
//                 viewMode === "list"
//                   ? "bg-primary text-primary-foreground"
//                   : "text-muted-foreground hover:text-foreground"
//               )}
//             >
//               <List className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Empty State */}
//       {filteredMovies.length === 0 && (
//         <div className="glass-card flex flex-col items-center justify-center rounded-xl p-12 text-center">
//           <div className="mb-4 rounded-full bg-muted p-4">
//             <Play className="h-8 w-8 text-muted-foreground" />
//           </div>
//           <h3 className="mb-2 text-lg font-semibold">No movies found</h3>
//           <p className="mb-4 text-sm text-muted-foreground">
//             {searchQuery || statusFilter !== "all" || genreFilter !== "all"
//               ? "Try adjusting your filters"
//               : "Get started by adding your first movie"}
//           </p>
//           <Button onClick={() => navigate("/movies/add")}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Movie
//           </Button>
//         </div>
//       )}

//       {/* Movies Grid View */}
//       {viewMode === "grid" && filteredMovies.length > 0 && (
//         <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
//           {filteredMovies.map((movie) => (
//             <div
//               key={movie.id}
//               className="glass-card group overflow-hidden rounded-lg transition-all hover:scale-[1.02] hover:shadow-lg"
//             >
//               <div className="relative aspect-[2/3] overflow-hidden">
//                 <img
//                   src={movie.thumbnail_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop"}
//                   alt={movie.title}
//                   className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
//                 <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     className="h-7 flex-1 gap-1 text-xs"
//                     onClick={() => handlePreview(movie)}
//                   >
//                     <Eye className="h-3 w-3" />
//                     Preview
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     className="h-7 w-7 p-0"
//                     onClick={() => handleEdit(movie.id)}
//                   >
//                     <Edit className="h-3 w-3" />
//                   </Button>
//                 </div>
//                 <Badge
//                   variant="outline"
//                   className={`absolute left-2 top-2 text-[10px] px-1.5 py-0.5 ${statusStyles[movie.status]}`}
//                 >
//                   {movie.status}
//                 </Badge>
//               </div>
//               <div className="p-2.5">
//                 <div className="mb-1 flex items-start justify-between gap-1">
//                   <h3 className="text-sm font-semibold line-clamp-1">{movie.title}</h3>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
//                         <MoreHorizontal className="h-3.5 w-3.5" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem onClick={() => handlePreview(movie)}>
//                         <Eye className="mr-2 h-4 w-4" />
//                         View Details
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => handleEdit(movie.id)}>
//                         <Edit className="mr-2 h-4 w-4" />
//                         Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem
//                         className="text-destructive"
//                         onClick={() => setDeleteMovieId(movie.id)}
//                       >
//                         <Trash2 className="mr-2 h-4 w-4" />
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//                 <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
//                   <span>{movie.genre}</span>
//                   <span>•</span>
//                   <span>{movie.duration || "N/A"}</span>
//                   <span>•</span>
//                   <span>⭐ {movie.rating || "N/A"}</span>
//                 </div>
//                 {movie.vendor_name && (
//                   <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
//                     <Building2 className="h-3 w-3" />
//                     <span className="line-clamp-1">{movie.vendor_name}</span>
//                   </div>
//                 )}
//                 {movie.subscription_required && (
//                   <Badge variant="outline" className="mt-1.5 text-[10px] px-1.5 py-0 border-primary/20 bg-primary/10 text-primary">
//                     Premium
//                   </Badge>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Movies List View */}
//       {viewMode === "list" && filteredMovies.length > 0 && (
//         <div className="glass-card overflow-hidden rounded-xl">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-border bg-secondary/30">
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Movie</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Genre</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Vendor</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Duration</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Rating</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
//                   <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-border">
//                 {filteredMovies.map((movie) => (
//                   <tr key={movie.id} className="transition-colors hover:bg-secondary/20">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-3">
//                         <img
//                           src={movie.thumbnail_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop"}
//                           alt={movie.title}
//                           className="h-12 w-8 rounded object-cover"
//                         />
//                         <div>
//                           <p className="font-medium">{movie.title}</p>
//                           <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
//                             {movie.description || "No description"}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-sm">{movie.genre}</td>
//                     <td className="px-4 py-3">
//                       {movie.vendor_name ? (
//                         <div className="flex items-center gap-1.5 text-sm">
//                           <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
//                           <span>{movie.vendor_name}</span>
//                         </div>
//                       ) : (
//                         <span className="text-xs text-muted-foreground">—</span>
//                       )}
//                     </td>
//                     <td className="px-4 py-3 text-sm">{movie.duration || "N/A"}</td>
//                     <td className="px-4 py-3">
//                       <span className="flex items-center gap-1 text-sm">
//                         <Star className="h-3.5 w-3.5 text-yellow-500" />
//                         {movie.rating || "N/A"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <Badge variant="outline" className={cn("text-xs", statusStyles[movie.status])}>
//                         {movie.status}
//                       </Badge>
//                     </td>
//                     <td className="px-4 py-3">
//                       {movie.subscription_required ? (
//                         <Badge variant="outline" className="text-xs border-primary/20 bg-primary/10 text-primary">
//                           Premium
//                         </Badge>
//                       ) : (
//                         <Badge variant="outline" className="text-xs">Free</Badge>
//                       )}
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center justify-end gap-1">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-8 w-8"
//                           onClick={() => handlePreview(movie)}
//                         >
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-8 w-8"
//                           onClick={() => handleEdit(movie.id)}
//                         >
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-8 w-8 text-destructive hover:text-destructive"
//                           onClick={() => setDeleteMovieId(movie.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Preview Dialog */}
//       <Dialog open={!!previewMovie} onOpenChange={() => setPreviewMovie(null)}>
//         <DialogContent className="max-w-2xl overflow-hidden p-0">
//           {previewMovie && (
//             <>
//               <div className="relative aspect-video w-full overflow-hidden">
//                 <img
//                   src={previewMovie.thumbnail_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop"}
//                   alt={previewMovie.title}
//                   className="h-full w-full object-cover"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-2 top-2 h-8 w-8 bg-black/50 text-white hover:bg-black/70"
//                   onClick={() => setPreviewMovie(null)}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//                 <div className="absolute bottom-4 left-4 right-4">
//                   <h2 className="text-2xl font-bold text-white">{previewMovie.title}</h2>
//                   <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/80">
//                     <Badge variant="outline" className={statusStyles[previewMovie.status]}>
//                       {previewMovie.status}
//                     </Badge>
//                     <span className="flex items-center gap-1">
//                       <Clock className="h-3.5 w-3.5" />
//                       {previewMovie.duration || "N/A"}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Star className="h-3.5 w-3.5 text-yellow-400" />
//                       {previewMovie.rating || "N/A"}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Globe className="h-3.5 w-3.5" />
//                       {previewMovie.language}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-4 p-6">
//                 <div className="flex flex-wrap gap-2">
//                   <Badge variant="secondary">{previewMovie.genre}</Badge>
//                   {previewMovie.subscription_required && (
//                     <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
//                       Premium
//                     </Badge>
//                   )}
//                   {previewMovie.ads_enabled && (
//                     <Badge variant="outline">Ads Enabled</Badge>
//                   )}
//                 </div>
//                 {previewMovie.vendor_name && (
//                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                     <Building2 className="h-4 w-4" />
//                     <span>Uploaded by: <strong>{previewMovie.vendor_name}</strong></span>
//                   </div>
//                 )}
//                 <p className="text-muted-foreground">{previewMovie.description || "No description available."}</p>
//                 <div className="flex gap-2 pt-2">
//                   <Button className="flex-1 gap-2">
//                     <Play className="h-4 w-4" />
//                     Play Movie
//                   </Button>
//                   <Button variant="outline" onClick={() => handleEdit(previewMovie.id)}>
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation */}
//       <AlertDialog open={!!deleteMovieId} onOpenChange={() => setDeleteMovieId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Movie</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this movie? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Hls from "hls.js";
import "./Movies.css";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, Tag, Switch, Space, message } from "antd";
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://gutargoobackend-cem4.onrender.com/api",
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
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [listingCallingLoading,setListingCallingLoading] = useState(false)
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
    language: "",
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
    allowDownloads: false,
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
  ];
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
      setListingCallingLoading(true)
      const response = await API.get(`/movies?limit=${limit}&page=${currentPage}?`);
      setMovies(response.data.data || []);
    } catch {
      toast.error("Failed to fetch movies");
    }
    finally{
      setListingCallingLoading(false)
    }
  };


    useEffect(() => {
    fetchMovies();
  }, [currentPage,limit]);

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
        message.success( `Movie ${response.data.data.publishStatus ? "Published" : "Unpublished"} successfully!`)
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
      !formData.language ||
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
      language: "",
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
      allowDownloads: false,
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

  const deleteMovie = async (id) => {
    if (
      window.confirm(
        "Delete this movie? This will also delete the video from Bunny CDN.",
      )
    ) {
      try {
        await API.delete(`/movies/${id}`);
        toast.success("Movie deleted from database and Bunny CDN");
        await fetchMovies();
      } catch {
        toast.error("Failed to delete");
      }
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
      language: movie.language || "",
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
      allowDownloads: movie.allowDownloads || false,
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

// const MovieTable = () => {
 

//   // 🔥 Fetch movies from backend
//   const fetchMovies = async (page = 1) => {
//     try {
//       const res = await    (
//         `/api/movies?page=${page}&limit=${limit}`
//       );
//       const data = await res.json();

//       setMovies(data.movies);
//       setTotalPages(data.totalPages);
//       setCurrentPage(data.currentPage);
//     } catch (err) {
//       console.error("Error fetching movies:", err);
//     }
//   };

//   useEffect(() => {
//     fetchMovies(currentPage);
//   }, [currentPage]);

//   return (
//     <div className="p-4 w-full">
//       {/* TABLE */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 text-left">Poster</th>
//               <th className="p-3 text-left">Title</th>
//               <th className="p-3 text-left">Genre</th>
//               <th className="p-3 text-left">Language</th>
//               <th className="p-3 text-left">Year</th>
//               <th className="p-3 text-left">Rating</th>
//               <th className="p-3 text-left">Status</th>
//               <th className="p-3 text-left">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {movies.map((movie) => (
//               <tr key={movie._id} className="border-t hover:bg-gray-50">
//                 <td className="p-3">
//                   <img
//                     src={movie.verticalPoster?.url}
//                     alt={movie.movieTitle}
//                     className="w-12 h-12 object-cover rounded-[8px]"
//                   />
//                 </td>

//                 <td className="p-3 font-semibold">
//                   {movie.movieTitle}
//                 </td>

//                 <td className="p-3">
//                   {movie.genres?.join(", ")}
//                 </td>

//                 <td className="p-3">{movie.language}</td>

//                 <td className="p-3">{movie.releaseYear}</td>

//                 <td className="p-3">⭐ {movie.imdbRating}</td>

//                 {/* STATUS TOGGLE */}
//                 <td className="p-3">
//                   <div className="flex items-center gap-3">
//                     <button
//                       onClick={() =>
//                         togglePublishStatus(movie._id)
//                       }
//                       className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
//                         movie.publishStatus
//                           ? "bg-green-500"
//                           : "bg-gray-300"
//                       }`}
//                     >
//                       <span
//                         className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
//                           movie.publishStatus
//                             ? "translate-x-6"
//                             : "translate-x-0"
//                         }`}
//                       />
//                     </button>

//                     <span
//                       className={`text-sm font-medium ${
//                         movie.publishStatus
//                           ? "text-green-600"
//                           : "text-yellow-600"
//                       }`}
//                     >
//                       {movie.publishStatus
//                         ? "Published"
//                         : "Draft"}
//                     </span>
//                   </div>
//                 </td>

//                 {/* ACTIONS */}
//                 <td className="p-3">
//                   <div className="flex gap-3 items-center">
//                     <div
//                       onClick={() => editMovie(movie)}
//                       className="border border-gray-300 rounded-[8px] px-3 py-1 cursor-pointer"
//                     >
//                       Edit
//                     </div>
//                     <div
//                       onClick={() =>
//                         deleteMovie(movie._id)
//                       }
//                       className="border border-gray-300 rounded-[8px] px-3 py-1 cursor-pointer"
//                     >
//                       Delete
//                     </div>
//                   </div>
//                 </td>





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
          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }}
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
      dataIndex: "language",
      key: "language",
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
          
          onClick={() => editMovie(record)}>Edit</button>
          <button   className="px-5 py-2 rounded-xl  text-black font-medium shadow-md  hover:shadow-md transition-all duration-200"
 onClick={() => deleteMovie(record._id)}>
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
        scroll={{x:'max-content'}}
      />
    </div>
  );
};



  // ─── Movie Card ─────────────────────────────────────────────────────────
  // const MovieCard = ({ movie }) => {
  //   const posterUrl = movie.verticalPoster?.url;
  //   const bannerUrl = movie.horizontalBanner?.url;
  //   const logoUrl = movie.logo?.url;
  //   const videoUrl = movie.movieFile?.status === 4 ? movie.movieFile?.hlsUrl : movie.customVideoUrl || null;
  //   const isHls = videoUrl?.includes(".m3u8") || videoUrl?.includes("playlist.m3u8");

  //   return (
  //     <div className="movie-card">
  //       <div className="movie-poster">
  //         {posterUrl ? (
  //           <img src={posterUrl} alt={movie.movieTitle}
  //             onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x450?text=No+Poster"; }}
  //           />
  //         ) : (
  //           <div className="poster-placeholder">🎬 No Poster</div>
  //         )}
  //         <div className="movie-overlay">
  //           <button className="edit-btn" onClick={() => editMovie(movie)}>✏️ Edit</button>
  //           <button className="delete-btn" onClick={() => deleteMovie(movie._id)}>🗑️ Delete</button>
  //           {movie.movieFile?.status === 4 || movie.customVideoUrl ? (
  //             <button className="play-btn" onClick={() => playVideo(videoUrl, isHls ? "hls" : "mp4")}>▶️ Play</button>
  //           ) : (
  //             <span className="processing-badge">⏳ Processing</span>
  //           )}
  //         </div>
  //       </div>
  //       <div className="movie-info">
  //         <div className="movie-header">
  //           {logoUrl && <img src={logoUrl} alt="Logo" className="movie-logo" />}
  //           <h3>{movie.movieTitle}</h3>
  //         </div>
  //         <div className="movie-meta">
  //           <span>📅 {movie.releaseYear}</span>
  //           <span>⏱️ {movie.duration} min</span>
  //           <button
  //             className={`publish-toggle ${movie.publishStatus ? "published" : "draft"}`}
  //             onClick={() => togglePublishStatus(movie._id)}
  //           >
  //             {movie.publishStatus ? "✅ Published" : "📝 Draft"}
  //           </button>
  //         </div>
  //         <div className="movie-genres">
  //           {movie.genres?.slice(0, 3).map((g, i) => <span key={i} className="genre">{g}</span>)}
  //         </div>
  //         <div className="movie-rating">⭐ {movie.imdbRating || "N/A"}</div>

  //         {bannerUrl && (
  //           <div className="movie-banner-preview">
  //             <img src={bannerUrl} alt="Banner" className="banner-thumb"
  //               onError={(e) => { e.target.style.display = "none"; }}
  //             />
  //           </div>
  //         )}

  //         {movie.movieFile?.status === 4 && (
  //           <div className="video-url-info">
  //             <small>🎬 HLS Stream Ready</small>
  //             <button className="copy-url-btn" onClick={() => { navigator.clipboard.writeText(movie.movieFile.hlsUrl); toast.success("HLS URL copied"); }}>
  //               Copy HLS URL
  //             </button>
  //           </div>
  //         )}

  //         {movie.trailer?.status === 4 && (
  //           <div className="video-url-info trailer-info">
  //             <small>🎞️ Trailer Ready</small>
  //             <button className="play-btn-sm" onClick={() => playVideo(movie.trailer.hlsUrl, "hls")}>▶ Play Trailer</button>
  //           </div>
  //         )}

  //         {movie.director?.length > 0 && (
  //           <div className="movie-crew">
  //             <strong>Director:</strong>{" "}
  //             {movie.director.map((d) => (typeof d === "string" ? d : d.name)).join(", ")}
  //           </div>
  //         )}

  //         {movie.castMembers?.length > 0 && (
  //           <div className="movie-cast">
  //             <strong>Cast:</strong>
  //             <div className="cast-list">
  //               {movie.castMembers.slice(0, 2).map((c, i) => (
  //                 <span key={i} className="cast-item">{c.name} as "{c.character}"</span>
  //               ))}
  //               {movie.castMembers.length > 2 && <span>+{movie.castMembers.length - 2} more</span>}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  const MovieCard = ({ movie }) => {
    const posterUrl = movie.verticalPoster?.url;
    const bannerUrl = movie.horizontalBanner?.url;
    const logoUrl = movie.logo?.url;
    const videoUrl =
      movie.movieFile?.status === 4
        ? movie.movieFile?.hlsUrl
        : movie.customVideoUrl || null;

    const isHls =
      videoUrl?.includes(".m3u8") || videoUrl?.includes("playlist.m3u8");

    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
        {/* Poster */}
        <div className="relative">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.movieTitle}
              className="w-full h-[180px] object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/300x450?text=No+Poster";
              }}
            />
          ) : (
            <div className="h-[320px] flex items-center justify-center bg-gray-100">
              No Poster
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-2">
            <button
              className="px-3 py-1 bg-white text-sm rounded-md"
              onClick={() => editMovie(movie)}
            >
              Edit
            </button>

            <button
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-md"
              onClick={() => deleteMovie(movie._id)}
            >
              Delete
            </button>

            {(movie.movieFile?.status === 4 || movie.customVideoUrl) && (
              <button
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-md"
                onClick={() => playVideo(videoUrl, isHls ? "hls" : "mp4")}
              >
                Play
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-6" />}
            <h3 className="font-semibold text-lg">{movie.movieTitle}</h3>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>{movie.releaseYear}</span>
            <span>{movie.duration} min</span>
          </div>

          <button
            className={`px-3 py-1 text-xs rounded-md ${
              movie.publishStatus
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
            onClick={() => togglePublishStatus(movie._id)}
          >
            {movie.publishStatus ? "Published" : "Draft"}
          </button>

          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {movie.genres?.slice(0, 3).map((g, i) => (
              <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {g}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div className="text-sm font-medium">
            Rating: {movie.imdbRating || "N/A"}
          </div>

          {/* Banner */}
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Banner"
              className="w-full h-20 object-cover rounded-md"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}

          {/* HLS */}
          {movie.movieFile?.status === 4 && (
            <div className="flex justify-between items-center text-xs">
              <span>Stream Ready</span>
              <button
                className="text-blue-600"
                onClick={() => {
                  navigator.clipboard.writeText(movie.movieFile.hlsUrl);
                  toast.success("HLS URL copied");
                }}
              >
                Copy URL
              </button>
            </div>
          )}

          {/* Trailer */}
          {movie.trailer?.status === 4 && (
            <button
              className="text-sm text-blue-600"
              onClick={() => playVideo(movie.trailer.hlsUrl, "hls")}
            >
              Play Trailer
            </button>
          )}

          {/* Director */}
          {movie.director?.length > 0 && (
            <div className="text-xs text-gray-600">
              <strong>Director:</strong>{" "}
              {movie.director
                .map((d) => (typeof d === "string" ? d : d.name))
                .join(", ")}
            </div>
          )}

          {/* Cast */}
          {movie.castMembers?.length > 0 && (
            <div className="text-xs text-gray-600">
              <strong>Cast:</strong>{" "}
              {movie.castMembers
                .slice(0, 2)
                .map((c) => `${c.name} (${c.character})`)
                .join(", ")}
              {movie.castMembers.length > 2 &&
                ` +${movie.castMembers.length - 2} more`}
            </div>
          )}
        </div>
      </div>
    );
  };

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
          <Button  onClick={() => setShowList(true)}>
            View All Movies ({movies.length})
          </Button>
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
                          <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          >
                            <option value="">Select language</option>
                            {languageOptions.map((l) => (
                              <option key={l}>{l}</option>
                            ))}
                          </select>
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
                      {uploadProgress === 100 && (
                        <p className="transcoding-note">
                          {" "}
                          Upload complete! Video is transcoding on Bunny CDN.
                        </p>
                      )}
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
                  {loading ? "Publishing..." : "Publish Now"}
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
    </>
  );
};

export default Movies;
