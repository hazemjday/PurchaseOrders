using { CE_PURCHASEORDER_0001 as external } from './external/CE_PURCHASEORDER_0001';
using { po.approval as db } from '../db/schema';
service POService {
  @readonly
  entity PurchaseOrders     as projection on external.PurchaseOrder;

  @readonly
  entity PurchaseOrderItems as projection on external.PurchaseOrderItem;

  entity ApprovalDecisions  as projection on db.ApprovalDecision;
}