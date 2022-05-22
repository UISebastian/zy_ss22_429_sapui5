sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/mvc/Controller"
], function (jQuery, Controller) {
    //"use strict";

    return Controller.extend("reservationManagement.reservationManagement.controller.ManageTables", {
        onNavButtonPressed: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("home");
        },

        onNavToManageReservations: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("manageReservations");
        },

        onNavToManageTables: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("manageTables");
        },

        onNavToReviews: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("reviews");
        },

        onNavToManageAllocation: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("manageAllocation");
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

        createTable: async function () {
            var that = this;

            var cancelButton = new sap.m.Button({
                text: "Cancel",
                type: sap.m.ButtonType.Reject,
                press: function () {
                    sap.ui.getCore().byId("Popup").destroy();
                }
            });

            var saveButton = new sap.m.Button({
                text: "Save",
                type: sap.m.ButtonType.Accept,
                press: async function () {
                    var serviceURL = that.getView().getModel("Settings").getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);





                    await oModel.read("/ZYSS22_429_TABLESet/$count", {
                        success: function (oData, response) {
                            var numOfTables;
                            var newTableId;
                            numOfTables = response.body;
                            console.log(numOfTables);
                            fetch("../model/data/Id.json")
                                .then(response => {
                                    return response.json()
                                })
                                .then(jsondata => {
                                    for (var i = 0; i < jsondata.id.length; i++) {
                                        if (numOfTables == jsondata.id[i]) {
                                            newTableId = jsondata.id[i];
                                            console.log(JSON.stringify(newTableId));
                                            var oNewTable = {
                                                TableId: JSON.stringify(newTableId),
                                                RestId: "0",
                                                NumOfSeats: sap.ui.getCore().byId("seats").getValue(),
                                                Location: sap.ui.getCore().byId("location").getSelectedItem().getText(),
                                                Decoration: sap.ui.getCore().byId("decoration").getValue(),
                                                Booked: "0"
                                            }
                                            oModel.create("/ZYSS22_429_TABLESet", oNewTable, {
                                                success: function (oData, oResponse) {
                                                    sap.m.MessageToast.show("Table successfully created!");
                                                    oModel.refresh();
                                                    that.onClear();
                                                    sap.ui.getCore().byId("Popup").destroy();
                                                },
                                                error: function (oError) {
                                                    sap.m.MessageToast.show("Error during table creation!");
                                                }
                                            });
                                            break;
                                        }
                                    }
                                });





                        },
                        error: function (oData, response) {
                            alert("Could not retrieve latest table id!")
                        },

                    }

                    );

                }
            });

            var oDialog = new sap.m.Dialog("Popup", {
                title: "Create Table",
                modal: true,
                contentWidth: "1em",
                buttons: [saveButton, cancelButton],
                content: [new sap.m.Label({
                    text: "Number of seats"
                }), new sap.m.Input({
                    maxLength: 20,
                    id: "seats",
                    placeholder: "e.g. 4"
                }), new sap.m.Label({
                    text: "Decoration"
                }), new sap.m.Input({
                    maxLength: 30,
                    id: "decoration",
                    placeholder: "e.g. SPRING"
                }), new sap.m.Label({
                    text: "Location"
                }), new sap.m.Select({
                    id: "location",
                    items: [
                        new sap.ui.core.Item({
                            text: "INSIDE"
                        }),
                        new sap.ui.core.Item({
                            text: "OUTSIDE"
                        })
                    ]
                }),]
            });
            sap.ui.getCore().byId("Popup").open();
        },

        deletePopup: function () {
            var that = this;
            var cancelButton = new sap.m.Button({
                text: "Cancel",
                type: sap.m.ButtonType.Default,
                press: function () {
                    sap.ui.getCore().byId("deletePopup").destroy();
                }
            });
            var deleteButton = new sap.m.Button({
                text: "Delete",
                type: sap.m.ButtonType.Reject,
                press: function () {
                    var serviceURL = that.getView().getModel("Settings").getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                    var deleteId = sap.ui.getCore().byId("did").getValue();
                    var dPath = "/ZYSS22_429_TABLESet(TableId=" + deleteId + "l" + ",RestId=" + 0 + "l" + ")";

                    oModel.remove(dPath, {
                        method: "DELETE",
                        success: function (oData, oResponse) {
                            sap.m.MessageToast.show("Successfully deleted!");
                            oModel.refresh();
                            that.onClear();
                            sap.ui.getCore().byId("deletePopup").destroy();
                        },
                        error: function (oError) {
                            sap.m.MessageToast.show("Error during table deletion");
                        }
                    });
                }
            });

            if (that.getView().byId("tableTablesId").getSelectedItem() != null) {
                var selectedId = that.getView().byId("tableTablesId").getSelectedItem().getBindingContext().getProperty("TableId");
            }

            var oDialog = new sap.m.Dialog("deletePopup", {
                title: "Delete Table",
                modal: true,
                contentWidth: "1em",
                buttons: [deleteButton, cancelButton],
                content: [new sap.m.Label({
                    text: "Selected Table ID"
                }), new sap.m.Input({
                    maxLength: 3,
                    id: "did",
                    value: selectedId,
                    editable: false
                })]
            });
            if (selectedId != null) {
                sap.ui.getCore().byId("deletePopup").open();
            } else {
                sap.m.MessageToast.show("Select Table first");
                sap.ui.getCore().byId("deletePopup").destroy();
            }
        },

        updatePopup: function () {
            var that = this;
            var cancelButton = new sap.m.Button({
                text: "Cancel",
                type: sap.m.ButtonType.Reject,
                press: function () {
                    sap.ui.getCore().byId("updatePopup").destroy();
                }
            });
            var saveButton = new sap.m.Button({
                text: "Save",
                type: sap.m.ButtonType.Accept,
                press: function () {
                    var serviceURL = that.getView().getModel("Settings").getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                    var oUpdateTable = {
                        NumOfSeats: sap.ui.getCore().byId("seats").getValue(),
                        Location: sap.ui.getCore().byId("location").getSelectedItem().getText(),
                        Decoration: sap.ui.getCore().byId("decoration").getValue()
                    };

                    var updateId = parseInt(sap.ui.getCore().byId("id").getValue());
                    var dPath = "/ZYSS22_429_TABLESet(TableId=" + updateId + "l" + ",RestId=" + 0 + "l" + ")";

                    oModel.update(dPath, oUpdateTable, {
                        success: function (oData, oResponse) {
                            sap.m.MessageToast.show("Table successfully updated!");
                            oModel.refresh();
                            that.onClear();
                            sap.ui.getCore().byId("updatePopup").destroy();
                        },
                        error: function (oError) {
                            sap.m.MessageToast.show("Error during table update");
                        }
                    });
                }
            });

            if (that.getView().byId("tableTablesId").getSelectedItem() != null) {
                var selectedId = that.getView().byId("tableTablesId").getSelectedItem().getBindingContext().getProperty("TableId");
                var selectedSeats = that.getView().byId("tableTablesId").getSelectedItem().getBindingContext().getProperty("Seats");
                var selectedLocation = that.getView().byId("tableTablesId").getSelectedItem().getBindingContext().getProperty("Location");
                var selectedDecoration = that.getView().byId("tableTablesId").getSelectedItem().getBindingContext().getProperty("Decoration");
            }

            var oDialog = new sap.m.Dialog("updatePopup", {
                title: "Update Table",
                modal: true,
                contentWidth: "1em",
                buttons: [saveButton, cancelButton],
                content: [new sap.m.Label({
                    text: "Selected Table ID"
                }), new sap.m.Input({
                    maxLength: 3,
                    id: "id",
                    value: selectedId,
                    editable: false
                }), new sap.m.Label({
                    text: "Seats"
                }), new sap.m.Input({
                    maxLength: 3,
                    id: "seats",
                    value: selectedSeats
                }), new sap.m.Label({
                    text: "Decoration"
                }), new sap.m.Input({
                    maxLength: 30,
                    id: "decoration",
                    value: selectedDecoration
                }), new sap.m.Label({
                    text: "Location"
                }), new sap.m.Select({
                    id: "location",
                    items: [
                        new sap.ui.core.Item({
                            text: "INSIDE"
                        }),
                        new sap.ui.core.Item({
                            text: "OUTSIDE"
                        })
                    ],
                    value: selectedLocation
                })]
            });

            if (that.getView().byId("tableTablesId").getSelectedItem() != null) {
                var selectedId = that.getView().byId("tableTablesId").getSelectedItem().getBindingContext().getProperty("TableId");
                sap.ui.getCore().byId("updatePopup").open();
            } else {
                sap.m.MessageToast.show("Select Table first");
                sap.ui.getCore().byId("updatePopup").destroy();
            }
            sap.ui.getCore().byId("updatePopup").open();
        },

        onClear: function () {
            var serviceURL = this.getView().getModel("Settings").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            this.getView().byId("tableTablesId").setModel(oModel);
        }
    });
});