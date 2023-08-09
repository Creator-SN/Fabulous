import axios from 'axios'

let ax = axios.create();

// config here
const isdev = (process.env.NODE_ENV === "development")
if (isdev) {
    ax.defaults.baseURL = "http://59.77.134.155:5080";
} else {
    ax.defaults.baseURL = "/api"
}

ax.interceptors.request.use(config => {
    let token = localStorage.getItem("ApiToken");
    let expired = localStorage.getItem("ApiTokenExpiredAt");
    if (!expired || new Date(expired) < new Date()) {
        token = null;
        localStorage.removeItem("ApiToken");
        localStorage.removeItem("ApiTokenExpiredAt");
    }
    if (token != null) {
        config.headers["Authorization"] = token;
    }
    return config;
});

export default ax;