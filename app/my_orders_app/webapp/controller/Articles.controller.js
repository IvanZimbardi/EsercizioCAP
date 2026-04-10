sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../util/entityUtils", "sap/m/MessageToast", "sap/m/MessageBox"],
  (BaseController, JSONModel, entityUtils, MessageToast, MessageBox) => {
    "use strict";

    const INIT_MODEL_FILTERS = {
      CodArticolo: "",
      NomeArticolo: "",
    };

    const INIT_PRODUCTS = {
      CodArticolo: "",
      NomeArticolo: "",
      Importo: 0,
      QuantitaDisp: 0,
    };

    return BaseController.extend("com.test.myordersapp.controller.Articles", {
      onInit: function () {
        this.oModelArticles = this.setModel(new JSONModel({}), "Articles");

        this.oModelCreate = this.setModel(new JSONModel(Object.assign({}, INIT_PRODUCTS)), "NewArticle");

        this.oModelFilters = this.setModel(new JSONModel(Object.assign({}, INIT_MODEL_FILTERS)), "Filters");
        this.loadProducts();
      },

      onNavToOrders: function (oEvent) {
        this.navTo("RouteOrders");
      },

      loadProducts: async function () {
        await this.loadData("/odata/v4/catalog/Articles", "Articles");
      },

      onSearch: async function () {
        const aFilters = [];
        const oData = this.oModelFilters.getData();

        if (oData.CodArticolo) {
          entityUtils.setFilterEQ(aFilters, "CodArticolo", oData.CodArticolo);
        }
        if (oData.NomeArticolo) {
          entityUtils.setFilterContains(aFilters, "NomeArticolo", oData.NomeArticolo);
        }

        await this.loadData("/odata/v4/catalog/Articles", "Articles", aFilters);
      },

      onReset: async function () {
        this.oModelFilters.setData(INIT_MODEL_FILTERS);
        await this.loadData("/odata/v4/catalog/Articles", "Articles");
      },

      onSaveArticle: async function () {
        const oNewArticleData = this.getModel("NewArticle").getData();

        if (!oNewArticleData.CodArticolo || !oNewArticleData.NomeArticolo) {
          sap.m.MessageBox.error("Per favore, compila i campi obbligatori.");
          return;
        }

        try {
          await this.createData("/odata/v4/catalog/Articles", oNewArticleData);

          sap.m.MessageToast.show("Articolo creato con successo!");

          this.getModel("NewArticle").setData(Object.assign({}, INIT_PRODUCTS));

          await this.loadProducts();
        } catch (error) {
          sap.m.MessageBox.error(error.message);
        }
      },
    });
  },
);
