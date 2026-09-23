import { getLookBookData } from "@/lib/queries";
import { HouseSwitcher } from "@/components/house-switcher";
import { LookbookView } from "./lookbook-view";

export const dynamic = "force-dynamic";

export default async function LookBookPage({
  searchParams,
}: {
  searchParams: Promise<{ house?: string }>;
}) {
  const data = await getLookBookData();

  if (!data.houses.length) {
    return (
      <div className="empty-state">
        Add a house first — Lookbook shows before/after photos and inspiration per house.
      </div>
    );
  }

  const { house: houseParam } = await searchParams;
  const activeHouseId = data.houses.some((h) => h.id === houseParam) ? houseParam! : data.houses[0].id;
  const switcher = <HouseSwitcher houses={data.houses} activeHouseId={activeHouseId} basePath="/lookbook" />;

  return (
    <>
      {switcher}
      <LookbookView
        houseId={activeHouseId}
        houses={data.houses}
        rooms={data.rooms}
        details={data.details}
        progressPhotos={data.progressPhotos}
        progressPhotoDetails={data.progressPhotoDetails}
        boardImages={data.boardImages}
        boardImageDetails={data.boardImageDetails}
        boardImageRooms={data.boardImageRooms}
        contentTypeByAssetId={data.contentTypeByAssetId}
      />
    </>
  );
}
