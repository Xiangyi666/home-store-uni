"use strict";
const common_vendor = require("../../../../common/vendor.js");
let mpMixins = {};
let is_pc = null;
mpMixins = {
  data() {
    return {
      is_show: "none"
    };
  },
  watch: {
    show(newVal) {
      common_vendor.index.__f__("log", "at uni_modules/uni-swipe-action/components/uni-swipe-action-item/mpwxs.js:19", "---newVal", newVal);
      this.is_show = this.show;
    }
  },
  created() {
    this.swipeaction = this.getSwipeAction();
    if (this.swipeaction && Array.isArray(this.swipeaction.children)) {
      this.swipeaction.children.push(this);
    }
  },
  mounted() {
    this.is_show = this.show;
  },
  methods: {
    // wxs 中调用
    closeSwipe(e) {
      if (this.autoClose && this.swipeaction) {
        this.swipeaction.closeOther(this);
      }
    },
    change(e) {
      this.$emit("change", e.open);
      if (this.is_show !== e.open) {
        this.is_show = e.open;
      }
    },
    appTouchStart(e) {
      const {
        clientX
      } = e.changedTouches[0];
      this.clientX = clientX;
      this.timestamp = (/* @__PURE__ */ new Date()).getTime();
    },
    appTouchEnd(e, index, item, position) {
      common_vendor.index.__f__("log", "at uni_modules/uni-swipe-action/components/uni-swipe-action-item/mpwxs.js:56", "12312312", e, index, is_pc);
      common_vendor.index.__f__("log", "at uni_modules/uni-swipe-action/components/uni-swipe-action-item/mpwxs.js:57", "show---", this.show);
      this.is_show = this.show;
      const {
        clientX
      } = e.changedTouches[0];
      let diff = Math.abs(this.clientX - clientX);
      let time = (/* @__PURE__ */ new Date()).getTime() - this.timestamp;
      if (diff < 40 && time < 300) {
        this.$emit("click", {
          content: item,
          index,
          position
        });
        this.closeSwipe();
      }
    },
    onClickForPC(index, item, position) {
      return;
    }
  }
};
const mpwxs = mpMixins;
exports.mpwxs = mpwxs;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-swipe-action/components/uni-swipe-action-item/mpwxs.js.map
