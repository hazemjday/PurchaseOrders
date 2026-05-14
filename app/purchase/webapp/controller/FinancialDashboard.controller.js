sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox" 
], (Controller, Filter, FilterOperator, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("purchase.controller.FinancialDashboard", {

        onInit() {},

 onDownloadCSV() {
    const oTable   = this.byId("approvalTable1");
    const oBinding = oTable.getBinding("items");

    if (!oBinding) {
        MessageToast.show("Table not ready");
        return;
    }

    // Get contexts already loaded in the table
    const aContexts = oBinding.getCurrentContexts();

    if (!aContexts || !aContexts.length) {
        MessageToast.show("No data to export");
        return;
    }

    const aItems = aContexts.map(oCtx => oCtx.getObject());

    // CSV headers — must match your entity fields
    const aHeaders = [
        "PurchaseOrder",
        "Supplier",
        "PurchaseOrderDate",
        "TotalAmount",
        "Currency"
    ];

    // Build CSV rows
    let sCSV = aHeaders.join(",") + "\n";

    aItems.forEach(item => {
        const aRow = [
            item.PurchaseOrder     || "",
            item.Supplier          || "",
            item.PurchaseOrderDate || "",
            item.TotalAmount       || "",
            item.Currency          || ""
        ];
        sCSV += aRow.join(",") + "\n";
    });

    // Trigger download
    const oBlob = new Blob([sCSV], { type: "text/csv;charset=utf-8;" });
    const sUrl  = URL.createObjectURL(oBlob);
    const oLink = document.createElement("a");

    oLink.href     = sUrl;
    oLink.download = `approval_decisions_${new Date().toISOString().slice(0,10)}.csv`;
    oLink.click();

    URL.revokeObjectURL(sUrl);
    MessageToast.show("CSV downloaded ✅");
},
    });
});