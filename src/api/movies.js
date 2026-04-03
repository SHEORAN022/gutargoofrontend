import { api } from "./axios"

const getMoviesSelect = "/movies"
const getCategories = "/category"
export const getMoviesSelectAPI = async (params)=> await api.get(getMoviesSelect,{params})

export const getCategoriesAPI = async ()=>await api.get(getCategories)