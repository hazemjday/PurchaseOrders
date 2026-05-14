sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox" 
], (Controller, Filter, FilterOperator, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("purchase.controller.Purchase", {

        onInit() {
            this._loadPurchaseOrders();
        },

        // ── Read list of POs ─────────────────────────────────────
_loadPurchaseOrders() {
            const oModel = this.getOwnerComponent().getModel();
            const oListBinding = oModel.bindList("/PurchaseOrders");

            oListBinding.requestContexts(0, 30).then((aContexts) => {
                const aOrders = aContexts.map(oCtx => oCtx.getObject());
                console.log("Purchase Orders:", aOrders);

                this.getView().setModel(
                    new JSONModel({ orders: aOrders }),
                    "orders"
                );
                MessageToast.show(`${aOrders.length} Purchase Orders loaded`);

            }).catch((oError) => {
                console.error("Failed to load POs:", oError.message);
                MessageToast.show("Failed to load Purchase Orders");
            });
        },

onPOPress: function (oEvent) {
    // 1. Get selected row context
    const oContext = oEvent.getSource().getBindingContext("orders");

    // 2. Extract PO number
    const sPO = oContext.getProperty("PurchaseOrder");
    this._oCurrentPO = oContext.getObject();
    console.log("Clicked PO:", sPO);

    // 3. Load items for this PO
    this._loadItems(sPO);

    // 4. Open dialog
    this._openDialog();
},

_loadItems: function (sPO) {

    const oModel = this.getOwnerComponent().getModel();

    const oBinding = oModel.bindList("/PurchaseOrderItems", null, null, [
        new sap.ui.model.Filter("PurchaseOrder", "EQ", sPO)
    ]);

    oBinding.requestContexts().then((aContexts) => {
        const aItems = aContexts.map(c => c.getObject());
        const fTotalGross = aItems.reduce((sum, item) => {
    return sum + item.GrossAmount;
}, 0);

    const oSummaryModel = new sap.ui.model.json.JSONModel({
      totalGrossAmount: fTotalGross
     });

       this.getView().setModel(oSummaryModel, "summary");
        console.log("Items:", aItems);
        const oJSON = new sap.ui.model.json.JSONModel({ items: aItems });
        this.getView().setModel(oJSON, "items");

    });
},

_openDialog: function () {

    if (!this._oDialog) {
        this._oDialog = sap.ui.xmlfragment(
            "purchase.view.POItemsDialog",
            this
        );
        this.getView().addDependent(this._oDialog);
    }

    this._oDialog.open();
},

onCloseDialog: function () {

    // Reset items model
    const oItemsModel = this.getView().getModel("items");
    if (oItemsModel) {
        oItemsModel.setData({ items: [] });
    }

    // Reset summary model (total)
    const oSummaryModel = this.getView().getModel("summary");
    if (oSummaryModel) {
        oSummaryModel.setData({ totalGrossAmount: 0 });
    }

    // Close dialog
    this._oDialog.close();
},

onConfirmPO() {
    const oPO = this._oCurrentPO;

    if (!oPO) {
        MessageToast.show("No PO selected");
        return;
    }

    // Get total from summary model
    const fTotalAmount = this.getView()
        .getModel("summary")
        .getProperty("/totalGrossAmount");

    // Get optional description from TextArea
    const oDescriptionInput = sap.ui.getCore().byId("descriptionInput");
    const sDescription = oDescriptionInput ? oDescriptionInput.getValue() : "";

    MessageBox.confirm(
        `Confirm acceptance of PO ${oPO.PurchaseOrder}?\n\n` +
        `Supplier:  ${oPO.Supplier}\n` +
        `Date:      ${oPO.PurchaseOrderDate}\n` +
        `Amount:    ${fTotalAmount} USD`,
        {
            title: "Confirm Purchase Order",
            emphasizedAction: MessageBox.Action.OK,
            onClose: async (sAction) => {
                if (sAction !== MessageBox.Action.OK) return;

                try {
                    const oModel = this.getOwnerComponent().getModel();

                    // Direct POST to ApprovalDecisions entity — no action needed
                    const oListBinding = oModel.bindList("/ApprovalDecisions");

                    await oListBinding.create({
                        PurchaseOrder:     oPO.PurchaseOrder,
                        TotalAmount:       fTotalAmount,
                        Supplier:          oPO.Supplier,
                        PurchaseOrderDate: oPO.PurchaseOrderDate,
                        Currency:          "USD",
                        Result:            "Accepted",
                        Description:       sDescription
                    });

                    MessageToast.show(`PO ${oPO.PurchaseOrder} confirmed`);
                    this.onCloseDialog();
                    this._loadPurchaseOrders();

                } catch (err) {
                    console.error("Confirm failed:", err.message);
                    MessageBox.error(`Failed to confirm PO:\n${err.message}`);
                }
            }
        }
    );
},



onRejectPO() {
    const oPO = this._oCurrentPO;

    if (!oPO) {
        MessageToast.show("No PO selected");
        return;
    }

    // Get total from summary model
    const fTotalAmount = this.getView()
        .getModel("summary")
        .getProperty("/totalGrossAmount");

    // Get optional description from TextArea
    const oDescriptionInput = sap.ui.getCore().byId("descriptionInput");
    const sDescription = oDescriptionInput ? oDescriptionInput.getValue() : "";

    MessageBox.confirm(
        `Confirm rejection of PO ${oPO.PurchaseOrder}?\n\n` +
        `Supplier:  ${oPO.Supplier}\n` +
        `Date:      ${oPO.PurchaseOrderDate}\n` +
        `Amount:    ${fTotalAmount} USD`,
        {
            title: "Confirm Purchase Order",
            emphasizedAction: MessageBox.Action.OK,
            onClose: async (sAction) => {
                if (sAction !== MessageBox.Action.OK) return;

                try {
                    const oModel = this.getOwnerComponent().getModel();

                    // Direct POST to ApprovalDecisions entity — no action needed
                    const oListBinding = oModel.bindList("/ApprovalDecisions");

                    await oListBinding.create({
                        PurchaseOrder:     oPO.PurchaseOrder,
                        TotalAmount:       fTotalAmount,
                        Supplier:          oPO.Supplier,
                        PurchaseOrderDate: oPO.PurchaseOrderDate,
                        Currency:          "USD",
                        Result:            "Rejected",
                        Description:       sDescription
                    });

                    MessageToast.show(`PO ${oPO.PurchaseOrder} rejected`);
                    this.onCloseDialog();
                    this._loadPurchaseOrders();

                } catch (err) {
                    console.error("Reject failed:", err.message);
                    MessageBox.error(`Failed to reject PO:\n${err.message}`);
                }
            }
        }
    );
},


onNavigateToResults: function () {
    const oRouter = this.getOwnerComponent().getRouter();
    oRouter.navTo("RouteOrdersResult");
},

onNavigateToFinance: function () {
    const oRouter = this.getOwnerComponent().getRouter();
    oRouter.navTo("RouteFinancialDashboard");
}

    });
});