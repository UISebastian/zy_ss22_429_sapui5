sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    //"use strict";

    return Controller.extend("reservationManagement.reservationManagement.controller.ManageRestaurants", {

        onNavButtonPressed: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        onNavToManageReservations: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("manageReservations");
        },


        onNavToManageTables: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("manageTables");
        },

        onNavToManageAllocation: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("manageAllocation");
        },

        onNavToManageRestaurants: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("manageRestaurants");
        },

        onInit: function () {
            var sPath = $.sap.getModulePath("reservationManagement.reservationManagement", "/model/applicationProperties.json");
            var that = this;

            var oSettingsModel = new sap.ui.model.json.JSONModel();
            oSettingsModel.loadData(sPath);
            oSettingsModel.attachRequestCompleted(function () {
                that.getView().setModel(this, "Settings");
                var serviceURL = that.getView().getModel("Settings").getProperty("/oDataUrl");
                var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                that.getView().setModel(oModel);
            });

        },

        onCreateRestaurant: function () {

        },

        updatePopUp: function () {

        },

        deleteRestPopup: function () {

        },

        onCreateRestaurant: function () {
            sap.m.MessageToast.show("Unfortunately, your salary level is not enough to manage a restaurant!");
            

        },

        updatePopup: function () {
            sap.m.MessageToast.show("Unfortunately, your salary level is not enough to manage a restaurant!");
        },

        deleteRestPopup: function () {
            sap.m.MessageToast.show("Unfortunately, your salary level is not enough to manage a restaurant!");
        },





        onClear: function () {
            var serviceURL = this.getView().getModel("Settings").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            this.getView().byId("tableRestaurantId").setModel(oModel);
        }





    });
});