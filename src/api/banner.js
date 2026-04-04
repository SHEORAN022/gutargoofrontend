import { api } from "./axios"

const bannerAPI = "/banners"

export const getAllBannersAPI = async() => await api.get(bannerAPI) 
export const deleteBannerAPI = async (id)=> await api.delete(bannerAPI+"/"+id)

export const addBannerAPI = async (body)=> await api.post(bannerAPI,body)

export const editBannerAPI  = async(id,data) => await api.put(bannerAPI+"/"+id,data)