import { api } from "./axios"

const categoryAPI = '/category'

export const getCategoryListingAPI = async () => await api.get(categoryAPI)

export const addCategoryAPI = async (body) => await api.post(categoryAPI,body)