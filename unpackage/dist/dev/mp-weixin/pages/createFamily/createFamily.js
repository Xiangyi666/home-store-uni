"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      familyId: "1",
      isFromShare: false
    };
  },
  onLoad(options) {
  },
  onShareAppMessage(option) {
    this.isFromShare = true;
    let path = `/pages/joinFamily/joinFamily?familyId=1`;
    return {
      title: "我给你分享了一个好东西",
      // 分享标题
      path
      // 携带参数的分享路径
    };
  },
  methods: {
    goJoin() {
      common_vendor.index.redirectTo({
        url: "/pages/joinFamily/joinFamily"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.familyId,
    b: common_vendor.t($data.familyId),
    c: common_vendor.o((...args) => $options.goJoin && $options.goJoin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/createFamily/createFamily.js.map
