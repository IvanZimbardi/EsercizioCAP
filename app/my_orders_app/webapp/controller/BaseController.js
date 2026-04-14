sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "../util/entityUtils"],
  (Controller, JSONModel, entityUtils) => {
    "use strict";

    return Controller.extend("testCap.controller.BaseController", {
      setModel: function (oModel, sName) {
        this.getView().setModel(oModel, sName);

        return this.getModel(sName);
      },

      getModel: function (sName) {
        return this.getView().getModel(sName);
      },

      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      navTo: function (sName, oParameters, bReplace) {
        this.getRouter().navTo(sName, oParameters, undefined, bReplace);
      },

      getText: function (sKey) {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey);
      },

      loadFragment: function (sFragmentName) {
        const oView = this.getView();
        let oFragment = oView.byId(sFragmentName);

        if (oFragment) {
          return Promise.resolve(oFragment);
        }

        return sap.ui.core.Fragment.load({
          id: oView.getId(),
          name: "com.test.myordersapp.view.dialog." + sFragmentName,
          controller: this,
        }).then((oNewFragment) => {
          oView.addDependent(oNewFragment);
          return oNewFragment;
        });
      },

      loadData: async function (sUrl, sModelName, aFilters, iTop, iSkip) {
        const oView = this.getView();
        oView.setBusy(true);

        try {
          let aQueryParams = [];

          if (aFilters && aFilters.length > 0) {
            const sFilterQuery = this._serializeFilters(aFilters);
            aQueryParams.push("$filter=" + encodeURIComponent(sFilterQuery));
          }

          if (iTop !== undefined) aQueryParams.push(`$top=${iTop}`);
          if (iSkip !== undefined) aQueryParams.push(`$skip=${iSkip}`);

          aQueryParams.push("$count=true");

          const sFullUrl = sUrl + (aQueryParams.length > 0 ? "?" + aQueryParams.join("&") : "");
          const response = await fetch(sFullUrl);
          if (!response.ok) throw new Error(response.statusText);

          const oData = await response.json();
          const oModel = this.getModel(sModelName);

          oModel.setProperty("/Data", oData.value);
          const iCount = oData["@odata.count"] ? Number(oData["@odata.count"]) : 0;
          oModel.setProperty("/Count", iCount);
        } catch (error) {
          console.error(error);
        } finally {
          oView.setBusy(false);
        }
      },

      _serializeFilters: function (aFilters) {
        return aFilters
          .map((oFilter) => {
            const sPath = oFilter.sPath;
            const sValue = oFilter.oValue1;
            const sOperator = oFilter.sOperator;

            if (sOperator === "EQ") {
              return `${sPath} eq '${sValue}'`;
            } else if (sOperator === "Contains") {
              return `contains(${sPath},'${sValue}')`;
            }
            return "";
          })
          .join(" and ");
      },

      createData: async function (sUrl, oPayload) {
        const oView = this.getView();
        oView.setBusy(true);

        try {
          const response = await fetch(sUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(oPayload),
          });
          if (!response.ok) {
            const oError = await response.json().catch(() => ({}));
            const sMsg = oError.error?.message || `Errore Server: ${response.status}`;

            throw new Error(sMsg);
          }
          if (response.status === 204) return {};
          return await response.json();
        } catch (error) {
          console.error(error);
          throw error;
        } finally {
          oView.setBusy(false);
        }
      },

      deleteData: async function (sUrl) {
        const oView = this.getView();
        oView.setBusy(true);

        try {
          const response = await fetch(sUrl, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const oError = await response.json().catch(() => ({}));
            const sMsg = oError.error?.message || `Errore durante l'eliminazione: ${response.status}`;

            throw new Error(sMsg);
          }

          return true;
        } catch (error) {
          console.error(error);
          throw error;
        } finally {
          oView.setBusy(false);
        }
      },

      updateData: async function (sUrl, oPayload) {
        const oView = this.getView();
        oView.setBusy(true);

        try {
          const response = await fetch(sUrl, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(oPayload),
          });

          if (!response.ok) {
            const oError = await response.json().catch(() => ({}));
            throw new Error(oError.error?.message || `Errore: ${response.status}`);
          }

          return true;
        } catch (error) {
          throw error;
        } finally {
          oView.setBusy(false);
        }
      },
    });
  },
);
