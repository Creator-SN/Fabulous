import axios from 'axios'

let ax = axios.create();

// config here
// const isdev = (process.env.NODE_ENV === "development")
// if (isdev) {
//     ax.defaults.baseURL = "http://59.77.134.18:5083";
// } else {
ax.defaults.baseURL = "https://fb.creatorsn.com/api"
// }

ax.interceptors.request.use(
    config => {
        if (
            config.headers["Content-Type"].includes("x-www-form-urlencoded") ||
            config.headers["Content-Type"].includes("multipart/form-data")
        ) {
            let formData = new FormData();
            for (let item in config.data) {
                if (config.data[item]) {
                    if (
                        Array.isArray(config.data[item])
                    ) {
                        for (let i of config.data[item]) {
                            formData.append(item, i);
                        }
                    }
                    else formData.append(item, config.data[item]);
                }
            }
            config.data = formData;
        }
        return config;
    },
    error => {
        return Promise.reject(error)
    }
)

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