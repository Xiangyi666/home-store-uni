class HttpRequest {
    constructor() {
        this.baseURL = 'http://localhost:8080/api'; // 你的后端地址
    }

    // 请求拦截器
    interceptors(request) {
        // 获取 token
        const token = uni.getStorageSync('token');
        console.log('token---', token)
        // 添加 Authorization header
        if (token) {
            request.header = {
                ...request.header,
                'Authorization': `Bearer ${token}`
            };
        }
        
        return request;
    }

    // 发送请求
    request(options) {
        options = this.interceptors(options);
        
        return new Promise((resolve, reject) => {
            uni.request({
                url: this.baseURL + options.url,
                method: options.method || 'GET',
                data: options.data || {},
                header: options.header || {},
                success: (res) => {
                    if (res.statusCode === 200) {
                        resolve(res.data);
                    } else if (res.statusCode === 401) {
                        // Token 过期，跳转到登录页
                        this.handleTokenExpired();
                        reject(res.data);
                    } else {
                        reject(res.data);
                    }
                },
                fail: (error) => {
                    reject(error);
                }
            });
        });
    }

    // 处理 token 过期
    handleTokenExpired() {
        // 清除 token
        uni.removeStorageSync('token');
        uni.removeStorageSync('user');
        
        // 跳转到登录页
        uni.showModal({
            title: '提示',
            content: '登录已过期，请重新登录',
            showCancel: false,
            success: () => {
                uni.navigateTo({
                    url: '/pages/login/login'
                });
            }
        });
    }

    // 快捷方法
    get(url, data = {}) {
        return this.request({ url, method: 'GET', data });
    }

    post(url, data = {}) {
        return this.request({ url, method: 'POST', data });
    }

    put(url, data = {}) {
        return this.request({ url, method: 'PUT', data });
    }

    delete(url, data = {}) {
        return this.request({ url, method: 'DELETE', data });
    }
}

export default new HttpRequest();