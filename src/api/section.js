import { api } from "./axios"

const getSection = "/admin/sections"
export const getSectionAPI = async()=> await api.get(getSection) 


export const addSectionAPI = async (data)=> await api.post(getSection,data)