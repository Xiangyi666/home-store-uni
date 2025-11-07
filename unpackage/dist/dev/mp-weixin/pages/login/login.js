"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const _sfc_main = {
  data() {
    return {
      dev: true
    };
  },
  mounted() {
  },
  methods: {
    // 检查用户是否注册
    async checkUserRegistered(openid) {
      try {
        const response = await utils_http.http.get(`/users/wechat/check?openid=${encodeURIComponent(openid)}`);
        return response;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:26", "检查用户失败:", error);
        throw error;
      }
    },
    // 完整的登录流程
    async wechatLogin() {
      try {
        let openidResult = null;
        if (!this.dev) {
          const loginRes = await new Promise((resolve, reject) => {
            common_vendor.index.login({
              provider: "weixin",
              success: resolve,
              fail: reject
            });
          });
          common_vendor.index.__f__("log", "at pages/login/login.vue:44", "loginRes--", loginRes);
          openidResult = await utils_http.http.post("/users/wechat/get-openid", {
            code: loginRes.code
          });
        }
        openidResult = { openid: "test_openid_123" };
        const openid = openidResult.openid;
        const checkResult = await this.checkUserRegistered(openid);
        if (checkResult.registered) {
          const loginResult = await utils_http.http.post("/users/wechat/login-by-openid", {
            openid
          });
          common_vendor.index.setStorageSync("token", loginResult.token);
          common_vendor.index.setStorageSync("user", loginResult.user);
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        } else {
          common_vendor.index.showModal({
            title: "提示",
            content: "欢迎新用户，请授权个人信息完成注册",
            showCancel: false,
            success: async () => {
              const userInfo = await new Promise((resolve, reject) => {
                common_vendor.index.getUserProfile({
                  desc: "用于完善会员资料",
                  success: resolve,
                  fail: reject
                });
              });
              const registerResult = await utils_http.http.post("/users/wechat/register", {
                openid,
                nickname: userInfo.userInfo.nickName,
                avatarUrl: userInfo.userInfo.avatarUrl
              });
              common_vendor.index.setStorageSync("token", registerResult.token);
              common_vendor.index.setStorageSync("user", registerResult.user);
              common_vendor.index.showToast({ title: "注册成功", icon: "success" });
            }
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:102", "登录流程失败:", error);
        common_vendor.index.showToast({ title: "登录失败", icon: "none" });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.wechatLogin && $options.wechatLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
