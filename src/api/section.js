import { api } from "./axios"

const getSection = "/admin/sections"
export const getSectionAPI = async()=> await api.get(getSection) 