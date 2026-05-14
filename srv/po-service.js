const cds = require('@sap/cds');

module.exports = class POService extends cds.ApplicationService {

  async init() {

    const S4 = await cds.connect.to('CE_PURCHASEORDER_0001');

    // ── Proxy S/4HANA data ─────────────────────────
    this.on('READ', 'PurchaseOrders', (req) => {
      return S4.run(req.query);
    });

    this.on('READ', 'PurchaseOrderItems', (req) => {
      return S4.run(req.query);
    });

    // ── Validation BEFORE CREATE ───────────────────
    this.before('CREATE', 'ApprovalDecisions', async (req) => {

      const { PurchaseOrder } = req.data;
      const existing = await SELECT.one
        .from('po.approval.ApprovalDecision')
        .where({ PurchaseOrder });
      if (existing) {
        req.error(409, `Purchase Order ${PurchaseOrder} already exists`);
      }
    });

    return super.init();
  }
};