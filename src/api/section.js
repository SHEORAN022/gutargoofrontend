import { api } from "./axios"

const getSection = "/admin/sections"
export const getSectionAPI = async()=> await api.get(getSection) 


export const addSectionAPI = async (data)=> await api.post(getSection,data)

export const deleteSectionAPI = async (id) => await api.delete(getSection+"/"+id)


export const editSectionAPI = async (id,body) => await api.put(getSection+"/"+id,body)