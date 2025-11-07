"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const _sfc_main = {
  data() {
    return {
      warehouses: [],
      goodsList: [],
      colorMap: {
        3: "#F94D50",
        7: "#FA8C16",
        10: "#52C41B"
      },
      bgColorMap: {
        3: "#FFF6F7",
        7: "#FFFAF5"
      }
    };
  },
  mounted() {
    this.getAllGoods();
  },
  methods: {
    getDaysUntil(targetDate) {
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(targetDate);
      target.setHours(0, 0, 0, 0);
      const timeDiff = target.getTime() - today.getTime();
      const daysDiff = Math.floor(timeDiff / (1e3 * 60 * 60 * 24));
      return daysDiff;
    },
    async getAllGoods() {
      const res = await utils_http.http.post("/warehouses/family/getAllGoods", {
        familyId: 9
      });
      this.goodsList = res.data;
      this.goodsList.map((item) => {
        item.expireDays = this.getDaysUntil(item.expiryDate);
      });
      common_vendor.index.__f__("log", "at pages/storage/storage.vue:73", this.goodsList[0]);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.getAllGoods && $options.getAllGoods(...args)),
    b: common_vendor.f($data.goodsList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.itemName),
        b: item.expireDays < 0
      }, item.expireDays < 0 ? {} : item.expireDays <= 3 ? {} : item.expireDays > 0 && item.expireDays <= 30 ? {
        e: common_vendor.t(item.expireDays)
      } : {}, {
        c: item.expireDays <= 3,
        d: item.expireDays > 0 && item.expireDays <= 30,
        f: index
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f2fc897"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/storage/storage.js.map
