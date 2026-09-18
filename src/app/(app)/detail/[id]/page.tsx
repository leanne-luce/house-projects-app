import { notFound } from "next/navigation";
import { getDetailPageData } from "@/lib/queries";
import { DetailPageClient } from "./detail-page";

export const dynamic = "force-dynamic";

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDetailPageData(id);
  if (!data.detail) notFound();

  return (
    <DetailPageClient
      detail={data.detail}
      houses={data.allHouses}
      rooms={data.rooms}
      materialItems={data.materialItems}
      lineItems={data.lineItems}
      checklistItems={data.checklistItems}
      filedInbox={data.filedInbox}
      boardImages={data.boardImages}
      paletteSwatches={data.paletteSwatches}
      progressPhotos={data.progressPhotos}
      pendingReceiptItems={data.pendingReceiptItems}
      receiptDates={data.receiptDates}
    />
  );
}
