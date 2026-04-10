sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], (BaseController, JSONModel) => {
  "use strict";

  return BaseController.extend("com.test.myordersapp.controller.Orders", {
    onInit: function () {
      this.oModelOrders = this.setModel(new JSONModel({}), "Orders");
      this.loadProducts();
    },

    onNavToArticles: function (oEvent) {
      this.navTo("RouteArticles");
    },

    loadProducts: async function () {
      await this.loadData("/odata/v4/catalog/Orders", "Orders");
    },
  });
});
