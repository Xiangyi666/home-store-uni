"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const _sfc_main = {
  data() {
    return {
      isOpened: [],
      warehouses: [],
      shelfLifeDays: "",
      curItem: {},
      inQuantity: "",
      goodsList: [],
      curHome: "",
      homes: [],
      outQuantity: "",
      stockInType: 1,
      stockInTypes: [{
        text: "同一批次",
        value: 1
      }, {
        text: "不同批次（生产/到期日期不同）",
        value: 2
      }],
      options1: [{
        text: "丢弃",
        style: {
          backgroundColor: "#FF3B30",
          fontSize: "28rpx"
        }
      }],
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
  async onPullDownRefresh() {
    common_vendor.index.__f__("log", "at pages/storage/storage.vue:121", "下拉刷新触发");
    this.page = 1;
    await this.getAllGoods();
    common_vendor.index.stopPullDownRefresh();
  },
  mounted() {
  },
  onShow() {
    this.getFamilys();
    this.curHome = common_vendor.index.getStorageSync("recent-used-home");
    this.getAllGoods();
  },
  methods: {
    goConfig() {
      common_vendor.index.switchTab({
        url: "/pages/login/login"
      });
    },
    homeSwitch(v) {
      var _a, _b;
      common_vendor.index.__f__("log", "at pages/storage/storage.vue:140", "======switch", (_a = v.detail) == null ? void 0 : _a.value);
      this.curHome = (_b = v.detail) == null ? void 0 : _b.value;
    },
    async getFamilys() {
      const homes = common_vendor.index.getStorageSync("homes");
      if (homes == null ? void 0 : homes.length) {
        homes.map((item) => {
          this.homes.push({
            value: item.id,
            text: item.name
          });
        });
      }
    },
    async doStockIn() {
      var _a;
      if (!this.inQuantity) {
        common_vendor.index.showToast({
          title: "请输入入库数量",
          icon: "none"
        });
        return;
      }
      if (this.stockInType == 1)
        ;
      else {
        const {
          itemName,
          unit,
          warehouseId
        } = this.curItem;
        const res = await utils_http.http.post("/warehouses/stock-in", {
          ingredientName: itemName,
          unit,
          warehouseId,
          shelfLifeDays: this.shelfLifeDays,
          quantity: this.inQuantity
        });
        if (res.success) {
          common_vendor.index.showToast({
            title: "入库成功",
            icon: "none"
          });
          (_a = this.$refs.stockInDialog) == null ? void 0 : _a.close();
          this.getAllGoods();
        }
      }
    },
    stockIn(item) {
      this.curItem = item;
      this.$refs.stockInDialog.open();
    },
    async doStockOut() {
      var _a;
      if (!this.outQuantity) {
        common_vendor.index.__f__("log", "at pages/storage/storage.vue:194", "-----", this.outQuantity);
        common_vendor.index.showToast({
          title: "请输入需要出库数量",
          icon: "none"
        });
        return true;
      }
      if (this.outQuantity > this.curItem.quantity) {
        common_vendor.index.showToast({
          title: `物品数量不足${this.outQuantity}${this.curItem.unit}`,
          icon: "none"
        });
        return true;
      }
      const res = await utils_http.http.post("/warehouses/stock-out", {
        warehouseId: this.curItem.warehouseId,
        ingredientId: this.curItem.ingredientId,
        batchId: this.curItem.id,
        quantity: this.outQuantity
      });
      if (res.success) {
        common_vendor.index.showToast({
          title: "出库成功",
          icon: "none"
        });
        (_a = this.$refs.inputDialog) == null ? void 0 : _a.close();
        this.getAllGoods();
      }
      common_vendor.index.__f__("log", "at pages/storage/storage.vue:223", "res--", res);
    },
    cancelStock() {
      var _a, _b;
      this.curItem = {};
      (_a = this.$refs.inputDialog) == null ? void 0 : _a.close();
      (_b = this.$refs.stockInDialog) == null ? void 0 : _b.close();
    },
    stockOut(item) {
      this.curItem = item;
      this.$refs.inputDialog.open();
    },
    async clickSwipeBtn(e, item, i) {
      common_vendor.index.__f__("log", "at pages/storage/storage.vue:236", "点击了" + (e.position === "left" ? "左侧" : "右侧") + e.content.text + "按钮");
      if (e.content.text == "丢弃") {
        await this.disCardBatch(item);
        this.goodsList.splice(i, 1);
        this.isOpened = new Array(this.goodsList.length).fill("none");
      }
    },
    async disCardBatch(item) {
      var _a;
      const res = await utils_http.http.post("/warehouses/discard-batch", {
        batchId: item.id,
        warehouseId: item.warehouseId
      });
      if (res.success) {
        common_vendor.index.showToast({
          title: "食材已经被丢弃～",
          icon: "none"
        });
        (_a = this.$refs.inputDialog) == null ? void 0 : _a.close();
      }
    },
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
      const recent = this.curHome;
      if (!recent) {
        common_vendor.index.showToast({
          text: "请先创建家庭",
          icon: "none"
        });
        return;
      }
      const res = await utils_http.http.post("/warehouses/family/getAllGoods", {
        familyId: recent
      });
      this.goodsList = res.data;
      this.goodsList.map((item) => {
        item.expireDays = this.getDaysUntil(item.expiryDate);
      });
      this.isOpened = new Array(this.goodsList.length).fill("none");
      common_vendor.index.__f__("log", "at pages/storage/storage.vue:291", this.goodsList[0]);
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_swipe_action_item2 = common_vendor.resolveComponent("uni-swipe-action-item");
  const _easycom_uni_swipe_action2 = common_vendor.resolveComponent("uni-swipe-action");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  (_easycom_uni_icons2 + _easycom_uni_data_select2 + _easycom_uni_swipe_action_item2 + _easycom_uni_swipe_action2 + _easycom_uni_easyinput2 + _easycom_uni_popup2 + _easycom_uni_data_checkbox2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_swipe_action_item = () => "../../uni_modules/uni-swipe-action/components/uni-swipe-action-item/uni-swipe-action-item.js";
const _easycom_uni_swipe_action = () => "../../uni_modules/uni-swipe-action/components/uni-swipe-action/uni-swipe-action.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_data_select + _easycom_uni_swipe_action_item + _easycom_uni_swipe_action + _easycom_uni_easyinput + _easycom_uni_popup + _easycom_uni_data_checkbox)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      type: "home-filled",
      size: "24"
    }),
    b: common_vendor.o($options.goConfig),
    c: common_vendor.p({
      type: "gear",
      size: "24"
    }),
    d: common_vendor.o(($event) => $options.getAllGoods()),
    e: common_vendor.o(($event) => $data.curHome = $event),
    f: common_vendor.p({
      clear: false,
      localdata: $data.homes,
      modelValue: $data.curHome
    }),
    g: common_vendor.f($data.goodsList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.itemName),
        b: common_vendor.t(item.warehouseName),
        c: item.expireDays < 0
      }, item.expireDays < 0 ? {} : item.expireDays <= 3 ? {} : item.expireDays > 0 && item.expireDays <= 30 ? {
        f: common_vendor.t(item.expireDays)
      } : {}, {
        d: item.expireDays <= 3,
        e: item.expireDays > 0 && item.expireDays <= 30,
        g: common_vendor.t(item.quantity),
        h: common_vendor.t(item.unit),
        i: common_vendor.t(item.id),
        j: common_vendor.t(item.status),
        k: common_vendor.o(($event) => $options.stockOut(item), index),
        l: common_vendor.o(($event) => $options.stockIn(item), index),
        m: common_vendor.o((e) => $options.clickSwipeBtn(e, item, index), index),
        n: index,
        o: "2f2fc897-4-" + i0 + ",2f2fc897-3",
        p: common_vendor.p({
          autoClose: false,
          show: $data.isOpened[index],
          ["right-options"]: $data.options1
        })
      });
    }),
    h: common_vendor.o(($event) => $data.outQuantity = $event),
    i: common_vendor.p({
      placeholder: "出库数量",
      modelValue: $data.outQuantity
    }),
    j: common_vendor.t($data.curItem.unit),
    k: common_vendor.o((...args) => $options.cancelStock && $options.cancelStock(...args)),
    l: common_vendor.o((...args) => $options.doStockOut && $options.doStockOut(...args)),
    m: common_vendor.sr("inputDialog", "2f2fc897-5"),
    n: common_vendor.p({
      title: "出库",
      type: "dialog"
    }),
    o: common_vendor.o(($event) => $data.inQuantity = $event),
    p: common_vendor.p({
      placeholder: "入库数量",
      modelValue: $data.inQuantity
    }),
    q: common_vendor.t($data.curItem.unit),
    r: $data.stockInType == 2
  }, $data.stockInType == 2 ? {
    s: common_vendor.o(($event) => $data.shelfLifeDays = $event),
    t: common_vendor.p({
      clearable: false,
      placeholder: "多久后过期？",
      modelValue: $data.shelfLifeDays
    })
  } : {}, {
    v: common_vendor.o(($event) => $data.stockInType = $event),
    w: common_vendor.p({
      localdata: $data.stockInTypes,
      modelValue: $data.stockInType
    }),
    x: common_vendor.o((...args) => $options.cancelStock && $options.cancelStock(...args)),
    y: common_vendor.o((...args) => $options.doStockIn && $options.doStockIn(...args)),
    z: common_vendor.sr("stockInDialog", "2f2fc897-7"),
    A: common_vendor.p({
      title: "入库",
      type: "dialog"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f2fc897"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/storage/storage.js.map
