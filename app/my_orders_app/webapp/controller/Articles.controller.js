sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../util/entityUtils", "sap/m/MessageBox"],
  (BaseController, JSONModel, entityUtils, MessageBox) => {
    "use strict";

    const INIT_PAGING = {
      top: 10,
      skip: 0,
    };

    const INIT_MODEL_FILTERS = {
      CodArticolo: "",
      NomeArticolo: "",
    };

    const INIT_MODEL_ARTICLES = {
      CodArticolo: "",
      NomeArticolo: "",
      Importo: 0,
      QuantitaDisp: 0,
    };

    return BaseController.extend("com.test.myordersapp.controller.Articles", {
      onInit: function () {
        this.oModelArticles = this.setModel(new JSONModel({}), "Articles");

        this.oModelPaging = this.setModel(new JSONModel(Object.assign({}, INIT_PAGING)), "Paging");

        this.oModelFilters = this.setModel(new JSONModel(Object.assign({}, INIT_MODEL_FILTERS)), "Filters");

        this.oModelCreate = this.setModel(new JSONModel(Object.assign({}, INIT_MODEL_ARTICLES)), "NewArticle");

        this.loadProducts();
      },

      onNavToOrders: function (oEvent) {
        this.navTo("RouteOrders");
      },

      loadProducts: async function () {
        const oPaging = this.oModelPaging.getData();
        const oFilterData = this.oModelFilters.getData();
        const aFilters = [];

        if (oFilterData.CodArticolo) {
          entityUtils.setFilterEQ(aFilters, "CodArticolo", oFilterData.CodArticolo);
        }
        if (oFilterData.NomeArticolo) {
          entityUtils.setFilterContains(aFilters, "NomeArticolo", oFilterData.NomeArticolo);
        }

        await this.loadData("/odata/v4/catalog/Articles", "Articles", aFilters, oPaging.top, oPaging.skip);
      },

      onSearch: async function () {
        this.oModelPaging.setProperty("/skip", 0);
        await this.loadProducts();
      },

      onReset: async function () {
        this.oModelFilters.setData(Object.assign({}, INIT_MODEL_FILTERS));
        this.oModelPaging.setProperty("/skip", 0);

        await this.loadProducts();
      },

      onSaveArticle: async function () {
        const oNewArticleData = this.oModelCreate.getData();

        if (!oNewArticleData.CodArticolo || !oNewArticleData.NomeArticolo) {
          MessageBox.error(this.getText("MsgErrorFields"));
          return;
        }

        try {
          await this.createData("/odata/v4/catalog/Articles", oNewArticleData);

          MessageBox.success(this.getText("MsgCreateSuccess"));

          this.oModelCreate.setData(Object.assign({}, INIT_MODEL_ARTICLES));

          await this.loadProducts();
        } catch (error) {
          MessageBox.error(error.message);
        }
      },

      onNextPage: async function () {
        let iSkip = this.oModelPaging.getProperty("/skip");
        const iTop = this.oModelPaging.getProperty("/top");

        iSkip += iTop;

        this.oModelPaging.setProperty("/skip", iSkip);

        await this.loadProducts();
      },

      onPreviousPage: async function () {
        let iSkip = this.oModelPaging.getProperty("/skip");
        const iTop = this.oModelPaging.getProperty("/top");

        iSkip -= iTop;
        if (iSkip < 0) iSkip = 0;

        this.oModelPaging.setProperty("/skip", iSkip);

        await this.loadProducts();
      },
    });
  },
);
