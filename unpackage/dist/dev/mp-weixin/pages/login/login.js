"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      dev: false,
      nickName: "屯屯鼠",
      avatarUrl: "",
      familyName: "",
      editName: false,
      homes: [],
      selectedId: "",
      members: [],
      selectedName: ""
    };
  },
  async onShow() {
    this.checkCurUserInfo();
    await this.getFamilys();
    this.getFamilyMembers();
  },
  onShareAppMessage(option) {
    let path = `/pages/joinFamily/joinFamily?familyId=${this.selectedId}&familyName=${encodeURI(this.selectedName)}`;
    return {
      title: "加入我的家庭",
      // 分享标题
      path
      // 携带参数的分享路径
    };
  },
  methods: {
    async invite() {
    },
    async dialogInputConfirm() {
      if (!this.familyName) {
        common_vendor.index.showToast({
          title: "请输入",
          icon: "none"
        });
        return;
      }
      const res = await utils_http.http.post("/families/createFamily", {
        name: this.familyName
      });
      if (res.success) {
        this.$refs.inputDialog.close();
        common_vendor.index.showToast({
          title: "创建成功！",
          icon: "success"
        });
      }
      common_vendor.index.__f__("log", "at pages/login/login.vue:106", this.familyName);
      this.getFamilys();
    },
    createFamily() {
      this.$refs.inputDialog.open();
    },
    cancelDialog() {
      this.$refs.inputDialog.close();
    },
    async getFamilys() {
      this.homes = [];
      const res = await utils_http.http.get("/families/getAll");
      common_vendor.index.__f__("log", "at pages/login/login.vue:118", "familys-----", res);
      this.homes = res == null ? void 0 : res.data;
      const curHome = common_vendor.index.getStorageSync("recent-used-home");
      if (curHome) {
        this.selectedId = curHome;
      } else {
        this.selectedId = res == null ? void 0 : res.data[0].id;
      }
      this.homes.find((item) => item.id == this.selectedId);
    },
    checkCurUserInfo() {
      const user = common_vendor.index.getStorageSync("user");
      common_vendor.index.__f__("log", "at pages/login/login.vue:131", "user--", user);
      if (!user)
        this.wechatLogin();
      this.nickName = user == null ? void 0 : user.username;
    },
    edit() {
      this.editName = true;
    },
    saveNickName() {
      this.editName = false;
    },
    // 选择头像
    onChooseAvatar(e) {
      common_vendor.index.__f__("log", "at pages/login/login.vue:143", "头像选择结果:", e);
      this.avatarUrl = e.detail.avatarUrl;
      common_vendor.index.showToast({
        title: "头像选择成功",
        icon: "success"
      });
    },
    async updateUserName() {
      const response = await utils_http.http.post(`/users/updateUserName`, {
        newUsername: this.nickName
      });
      if (response.success) {
        this.editName = false;
        common_vendor.index.showToast({
          title: "修改成功",
          icon: "none"
        });
        const user = common_vendor.index.getStorageSync("user");
        user.username = this.nickName;
        common_vendor.index.setStorageSync("user", user);
      }
    },
    // 输入昵称
    onNicknameInput(e) {
      this.nickname = e.detail.value;
    },
    // 检查用户是否注册
    async checkUserRegistered(openid) {
      try {
        const response = await utils_http.http.get(`/users/wechat/check?openid=${encodeURIComponent(openid)}`);
        return response;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:175", "检查用户失败:", error);
        throw error;
      }
    },
    refreshToken() {
      utils_http.http.cleanRefresh();
      utils_http.http.refreshToken();
    },
    async getFamilyMembers() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:184", "curHome", this.selectedId);
      const members = await utils_http.http.get(`/families/${this.selectedId}/members`);
      this.members = members;
      common_vendor.index.__f__("log", "at pages/login/login.vue:187", members);
    },
    async refresh() {
      this.checkCurUserInfo();
      await this.getFamilys();
      this.getFamilyMembers();
    },
    // 完整的登录流程
    async wechatLogin() {
      common_vendor.index.clearStorageSync();
      common_vendor.index.__f__("log", "at pages/login/login.vue:197", "do wechatlogin");
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
          common_vendor.index.__f__("log", "at pages/login/login.vue:209", "loginRes--", loginRes);
          openidResult = await utils_http.http.post("/users/wechat/get-openid", {
            code: loginRes.code
          });
        }
        common_vendor.index.__f__("log", "at pages/login/login.vue:215", "openidResult---", openidResult);
        const openid = openidResult.openid;
        const checkResult = await this.checkUserRegistered(openid);
        if ((checkResult == null ? void 0 : checkResult.data) && checkResult.data.registered) {
          const res = await utils_http.http.post("/users/wechat/login-by-openid", {
            openid
          });
          const loginResult = res.data;
          common_vendor.index.__f__("log", "at pages/login/login.vue:228", res);
          common_vendor.index.setStorageSync("token", loginResult.token);
          common_vendor.index.setStorageSync("refreshToken", loginResult.refreshToken);
          common_vendor.index.setStorageSync("user", loginResult.user);
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          this.refresh();
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
              common_vendor.index.__f__("log", "at pages/login/login.vue:254", "userInfo--", userInfo);
              const res = await utils_http.http.post("/users/wechat/register", {
                openid,
                nickname: userInfo.userInfo.nickName,
                avatarUrl: userInfo.userInfo.avatarUrl
              });
              common_vendor.index.__f__("log", "at pages/login/login.vue:261", res);
              const registerResult = res && res.data;
              common_vendor.index.setStorageSync("token", registerResult.token);
              common_vendor.index.setStorageSync("refreshToken", registerResult.refreshToken);
              common_vendor.index.setStorageSync("user", registerResult.user);
              await utils_http.http.post("/users/wechat/login-by-openid", {
                openid
              });
              common_vendor.index.showToast({
                title: "注册成功",
                icon: "success"
              });
              this.refresh();
            }
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:280", "登录流程失败:", error);
        common_vendor.index.showToast({
          title: "登录失败",
          icon: "none"
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.avatarUrl
  }, $data.avatarUrl ? {
    b: $data.avatarUrl
  } : {
    c: common_assets._imports_0$3
  }, {
    d: !$data.editName
  }, !$data.editName ? {
    e: common_vendor.t($data.nickName || "屯屯鼠")
  } : {
    f: common_vendor.o((...args) => $options.onNicknameInput && $options.onNicknameInput(...args)),
    g: common_vendor.o((...args) => $options.onNicknameInput && $options.onNicknameInput(...args)),
    h: $data.nickName,
    i: common_vendor.o(($event) => $data.nickName = $event.detail.value)
  }, {
    j: $data.editName
  }, $data.editName ? {
    k: common_vendor.o((...args) => $options.updateUserName && $options.updateUserName(...args))
  } : {
    l: common_assets._imports_1,
    m: common_vendor.o((...args) => $options.edit && $options.edit(...args))
  }, {
    n: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args)),
    o: common_vendor.f($data.homes, (home, index, i0) => {
      return {
        a: common_vendor.t(home.name),
        b: "e4e4508d-0-" + i0,
        c: common_vendor.o((...args) => $options.invite && $options.invite(...args), index),
        d: $data.selectedId == home.id ? 1 : "",
        e: index
      };
    }),
    p: common_vendor.p({
      type: "personadd",
      color: "#999999",
      size: "24"
    }),
    q: common_vendor.p({
      type: "plusempty",
      color: "#999999",
      size: "30"
    }),
    r: common_vendor.o((...args) => $options.createFamily && $options.createFamily(...args)),
    s: common_vendor.f($data.members, (member, index, i0) => {
      return {
        a: common_vendor.t(member.username),
        b: common_vendor.t(member.role),
        c: index
      };
    }),
    t: common_vendor.sr("inputClose", "e4e4508d-3,e4e4508d-2"),
    v: common_vendor.o($options.cancelDialog),
    w: common_vendor.o($options.dialogInputConfirm),
    x: common_vendor.o(($event) => $data.familyName = $event),
    y: common_vendor.p({
      mode: "input",
      title: "创建家庭",
      ["before-close"]: true,
      placeholder: "请输入家庭名称",
      modelValue: $data.familyName
    }),
    z: common_vendor.sr("inputDialog", "e4e4508d-2"),
    A: common_vendor.p({
      type: "dialog"
    }),
    B: common_vendor.o((...args) => $options.wechatLogin && $options.wechatLogin(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
