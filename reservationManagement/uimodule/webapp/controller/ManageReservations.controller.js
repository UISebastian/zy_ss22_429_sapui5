sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  //"use strict";

  return Controller.extend("reservationManagement.reservationManagement.controller.ManageReservations", {

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



    onCreateReservation: async function () {
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

          var inputs = [
            sap.ui.getCore().byId("time"),
            sap.ui.getCore().byId("timeend"),
            sap.ui.getCore().byId("resdate"),
            sap.ui.getCore().byId("name")
          ];
          jQuery.each(inputs, function (i, input) {
            if (!input.getValue()) {
              input.setValueState("Error");
            } else {
              input.setValueState("None");
            }
          });

          //check whether error state has been reached
          var canContinue = true;
          jQuery.each(inputs, function (i, input) {
            if ("Error" === input.getValueState()) {
              canContinue = false;
              return false;
            }
          });

          if (canContinue) {



            oModel.read("/ZYSS22_429_RESTTSet(Id=" + 0 + "l)/OpeningTime", {
              success: function (oData, response) {
                openingTime = response.body; //TODO Trim first 21 and last 3 Chars away
                console.log(openingTime);


              },
              error: function (oData, response) {
                alert(response.body);
              },
            });
            oModel.read("/ZYSS22_429_RESTTSet(Id=" + 0 + "l)/ClosingTime", {
              success: function (oData, response) {
                closingTime = response.body; //TODO Trim first 21 and last 3 Chars away
                console.log(closingTime);


              },
              error: function (oData, response) {
                alert(response.body);
              },
            });

            await oModel.read("/ZYSS22_429_TABLESet?$select=TableId,NumOfSeats", {
              success: function (oData) {

                var noOfGuests = sap.ui.getCore().byId("noguest").getSelectedItem().getText();
                var obj = oData.results
                console.log(obj);
                console.log(parseInt(noOfGuests));
                console.log(obj[1].NumOfSeats);
                for (var j = 0; j < obj.length; j++) {
                  if (parseInt(noOfGuests) <= parseInt(obj[j].NumOfSeats) && obj[j].Booked != 1) {

                    var tableId = obj[j].TableId;
                    console.log(tableId);

                    oModel.read("/ZYSS22_429_RESERSet/$count", {
                      success: function (oData, oResponse) {




                        var numOfReservation;

                        numOfReservation = oResponse.body;
                        fetch("../model/data/Id.json")
                          .then(response => {
                            return response.json()
                          })
                          .then(jsondata => {
                            for (var i = 0; i < jsondata.id.length; i++) {
                              if (numOfReservation == i) {

                                var resId = i;
                                console.log(resId.toString());
                                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "YYYY-MM-ddTHH:MM:SS" }); //Date and time formatting
                                var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: "PTHH'H'mm'M'ss'S'" });
                                var date = dateFormat.format(sap.ui.getCore().byId("resdate").getDateValue());
                                var startTime = timeFormat.format(sap.ui.getCore().byId("time").getDateValue());
                                var endTime = timeFormat.format(sap.ui.getCore().byId("timeend").getDateValue());

                                var freeText = sap.ui.getCore().byId("freetext").getValue();
                                var name = sap.ui.getCore().byId("name").getValue();
                                var oNewReservation = {
                                  Id: JSON.stringify(i),
                                  TableId: JSON.stringify(j),
                                  NumOfGuests: noOfGuests,
                                  FreeText: freeText,
                                  Name: name,
                                  ResDate: date,
                                  ResTime: startTime,
                                  ResDuration: endTime
                                };

                                oModel.create('/ZYSS22_429_RESERSet', oNewReservation, {
                                  success: function (oData, response) {
                                    sap.m.MessageToast.show("Reservation successfully created!");
                                    sap.ui.getCore().byId("Popup").destroy();
                                    oModel.refresh();
                                    that.onClear();
                                  },
                                  error: function (oError) {


                                    sap.m.MessageToast.show(oError);
                                  }
                                });

                                break;
                              }

                            }


                          });
                      },

                      error: function (oError) {
                        sap.m.MessageToast.show(oError.body);
                      }
                    });
                    break;
                  } else {
                    sap.m.MessageToast.show("Unfortunately we do not have any tables for you at the moment!");
                  }
                }
              }
            }
            );





          }
          else {
            jQuery.sap.require("sap.m.MessageBox");
            sap.m.MessageBox.alert("Please make sure that you filled in all required fields");
          }
        },
        error: function (oError) {
          sap.m.MessageToas.show(oError.body);
        }
      });
      var today = new Date();
      var minDate = today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear();





      var oDialog = new sap.m.Dialog("Popup", {
        title: "Create Reservation",
        contentWidth: "15%",
        buttons: [saveButton, cancelButton],
        content: [
          new sap.m.Label({
            text: "Name*"
          }), new sap.m.Input({
            maxLength: 0,
            id: "name",
            placeholder: "e.g. Mustermann",
            required: true
          }),
          new sap.m.Label({
            text: "Number of Guests*"
          }), new sap.m.Select({
            id: "noguest",
            items: [
              new sap.ui.core.Item({
                text: 1,
                id: "one"
              }),
              new sap.ui.core.Item({
                text: 2,
                id: "two"
              }),
              new sap.ui.core.Item({
                text: 3,
                id: "three"
              }),
              new sap.ui.core.Item({
                text: 4,
                id: "four"
              }),
              new sap.ui.core.Item({
                text: 5,
                id: "five"
              }),
              new sap.ui.core.Item({
                text: 6,
                id: "six"
              }),
              new sap.ui.core.Item({
                text: 7,
                id: "seven"
              }),
              new sap.ui.core.Item({
                text: 8,
                id: "eight"
              }),
              new sap.ui.core.Item({
                text: 9,
                id: "nine"
              }),
              new sap.ui.core.Item({
                text: 10,
                id: "ten"
              })
            ]
          }),
          new sap.m.Label({
            text: "Reservation Date*"
          }), new sap.m.DatePicker({
            id: "resdate",
            min: minDate,
            placeholder: "e.g. May 20, 2022",
            required: true,

          }), new sap.m.Label({
            text: "Reservation Time Start*"
          }), new sap.m.TimePicker({
            id: "time",
            displayFormat: "HH-mm",
            minutesStep: "30",
            placeholder: "e.g. 10:00",
            required: true,

          }), new sap.m.Label({
            text: "Reservation Time End*"
          }), new sap.m.TimePicker({
            id: "timeend",
            minutesStep: "30",
            displayFormat: "HH-mm",
            placeholder: "e.g. 12:00",
            required: true,

          }),
          new sap.m.Label({
            text: "Leave a comment if you like "
          }),
          new sap.m.Input({
            maxLength: 30,
            id: "freetext",
            placeholder: "Your comment",
            required: false
          }),
          new sap.m.Label({
            text: "Please fill in all marked (*) fields."
          })
        ]
      });



      sap.ui.getCore().byId("Popup").open();

    },














    deleteResPopup: function () {
      var that = this;
      var cancelButton = new sap.m.Button({
        text: "Cancel",
        type: sap.m.ButtonType.Default,
        press: function () {
          sap.ui.getCore().byId("deleteResPopup").destroy();
        }
      });
      var deleteButton = new sap.m.Button({
        text: "Delete",
        type: sap.m.ButtonType.Reject,
        press: async function () {
          var serviceURL = that.getView().getModel("Settings").getProperty("/oDataUrl");
          var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

          var deleteId = parseInt(sap.ui.getCore().byId("did").getValue());
          var tableId = parseInt(sap.ui.getCore().byId("tableid").getValue());
          var dPath = "/ZYSS22_429_RESERSet(Id=" + deleteId + "l,TableId=" + tableId + "l" + ")";


          oModel.remove(dPath, {
            method: "DELETE",
            success: function () {
              sap.m.MessageToast.show("Successfully deleted!");
              //TODO: Update Depending Table
              oModel.refresh();
              that.onClear()
              sap.ui.getCore().byId("deleteResPopup").destroy();
            },
            error: function () {
              sap.m.MessageToast.show("Error during reservation deletion");
            }
          });
        }
      });

      if (that.getView().byId("tableReservationId").getSelectedItem() != null) {
        var selectedId = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("Id");
        var tableId = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("TableId");
      }

      var oDialog = new sap.m.Dialog("deleteResPopup", {
        title: "Delete Reservation",
        modal: true,
        contentWidth: "1em",
        buttons: [deleteButton, cancelButton],
        content: [new sap.m.Label({
          text: "Selected Reservation ID"
        }), new sap.m.Input({
          maxLength: 3,
          id: "did",
          value: selectedId,
          editable: false
        }), new sap.m.Input({
          id: "tableid",
          value: tableId,
          editable: false
        })]
      });
      if (selectedId != null) {
        sap.ui.getCore().byId("deleteResPopup").open();
      } else {
        sap.m.MessageToast.show("Select Reservation first");
        sap.ui.getCore().byId("deleteResPopup").destroy();
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

          var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "YYYY-MM-ddTHH:MM:SS" }); //Time and date formatting
          var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: "PTHH'H'mm'M'ss'S'" });
          var date = dateFormat.format(sap.ui.getCore().byId("updateresdate").getDateValue());
          var startTime = timeFormat.format(sap.ui.getCore().byId("updatetime").getDateValue());
          var endTime = timeFormat.format(sap.ui.getCore().byId("updatetimeend").getDateValue());








          var oUpdateReservation = {
            Id: selectedId,
            TableId: selectedTableId,
            NumOfGuests: sap.ui.getCore().byId("noguest").getValue(),
            FreeText: sap.ui.getCore().byId("freetext").getValue(),
            Name: sap.ui.getCore().byId("name").getValue(),
            ResDate: date,
            ResTime: startTime,
            ResDuration: endTime
          };


          var updateId = parseInt(sap.ui.getCore().byId("id").getValue());
          var tableId = parseInt(sap.ui.getCore().byId("tableid").getValue());
          var uPath = "/ZYSS22_429_RESERSet(Id=" + updateId + "l,TableId=" + tableId + "l" + ")";

          oModel.update(uPath, oUpdateReservation, {
            success: function () {
              sap.m.MessageToast.show("Reservation successfully updated!");
              oModel.refresh();
              that.onClear();
              sap.ui.getCore().byId("updatePopup").destroy();
            },
            error: function () {
              sap.m.MessageToast.show("Error during reservation update");
            }
          });

        }
      });

      if (that.getView().byId("tableReservationId").getSelectedItem() != null) {
        var selectedId = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("Id");
        var selectedTableId = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("TableId");
        var selectedName = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("Name");
        var selectedGuests = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("NumOfGuests");
        var selectedResdate = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("ResDate");
        var selectedResstart = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("ResTime");
        var selectedResend = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("ResDuration");
        var selectedFreeText = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("FreeText");

      }

      var oDialog = new sap.m.Dialog("updatePopup", {
        title: "Update Table",
        contentWidth: "15%",
        buttons: [saveButton, cancelButton],
        content: [
          new sap.m.Label({
            text: "Selected Reservation ID"
          }), new sap.m.Input({
            maxLength: 3,
            id: "id",
            value: selectedId,
            editable: false
          }),
          new sap.m.Label({
            text: "Selected Table ID"
          }),
          new sap.m.Input({
            id: "tableid",
            value: selectedTableId,
            editable: false
          }),
          new sap.m.Label({
            text: "Name*"
          }), new sap.m.Input({
            maxLength: 20,
            id: "name",
            value: selectedName
          }),
          new sap.m.Label({
            text: "Number of Guests*"
          }), new sap.m.Input({
            id: "noguest",
            maxLength: 10,
            value: selectedGuests
          }),
          new sap.m.Label({
            text: "Reservation Date*"
          }), new sap.m.DatePicker({
            id: "updateresdate",
            value: selectedResdate
          }), new sap.m.Label({
            text: "Reservation Time Start*"
          }), new sap.m.TimePicker({
            id: "updatetime",
            displayFormat: "HH-mm",
            minutesStep: "30",
            placeholder: "e.g. 10:00"
          }), new sap.m.Label({
            text: "Reservation Time End*"
          }), new sap.m.TimePicker({
            id: "updatetimeend",
            minutesStep: "30",
            displayFormat: "HH-mm",
            placeholder: "e.g. 12:00"
          }),
          new sap.m.Label({
            text: "Leave a comment if you like"
          }),
          new sap.m.Input({
            id: "freetext",
            value: selectedFreeText
          })
        ]
      });

      if (that.getView().byId("tableReservationId").getSelectedItem() != null) {
        var selectedId = that.getView().byId("tableReservationId").getSelectedItem().getBindingContext().getProperty("Id");
        sap.ui.getCore().byId("updatePopup").open();
      } else {
        sap.m.MessageToast.show("Select Reservation first");
        sap.ui.getCore().byId("updatePopup").destroy();
      }
      sap.ui.getCore().byId("updatePopup").open();
    },

    onClear: function () {
      var serviceURL = this.getView().getModel("Settings").getProperty("/oDataUrl");
      var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
      this.getView().byId("tableReservationId").setModel(oModel);
    }
  });
});