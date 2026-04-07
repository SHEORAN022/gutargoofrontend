import { api } from "./axios"

const getRedeemCode = "/redeem/admin/all"

export const getRedeemDataAPI = async ()=> await api.get(getRedeemCode)