"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const _sfc_main = {
  data() {
    return {
      storeId: "",
      storages: [],
      unitRange: [{
        value: "g",
        text: "g"
      }, {
        value: "个",
        text: "个"
      }, {
        value: "ml",
        text: "ml"
      }],
      recoList: []
    };
  },
  activated() {
  },
  onLoad(options) {
    this.getStores();
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptData", (data) => {
      common_vendor.index.__f__("log", "at pages/batchStockIn/batchStockIn.vue:72", "事件通道参数:", data.path);
      if (data.path) {
        this.readFileAndAna(data.path);
      }
    });
  },
  methods: {
    async doBatch() {
      const recentHome = common_vendor.index.getStorageSync("recent-used-home");
      common_vendor.index.__f__("log", "at pages/batchStockIn/batchStockIn.vue:81", recentHome);
      common_vendor.index.__f__("log", "at pages/batchStockIn/batchStockIn.vue:82", this.recoList);
      const stockInRequests = [];
      this.recoList.map((item) => {
        if (!item.name || !item.unit || !item.shelfLifeDays || !item.quantity) {
          throw new Error("请检查商品是否录入完备");
        }
        stockInRequests.push({
          ingredientName: item.name,
          unit: item.unit,
          warehouseId: recentHome,
          shelfLifeDays: item.shelfLifeDays,
          quantity: item.quantity
        });
      });
      const res = await utils_http.http.post("/warehouses/stock-in-batch", {
        stockInRequests,
        warehouseId: recentHome
      });
      if (res.success) {
        common_vendor.index.showToast({
          title: "入库成功",
          icon: "success"
        });
        common_vendor.index.navigateBack();
      }
    },
    async getStores() {
      var _a;
      const recentHome = common_vendor.index.getStorageSync("recent-used-home");
      const res = await utils_http.http.post("/warehouses/getAllByFamily", {
        familyId: recentHome
      });
      common_vendor.index.__f__("log", "at pages/batchStockIn/batchStockIn.vue:114", "stores---", res);
      if (res == null ? void 0 : res.data.length) {
        this.storages = [];
        res.data.map((item) => {
          this.storages.push({
            value: item.id,
            text: item.name
          });
        });
      }
      const recentUsed = (_a = this.storages[0]) == null ? void 0 : _a.value;
      this.storeId = recentUsed;
    },
    addItem() {
      this.recoList.push({
        name: "",
        quantity: "",
        unit: ""
      });
    },
    delItem(index) {
      this.recoList.splice(index, 1);
    },
    changeUnit(item) {
    },
    readFileAndAna(path) {
      if (!path)
        return;
      const _this = this;
      const fileManager = common_vendor.index.getFileSystemManager();
      fileManager.readFile({
        filePath: path,
        encoding: "base64",
        success: async (readRes) => {
          common_vendor.index.showLoading({
            title: "识别中"
          });
          try {
            const res = await utils_http.http.post("http://localhost:8090/api/mobile/identify-from-image", {
              image_base64: readRes.data,
              url: ""
            });
            _this.recoList = JSON.parse(res == null ? void 0 : res.data);
            _this.recoList.map((item) => {
              item.quantity = "", item.unit = "g";
            });
            common_vendor.index.__f__("log", "at pages/batchStockIn/batchStockIn.vue:159", "dattttta", _this.recoList);
          } catch {
          }
          common_vendor.index.hideLoading();
        },
        fail: (err) => {
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  (_easycom_uni_icons2 + _easycom_uni_data_select2 + _easycom_uni_easyinput2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_data_select + _easycom_uni_easyinput)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return {
    a: common_vendor.t($data.recoList.length),
    b: common_vendor.o((...args) => $options.addItem && $options.addItem(...args)),
    c: common_vendor.f($data.recoList, (item, index, i0) => {
      return {
        a: common_vendor.o(($event) => $options.delItem(index), index),
        b: "35a57927-0-" + i0,
        c: item.name,
        d: common_vendor.o(($event) => item.name = $event.detail.value, index),
        e: item.quantity,
        f: common_vendor.o(($event) => item.quantity = $event.detail.value, index),
        g: common_vendor.o(($event) => $options.changeUnit(item), index),
        h: "35a57927-1-" + i0,
        i: common_vendor.o(($event) => item.unit = $event, index),
        j: common_vendor.p({
          localdata: $data.unitRange,
          placement: "bottom",
          clear: false,
          modelValue: item.unit
        }),
        k: "35a57927-2-" + i0,
        l: common_vendor.o(($event) => item.shelfLifeDays = $event, index),
        m: common_vendor.p({
          clearable: false,
          placeholder: "",
          modelValue: item.shelfLifeDays
        }),
        n: index
      };
    }),
    d: common_vendor.p({
      type: "clear",
      color: "#B3B3B3",
      size: "24"
    }),
    e: common_vendor.t((_a = $data.storages[0]) == null ? void 0 : _a.text),
    f: common_vendor.o((...args) => $options.doBatch && $options.doBatch(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-35a57927"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/batchStockIn/batchStockIn.js.map
