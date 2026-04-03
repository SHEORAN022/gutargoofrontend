import { api } from "./axios"

const bannerAPI = "/banners"

export const getAllBannersAPI = async() => await api.get(bannerAPI) 
export const deleteBannerAPI = async (id)=> await api.delete(bannerAPI+"/"+id)

export const addBannerAPI = async (body)=> await api.post(bannerAPI,body)