import { api } from "./axios"

const castCrew = "/castAndCrew"



// CREATE
export const addCastAndCrewAPI = async (body) =>
  await api.post(castCrew, body);

// GET ALL (with optional pagination)
export const getCastAndCrewAPI = async (params) =>
  await api.get(castCrew, { params }); 
// usage: { page: 1, limit: 10 }

// GET SINGLE
export const getSingleCastAndCrewAPI = async (id) =>
  await api.get(`${castCrew}/${id}`);

// UPDATE
export const updateCastAndCrewAPI = async (id, body) =>
  await api.put(`${castCrew}/${id}`, body);

// DELETE
export const deleteCastAndCrewAPI = async (id) =>
  await api.delete(`${castCrew}/${id}`);