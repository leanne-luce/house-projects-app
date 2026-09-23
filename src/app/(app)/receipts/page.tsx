import { getReceiptsTabData } from "@/lib/queries";
import { ReceiptsList } from "./receipts-list";
import { HouseSwitcher } from "@/components/house-switcher";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ house?: string }>;
}) {
  const data = await getReceiptsTabData();

  if (!data.houses.length) {
    return (
      <div className="empty-state">
        Add a house first — Receipts are tracked per house.
      </div>
    );
  }

  const { house: houseParam } = await searchParams;
  const activeHouseId = data.houses.some((h) => h.id === houseParam) ? houseParam! : data.houses[0].id;

  return (
    <>
      <HouseSwitcher houses={data.houses} activeHouseId={activeHouseId} basePath="/receipts" />
      <ReceiptsList
        houseId={activeHouseId}
        receipts={data.receipts.filter((r) => r.houseId === activeHouseId)}
        receiptLineItems={data.receiptLineItems}
        details={data.details.filter((d) => d.houseId === activeHouseId)}
        rooms={data.rooms}
        contentTypeByAssetId={data.contentTypeByAssetId}
      />
    </>
  );
}
