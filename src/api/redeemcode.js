import { api } from "./axios"

const getRedeemCode = "/redeem/admin/all"
const createRedeemCode = "/redeem/admin/create"

export const getRedeemDataAPI = async ()=> await api.get(getRedeemCode)

export const addRedeemDataAPI = async (body)=> await api.post(createRedeemCode,body)