import { api } from "./axios"

const getUserListing = "/otp/getUsers"

export const getUserDataAPI =  async ()=> await api.get(getUserListing)