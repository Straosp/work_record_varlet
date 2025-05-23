import axios from 'axios';


const httpRequest = axios.create({
    baseURL: "http://127.0.0.1:8080/",
    timeout: 100000,
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Access-Control-Allow-Origin": "*",
    }
});
httpRequest.interceptors.request.use((config) => {
    config.headers["Authorization"] = "Bearer " + window.localStorage.getItem("token");
    return config;
})

export default httpRequest;


