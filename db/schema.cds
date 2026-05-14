namespace po.approval;

entity ApprovalDecision {
  key PurchaseOrder     : String(10);
      // Financial info (from S/4HANA at decision time)
      TotalAmount       : Decimal(15,2);
      Supplier          : String(10) not null;
      PurchaseOrderDate : Date;
      Currency          : String(5);

      // Decision info
      Result            : String(10) enum {
        Accepted;
        Cancelled;
      };
      Description       : String(200); // optional

      // Audi
      DecidedAt         : DateTime    @cds.on.insert: $now;
}