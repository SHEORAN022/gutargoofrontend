import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Movies from "@/pages/Movies";
import AddMovie from "@/pages/AddMovie";
import WebSeries from "@/pages/WebSeries";
import AddWebSeries from "@/pages/AddWebSeries";
import TVShows from "@/pages/TVShows";
import AddTVShow from "@/pages/AddTVShow";
import ShortMovies from "@/pages/ShortMovies";
import AddShortMovie from "@/pages/AddShortMovie";
import Users from "@/pages/Users";
import ReedemCode from "./pages/RedeemCode"

import Vendors from "@/pages/Vendors";
import Subscriptions from "@/pages/Subscriptions";
import Categories from "@/pages/Categories";
import AdsManager from "@/pages/AdsManager";
import CastCrew from "@/pages/CastCrew";
import ApiDocs from "@/pages/ApiDocs";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import HomeBanners from "@/pages/HomeBanners";
import HomeSections from "@/pages/HomeSections";
import HomeSettings from "@/pages/HomeSettings";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/movies/add" element={<AddMovie />} />
                  <Route path="/movies/edit/:id" element={<AddMovie />} />
                  <Route path="/web-series" element={<WebSeries />} />
                  <Route path="/web-series/add" element={<AddWebSeries />} />
                  <Route path="/tv-shows" element={<TVShows />} />
                  <Route path="/tv-shows/add" element={<AddTVShow />} />
                  <Route path="/tv-shows/edit/:id" element={<AddTVShow />} />
                  <Route path="/short-movies" element={<ShortMovies />} />
                  <Route path="/short-movies/add" element={<AddShortMovie />} />
                  <Route path="/short-movies/edit/:id" element={<AddShortMovie />} />
                  <Route path="/cast-crew" element={<CastCrew />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/redeem-code" element={<ReedemCode />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/ads" element={<AdsManager />} />
                  <Route path="/home/banners" element={<HomeBanners />} />
                  <Route path="/home/sections" element={<HomeSections />} />
                  <Route path="/home/settings" element={<HomeSettings />} />
                  <Route path="/api-docs" element={<ApiDocs />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
