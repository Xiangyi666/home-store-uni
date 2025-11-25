"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      quantity: 600,
      goodsName: "玉米",
      currentFamily: "",
      homeOptions: [],
      selectedId: "",
      warehouseName: "",
      selectedName: "",
      shelfLifeDays: 27,
      tagsNameStr: "",
      expireDate: Date.now(),
      tagStr: [],
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
      unit: "g",
      storeId: "",
      supplier: "超市",
      storages: [],
      tags: [{
        value: "食品",
        text: "食品"
      }, {
        value: "饮料",
        text: "饮料"
      }]
    };
  },
  watch: {
    tagStr(v) {
      this.tagsNameStr = v;
    },
    selectedId() {
      this.getStores();
    }
  },
  mounted() {
  },
  async onShow() {
    await this.getFamilys();
    this.getStores();
  },
  onShareAppMessage(option) {
    this.isFromShare = true;
    let path = `/pages/joinFamily/joinFamily?familyId=${this.selectedId}&familyName=${encodeURI(this.selectedName)}`;
    return {
      title: "加入我的家庭",
      // 分享标题
      path
      // 携带参数的分享路径
    };
  },
  methods: {
    doBatch() {
      common_vendor.index.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sourceType: ["album", "camera"],
        maxDuration: 30,
        camera: "back",
        success(res) {
          var _a, _b;
          common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:143", res.tempFiles);
          if (res.tempFiles && ((_a = res.tempFiles[0]) == null ? void 0 : _a.tempFilePath)) {
            const path = (_b = res.tempFiles[0]) == null ? void 0 : _b.tempFilePath;
            common_vendor.index.navigateTo({
              url: `/pages/batchStockIn/batchStockIn`,
              success: function(res2) {
                res2.eventChannel.emit("acceptData", {
                  path
                });
              }
            });
          }
        }
      });
    },
    createWareHouse() {
      this.$refs.inputDialog.open();
    },
    homeSwitch(v) {
      var _a, _b;
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:164", "======switch", (_a = v.detail) == null ? void 0 : _a.value);
      this.selectedId = (_b = v.detail) == null ? void 0 : _b.value;
    },
    mock() {
      common_vendor.index.redirectTo({
        url: "/pages/homes/homes"
      });
    },
    async dialogInputConfirm() {
      if (!this.warehouseName) {
        common_vendor.index.showToast({
          title: "请输入",
          icon: "none"
        });
        return;
      }
      const res = await utils_http.http.post("/warehouses/create", {
        name: this.warehouseName,
        familyId: this.selectedId
      });
      if (res.success) {
        this.$refs.inputDialog.close();
        common_vendor.index.showToast({
          title: "创建成功！",
          icon: "success"
        });
      }
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:191", this.familyName);
      this.getStores();
    },
    cancelDialog() {
      this.$refs.inputDialog.close();
    },
    async getFamilys() {
      this.homeOptions = [];
      const res = await utils_http.http.get("/families/getAll");
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:201", "familys-----", res);
      res.data.map((item) => {
        this.homeOptions.push({
          value: item.id,
          text: item.name
        });
      });
      common_vendor.index.setStorageSync("homes", res == null ? void 0 : res.data);
      if (this.homeOptions.length == 0) {
        common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:210", "re-----");
        common_vendor.index.redirectTo({
          url: "/pages/createFamily/createFamily"
        });
      }
      const recentHome = common_vendor.index.getStorageSync("recent-used-home");
      if (!recentHome)
        common_vendor.index.setStorageSync("recent-used-home", res == null ? void 0 : res.data[0].id);
      this.selectedId = common_vendor.index.getStorageSync("recent-used-home");
    },
    async getStores() {
      var _a;
      const res = await utils_http.http.post("/warehouses/getAllByFamily", {
        familyId: this.selectedId
      });
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:225", "stores---", res);
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
    async stockIn() {
      const res = await utils_http.http.post("/warehouses/stock-in", {
        ingredientName: this.goodsName,
        unit: this.unit,
        warehouseId: this.storeId,
        shelfLifeDays: this.shelfLifeDays,
        quantity: this.quantity,
        supplier: this.supplier
      });
      common_vendor.index.setStorageSync("recent-used-store", this.storeId);
      common_vendor.index.setStorageSync("recent-used-home", this.selectedId);
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:249", "---res", res);
      if (res.success) {
        common_vendor.index.showToast({
          title: "入库成功",
          icon: "success"
        });
      }
    },
    changeUnit() {
    },
    addTag() {
      this.tags.push({
        value: this.tagsNameStr,
        text: this.tagsNameStr
      });
    },
    doSubmit() {
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:265", this.tagStr, this.goodsName, this.storeId, this.tagsNameStr, this.quantity, this.supplier, this.shelfLifeDays);
      this.stockIn();
    }
  }
};
if (!Array) {
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_data_select2 + _easycom_uni_data_checkbox2 + _easycom_uni_easyinput2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_data_select + _easycom_uni_data_checkbox + _easycom_uni_easyinput + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.o(($event) => $data.selectedId = $event),
    c: common_vendor.p({
      clear: false,
      mode: "none",
      wrap: true,
      localdata: $data.homeOptions,
      modelValue: $data.selectedId
    }),
    d: $data.goodsName,
    e: common_vendor.o(($event) => $data.goodsName = $event.detail.value),
    f: $data.supplier,
    g: common_vendor.o(($event) => $data.supplier = $event.detail.value),
    h: $data.tagsNameStr,
    i: common_vendor.o(($event) => $data.tagsNameStr = $event.detail.value),
    j: common_vendor.o(($event) => $data.tagStr = $event),
    k: common_vendor.p({
      mode: "tag",
      multiple: false,
      localdata: $data.tags,
      modelValue: $data.tagStr
    }),
    l: $data.quantity,
    m: common_vendor.o(($event) => $data.quantity = $event.detail.value),
    n: common_vendor.o($options.changeUnit),
    o: common_vendor.o(($event) => $data.unit = $event),
    p: common_vendor.p({
      localdata: $data.unitRange,
      placement: "top",
      clear: false,
      modelValue: $data.unit
    }),
    q: common_vendor.o(($event) => $data.shelfLifeDays = $event),
    r: common_vendor.p({
      clearable: false,
      placeholder: "请输入天数",
      modelValue: $data.shelfLifeDays
    }),
    s: common_vendor.o(($event) => $data.storeId = $event),
    t: common_vendor.p({
      mode: "tag",
      multiple: false,
      localdata: $data.storages,
      modelValue: $data.storeId
    }),
    v: common_vendor.o((...args) => $options.createWareHouse && $options.createWareHouse(...args)),
    w: common_vendor.o((...args) => $options.doSubmit && $options.doSubmit(...args)),
    x: common_vendor.o((...args) => $options.doBatch && $options.doBatch(...args)),
    y: common_vendor.sr("inputClose", "d9e538a6-6,d9e538a6-5"),
    z: common_vendor.o($options.cancelDialog),
    A: common_vendor.o($options.dialogInputConfirm),
    B: common_vendor.o(($event) => $data.warehouseName = $event),
    C: common_vendor.p({
      mode: "input",
      title: "创建仓库",
      ["before-close"]: true,
      placeholder: "请输入仓库名称",
      modelValue: $data.warehouseName
    }),
    D: common_vendor.sr("inputDialog", "d9e538a6-5"),
    E: common_vendor.p({
      type: "dialog"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d9e538a6"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/packing-in/packing-in.js.map
