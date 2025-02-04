import axios from "axios";

const api = axios.create({
  baseURL: "https://wptvb2trb2.execute-api.us-east-2.amazonaws.com/prod/api/v1",
});

export default api;
