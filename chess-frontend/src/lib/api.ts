import axios from "axios";
import { apiEndpoints } from "../config/apiEndpoints";

export const api = axios.create({
    baseURL: apiEndpoints.baseURL,
    withCredentials: true // IMPORTANT: This allows cookies to be sent and received
});


