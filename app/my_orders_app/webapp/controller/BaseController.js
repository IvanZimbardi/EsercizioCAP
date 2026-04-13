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
          if (!response.ok) throw new Error(error);

          const oData = await response.json();
          const oModel = this.getModel(sModelName);

          oModel.setProperty("/Data", oData.value);
          oModel.setProperty("/Count", oData["@odata.count"] || 0);
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
            let sErrorMessage = "Errore durante il salvataggio";
            try {
              const oErrorData = await response.json();
              sErrorMessage = oErrorData.error?.message || sErrorMessage;
            } catch (e) {
              sErrorMessage = `Errore server: ${response.status} ${response.statusText}`;
            }
            throw new Error(sErrorMessage);
          }
          const sContentType = response.headers.get("content-type");
          if (response.status === 204 || !sContentType || !sContentType.includes("application/json")) {
            return {};
          }
          return await response.json();
        } catch (error) {
          console.error(error);
          throw error;
        } finally {
          oView.setBusy(false);
        }
      },
    });
  },
);
