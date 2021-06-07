const apiUrl = "https://vue3-course-api.hexschool.io";
const apiPath = "onedog";
let detailModal = "";
let cartModal = "";

import "https://unpkg.com/mitt/dist/mitt.umd.js"; //載入mitt套件
const emitter = mitt(); //啟用套件(名稱自訂)

Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

const app = Vue.createApp({
  data() {
    return {
      products: {},
      tempProducts: {},
    };
  },
  methods: {
    getData() {
      axios
        .get(`${apiUrl}/api/${apiPath}/products`)
        .then((response) => {
          if (response.data.success) {
            // console.log(response.data.products);
            this.products = response.data.products;
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => console.log(error));
    },
    openModal(action, item) {
      if (action === "detail") {
        this.tempProducts = { ...item };
        detailModal.show();
      }
    },
  },
  mounted() {
    detailModal = new bootstrap.Modal(
      document.getElementById("detailComponent")
    );
    cartModal = new bootstrap.Modal(document.getElementById("cart"));
    this.getData();
    console.log(this.$refs);
    // this.$refs.cart.getCart();
  },
});
app.component("navComponent", {
  template: "#navComponent",
  data() {
    return {
      cartsLength: "",
    };
  },
  methods: {
    getLength(length) {
      this.cartsLength = length;
    },
    openModal(action, item) {
      if (action === "cart") {
        cartModal.show();
      }
    },
  },
  created() {
    emitter.on("getLength", (length) => this.getLength(length));
  },
  mounted() {
    // console.log(emitter);
  },
});

app.component("detailComponent", {
  template: "#detailComponent",
  props: ["product"],
  data() {
    return {
      qty: 1,
      loadingStatus: "",
    };
  },
  methods: {
    addToCart(id, qty = 1) {
      console.log(id);
      this.loadingStatus = id;
      const cart = {
        product_id: id,
        qty,
      };
      const url = `${apiUrl}/api/${apiPath}/cart`;
      axios
        .post(url, { data: cart })
        .then((response) => {
          if (response.data.success) {
            alert(response.data.message);
            this.loadingStatus = "";
            emitter.emit("getCart"); //呼叫cart的getCart方法
            detailModal.hide();
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => console.log(error));
    },
  },
  mounted() {
    console.log(emitter);
  },
});

app.component("cart", {
  template: "#cart",
  data() {
    return {
      carts: {},
      qty: 1,
      loadingStatus: "",
      cartsLength: "",
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
    };
  },
  methods: {
    getCart() {
      axios
        .get(`${apiUrl}/api/${apiPath}/cart`)
        .then((response) => {
          if (response.data.success) {
            this.carts = response.data.data;
            this.cartsLength = this.carts.carts.length;
            emitter.emit("getLength", this.cartsLength);
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => console.log(error));
    },
    updateCart(data) {
      this.loadingStatus = data.id;
      const cart = {
        product_id: data.product_id,
        qty: data.qty,
      };
      const url = `${apiUrl}/api/${apiPath}/cart/${data.id}`;
      axios
        .put(url, { data: cart })
        .then((response) => {
          if (response.data.success) {
            alert(response.data.message);
            this.loadingStatus = "";
            this.getCart();
          } else {
            alert(response.data.message);
            this.loadingStatus = "";
          }
        })
        .catch((error) => console.log(error));
    },
    clearCart() {
      this.loadingStatus = "clear";
      const url = `${apiUrl}/api/${apiPath}/carts`;
      axios
        .delete(url)
        .then((response) => {
          if (response.data.success) {
            alert(response.data.message);
            this.getCart();
            this.loadingStatus = "";
          } else {
            alert(response.data.message);
            this.loadingStatus = "";
          }
        })
        .catch((error) => console.log(error));
    },
    delItem(id) {
      this.loadingStatus = id;
      const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
      axios
        .delete(url)
        .then((response) => {
          if (response.data.success) {
            alert(response.data.message);
            this.loadingStatus = "";
            this.getCart();
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => console.log(error));
    },
    createOrder() {
      if (this.cartsLength <= 0) {
        alert("購物車為空，請下單完再送出唷");
        return;
      }
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form;
      axios
        .post(url, { data: order })
        .then((response) => {
          if (response.data.success) {
            alert(response.data.message + "，謝謝惠顧。");
            this.$refs.form.resetForm();
            this.getCart();
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => console.log(error));
    },
  },
  created() {
    emitter.on("getCart", () => this.getCart()); //註冊一個getCart方法
  },
  mounted() {
    // console.log(this.$refs);
    this.getCart();
  },
});
app.component("VForm", VeeValidate.Form); //form表單
app.component("VField", VeeValidate.Field); //input欄位
app.component("ErrorMessage", VeeValidate.ErrorMessage); //錯誤訊息
app.mount("#app");
