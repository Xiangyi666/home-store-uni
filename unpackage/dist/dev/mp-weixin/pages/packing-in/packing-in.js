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
      selectedName: "",
      shelfLifeDays: 27,
      tagsNameStr: "",
      expireDate: Date.now(),
      tagStr: [],
      unitRange: [{ value: "g", text: "g" }, { value: "个", text: "个" }, { value: "ml", text: "ml" }],
      unit: "g",
      storeId: "",
      supplier: "超市",
      storages: [],
      tags: [{ value: "食品", text: "食品" }, { value: "饮料", text: "饮料" }]
    };
  },
  watch: {
    tagStr(v) {
      this.tagsNameStr = v;
    }
  },
  mounted() {
  },
  async onShow() {
    await this.getFamilys();
    this.getStores();
  },
  methods: {
    homeSwitch(v) {
      var _a, _b;
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:107", "======switch", (_a = v.detail) == null ? void 0 : _a.value);
      const index = (_b = v.detail) == null ? void 0 : _b.value;
      const obj = this.homeOptions[index];
      this.selectedName = obj.name;
      this.selectedId = obj.id;
    },
    mock() {
      common_vendor.index.redirectTo({
        url: "/pages/homes/homes"
      });
    },
    async getFamilys() {
      this.homeOptions = [];
      const res = await utils_http.http.get("/families/getAll");
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:121", "familys-----", res);
      this.homeOptions = res.data;
      if (this.homeOptions.length == 0) {
        common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:124", "re-----");
        common_vendor.index.redirectTo({
          url: "/pages/homes/homes"
        });
      }
      this.selectedName = res == null ? void 0 : res.data[0].name;
      this.selectedId = res == null ? void 0 : res.data[0].id;
    },
    async getStores() {
      const res = await utils_http.http.post("/warehouses/getAllByFamily", {
        familyId: this.selectedId
      });
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:137", "stores---", res);
      if (res == null ? void 0 : res.data.length) {
        this.storages = [];
        res.data.map((item) => {
          this.storages.push({
            value: item.id,
            text: item.name
          });
        });
      }
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
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:157", "---res", res);
    },
    changeUnit() {
    },
    addTag() {
      this.tags.push({ value: this.tagsNameStr, text: this.tagsNameStr });
    },
    doSubmit() {
      common_vendor.index.__f__("log", "at pages/packing-in/packing-in.nvue:164", this.tagStr, this.goodsName, this.storeId, this.tagsNameStr, this.quantity, this.supplier, this.shelfLifeDays);
      this.stockIn();
    }
  }
};
if (!Array) {
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  (_easycom_uni_data_checkbox2 + _easycom_uni_data_select2 + _easycom_uni_easyinput2)();
}
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
if (!Math) {
  (_easycom_uni_data_checkbox + _easycom_uni_data_select + _easycom_uni_easyinput)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.t($data.selectedName),
    c: $data.homeOptions,
    d: $data.selectedName,
    e: common_vendor.o((...args) => $options.homeSwitch && $options.homeSwitch(...args)),
    f: $data.goodsName,
    g: common_vendor.o(($event) => $data.goodsName = $event.detail.value),
    h: $data.supplier,
    i: common_vendor.o(($event) => $data.supplier = $event.detail.value),
    j: $data.tagsNameStr,
    k: common_vendor.o(($event) => $data.tagsNameStr = $event.detail.value),
    l: common_vendor.o(($event) => $data.tagStr = $event),
    m: common_vendor.p({
      mode: "tag",
      multiple: false,
      localdata: $data.tags,
      modelValue: $data.tagStr
    }),
    n: $data.quantity,
    o: common_vendor.o(($event) => $data.quantity = $event.detail.value),
    p: common_vendor.o($options.changeUnit),
    q: common_vendor.o(($event) => $data.unit = $event),
    r: common_vendor.p({
      localdata: $data.unitRange,
      placement: "top",
      clear: false,
      modelValue: $data.unit
    }),
    s: common_vendor.o(($event) => $data.shelfLifeDays = $event),
    t: common_vendor.p({
      clearable: false,
      placeholder: "请输入天数",
      modelValue: $data.shelfLifeDays
    }),
    v: common_vendor.o(($event) => $data.storeId = $event),
    w: common_vendor.p({
      mode: "tag",
      multiple: false,
      localdata: $data.storages,
      modelValue: $data.storeId
    }),
    x: common_vendor.o((...args) => $options.doSubmit && $options.doSubmit(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d9e538a6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/packing-in/packing-in.js.map
