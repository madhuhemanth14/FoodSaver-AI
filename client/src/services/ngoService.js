import axios from "axios";

const API_URL = "http://localhost:5000/api/ngos";

export const getNGOs = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

export const getNGOById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
};

export const searchNGOs = async (searchTerm = "") => {
  const response = await axios.get(API_URL);

  const ngos = response.data.data;

  const term = searchTerm.toLowerCase().trim();

  if (!term) {
    return ngos;
  }

  return ngos.filter((ngo) =>
    ngo.name.toLowerCase().includes(term) ||
    ngo.address.toLowerCase().includes(term) ||
    ngo.acceptedFood.some((food) =>
      food.toLowerCase().includes(term)
    )
  );
};