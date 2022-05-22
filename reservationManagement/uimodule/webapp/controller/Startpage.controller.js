sap.ui.define([
  "jquery.sap.global",
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/format/NumberFormat",
  "sap/m/MessageToast",
  "sap/m/library"
], function (jQuery, Controller, JSONModel, NumberFormat, MessageToast, MobileLibrary) {
  //"use strict";

  return Controller.extend("reservationManagement.reservationManagement.controller.Startpage", {
    onInit: function () {
      var sDataPath = sap.ui.require.toUrl("reservationManagement/reservationManagement/model/data/Decoration.json");
      var oModel = new JSONModel(sDataPath);
      var oCurrentYear = new Date().getFullYear(); //2022
      var oCurrentMonth = new Date().getMonth(); //4
      var oCurrentDay = new Date().getDate(); //14


      for (var key in oModel.jsonData) {
        if (oModel.jsonData[key].current == true) {
          oModel = oModel.jsonData[key]
        }
      }

      this.getView().setModel(oModel, "decoration");

    },

    onNavToManageReservations: function () {
      this.getRouter().navTo("manageReservations");
    },

    onNavToManageAllocation: function () {
      this.getRouter().navTo("manageAllocation");
    },

    onNavToManageTables: function () {
      this.getRouter().navTo("manageTables");
    },

    onNavToManageAllocation: function () {
      this.getRouter().navTo("manageAllocation");
    },

    onNavToManageRestaurants: function(){
      this.getRouter().navTo("manageRestaurants");
    },

    getRouter: function () {
      return this.getOwnerComponent().getRouter();
    },

    /**
     * Getter for the resource bundle.
     * @public
     * @returns {sap.ui.model.resource.ResourceModel} The ResourceModel of the component
     */
    getResourceBundle: function () {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    formatJSONDate: function (date) {
      var oDate = new Date(Date.parse(date));
      return oDate.toLocaleDateString();
    }
  });
});