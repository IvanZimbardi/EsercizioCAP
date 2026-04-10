sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Filter, FilterOperator) {
  "use strict";

  return {
    setFilterEQ: function (aFilters, sPropertyModel, sValue) {
      if (sValue) {
        aFilters.push(new Filter(sPropertyModel, FilterOperator.EQ, sValue));
      }
    },

    setFilterContains: function (aFilters, sPropertyModel, sValue) {
      if (sValue) {
        aFilters.push(new Filter(sPropertyModel, FilterOperator.Contains, sValue));
      }
    },
  };
});
