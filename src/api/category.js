import { api } from "./axios"

const categoryAPI = '/category'

export const getCategoryListingAPI = async () => await api.get(categoryAPI)

export const addCategoryAPI = async (body) => await api.post(categoryAPI,body)

export const deleteCategoryAPI = async (id) => await api.delete(categoryAPI+"/"+id)


export const editCategoryAPI = async (id,data) => await api.put(categoryAPI+"/"+id,data)