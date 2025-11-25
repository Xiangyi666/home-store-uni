"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      familyId: "",
      isFromShare: false,
      familyName: ""
    };
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/joinFamily/joinFamily.vue:19", "ops----", options);
    if (options.familyId)
      this.isFromShare = true;
    this.familyId = options.familyId;
    this.familyName = options.familyName;
  },
  methods: {
    async join() {
      common_vendor.index.switchTab({
        url: "/pages/packing-in/packing-in"
      });
      return;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$4,
    b: common_vendor.t($data.familyName),
    c: common_vendor.o((...args) => $options.join && $options.join(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-00552417"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/joinFamily/joinFamily.js.map
