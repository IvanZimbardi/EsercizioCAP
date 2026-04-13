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

        this.oModelEdit = this.setModel(new JSONModel({}), "EditArticle");

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

          this.onCloseCreateDialog();

          await this.loadProducts();
        } catch (error) {
          MessageBox.error(error.message);
        }
      },

      onNextPage: async function () {
        let iSkip = this.oModelPaging.getProperty("/skip");
        const iTop = this.oModelPaging.getProperty("/top");
        const iTotal = this.oModelArticles.getProperty("/Count");

        if (iSkip + iTop >= iTotal) {
          return;
        }

        iSkip += iTop;

        this.oModelPaging.setProperty("/skip", iSkip);
        await this.loadProducts();
      },

      onPreviousPage: async function () {
        let iSkip = this.oModelPaging.getProperty("/skip");
        const iTop = this.oModelPaging.getProperty("/top");

        if (iSkip <= 0) {
          return;
        }

        iSkip -= iTop;
        if (iSkip < 0) iSkip = 0;

        this.oModelPaging.setProperty("/skip", iSkip);
        await this.loadProducts();
      },

      onDeleteArticle: function (oEvent) {
        const oItem = oEvent.getSource().getBindingContext("Articles").getObject();
        const sId = oItem.CodArticolo;

        MessageBox.warning(this.getText("msgConfirmDelete"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async (sKey) => {
            if (sKey === MessageBox.Action.YES) {
              try {
                const sUrl = `/odata/v4/catalog/Articles(${sId})`;

                await this.deleteData(sUrl);

                MessageBox.success(this.getText("MsgDeleteCompleted"));

                await this.loadProducts();
              } catch (error) {
                MessageBox.error(error.message);
              }
            }
          },
        });
      },
      onOpenCreateDialog: async function () {
        this.getModel("NewArticle").setData(Object.assign({}, INIT_MODEL_ARTICLES));
        const oDialog = await this.loadFragment("AddProd");
        oDialog.open();
      },

      onCloseCreateDialog: function () {
        const oDialog = this.getView().byId("AddProd");
        if (oDialog) {
          oDialog.close();
        }
      },

      onOpenEditDialog: async function (oEvent) {
        const oItem = oEvent.getSource().getBindingContext("Articles").getObject();

        this.oModelEdit.setData(Object.assign({}, oItem));

        const oDialog = await this.loadFragment("EditProd");
        oDialog.open();
      },

      onCloseEditDialog: function () {
        const oDialog = this.getView().byId("EditProd");
        if (oDialog) {
          oDialog.close();
        }
      },
    });
  },
);
