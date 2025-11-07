"use strict";
const common_vendor = require("../common/vendor.js");
class HttpRequest {
  constructor() {
    this.baseURL = "http://localhost:8080/api";
  }
  // 请求拦截器
  interceptors(request) {
    const token = common_vendor.index.getStorageSync("token");
    common_vendor.index.__f__("log", "at utils/http.js:10", "token---", token);
    if (token) {
      request.header = {
        ...request.header,
        "Authorization": `Bearer ${token}`
      };
    }
    return request;
  }
  // 发送请求
  request(options) {
    options = this.interceptors(options);
    return new Promise((resolve, reject) => {
      common_vendor.index.request({
        url: this.baseURL + options.url,
        method: options.method || "GET",
        data: options.data || {},
        header: options.header || {},
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
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
    common_vendor.index.removeStorageSync("token");
    common_vendor.index.removeStorageSync("user");
    common_vendor.index.showModal({
      title: "提示",
      content: "登录已过期，请重新登录",
      showCancel: false,
      success: () => {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
      }
    });
  }
  // 快捷方法
  get(url, data = {}) {
    return this.request({ url, method: "GET", data });
  }
  post(url, data = {}) {
    return this.request({ url, method: "POST", data });
  }
  put(url, data = {}) {
    return this.request({ url, method: "PUT", data });
  }
  delete(url, data = {}) {
    return this.request({ url, method: "DELETE", data });
  }
}
const http = new HttpRequest();
exports.http = http;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/http.js.map
