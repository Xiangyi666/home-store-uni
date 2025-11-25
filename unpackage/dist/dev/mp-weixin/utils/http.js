"use strict";
const common_vendor = require("../common/vendor.js");
class HttpRequest {
  constructor() {
    this.baseURL = "http://106.13.183.93:8080/api";
    this.refreshTryTime = 2;
  }
  // 请求拦截器
  interceptors(request) {
    const token = common_vendor.index.getStorageSync("token");
    common_vendor.index.__f__("log", "at utils/http.js:11", "token---", token);
    if (token) {
      request.header = {
        ...request.header,
        "Authorization": `Bearer ${token}`
      };
    }
    return request;
  }
  cleanRefresh() {
    this.refreshTryTime = 2;
  }
  async refreshToken() {
    common_vendor.index.__f__("log", "at utils/http.js:26", this.refreshTryTime);
    if (this.refreshTryTime <= 0)
      return;
    this.refreshTryTime--;
    await this.request({
      url: "/users/wechat/refresh",
      method: "POST",
      data: {
        accessToken: common_vendor.index.getStorageSync("token"),
        refreshToken: common_vendor.index.getStorageSync("refreshToken")
      }
    });
  }
  // 发送请求
  request(options) {
    options = this.interceptors(options);
    return new Promise((resolve, reject) => {
      var _a;
      common_vendor.index.__f__("log", "at utils/http.js:40", "url---", options.url);
      common_vendor.index.request({
        url: ((_a = options.url) == null ? void 0 : _a.startsWith("http")) ? options.url : this.baseURL + options.url,
        method: options.method || "GET",
        data: options.data || {},
        header: options.header || {},
        success: (res) => {
          var _a2;
          if (res.statusCode === 200) {
            if (res.data && res.data.success == false) {
              common_vendor.index.showToast({ title: ((_a2 = res.data) == null ? void 0 : _a2.message) || "请求失败", icon: "none" });
              reject(res.data);
            }
            resolve(res.data);
          } else if (res.statusCode === 401) {
            if (common_vendor.index.getStorageSync("refreshToken") && this.refreshTryTime <= 0) {
              this.refreshToken();
            } else {
              this.handleTokenExpired();
              reject(res.data);
            }
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
        common_vendor.index.switchTab({
          url: "/pages/login/login"
        });
      }
    });
  }
  // 快捷方法 a
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
