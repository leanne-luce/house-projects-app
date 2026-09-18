import { getReceiptsTabData } from "@/lib/queries";
import { ReceiptsList } from "./receipts-list";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const data = await getReceiptsTabData();
  return (
    <ReceiptsList
      receipts={data.receipts}
      receiptLineItems={data.receiptLineItems}
      details={data.details}
      houses={data.houses}
      rooms={data.rooms}
    />
  );
}
