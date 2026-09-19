import Link from "next/link";
import { getLookBookData } from "@/lib/queries";
import { HouseSwitcher } from "@/components/house-switcher";
import type {
  details as detailsTable,
  progressPhotos as progressPhotosTable,
  boardImages as boardImagesTable,
} from "@/db/schema";

export const dynamic = "force-dynamic";

type Detail = typeof detailsTable.$inferSelect;
type ProgressPhoto = typeof progressPhotosTable.$inferSelect;
type BoardImage = typeof boardImagesTable.$inferSelect;

const PHASES = ["before", "during", "after"] as const;
const PHASE_LABEL: Record<string, string> = { before: "Before", during: "During", after: "After" };

export default async function LookBookPage({
  searchParams,
}: {
  searchParams: Promise<{ house?: string }>;
}) {
  const {
    houses,
    rooms: allRooms,
    details: allDetails,
    progressPhotos,
    boardImages,
    contentTypeByAssetId,
  } = await getLookBookData();

  if (!houses.length) {
    return (
      <div className="empty-state">
        <div className="big-emoji">📷</div>
        Add a house first — Lookbook shows before/after photos per house.
      </div>
    );
  }

  const { house: houseParam } = await searchParams;
  const activeHouseId = houses.some((h) => h.id === houseParam) ? houseParam! : houses[0].id;
  const activeHouse = houses.find((h) => h.id === activeHouseId)!;
  const rooms = allRooms.filter((r) => r.houseId === activeHouseId);
  const switcher = <HouseSwitcher houses={houses} activeHouseId={activeHouseId} basePath="/lookbook" />;

  const entries: { detail: Detail; photos: ProgressPhoto[]; inspiration: BoardImage[] }[] = allDetails
    .filter((d) => d.houseId === activeHouseId)
    .map((detail) => ({
      detail,
      photos: progressPhotos.filter((p) => p.detailId === detail.id),
      inspiration: boardImages.filter((b) => b.detailId === detail.id),
    }))
    // A detail with only mood-board/inspiration images and no progress
    // photos yet still belongs here — it just won't have Before/After/
    // During columns until real photos get added.
    .filter((entry) => entry.photos.length > 0 || entry.inspiration.length > 0)
    .sort((a, b) => a.detail.name.localeCompare(b.detail.name));

  if (!entries.length) {
    return (
      <>
        {switcher}
        <div className="empty-state">
          <div className="big-emoji">📷</div>
          No photos or inspiration in {activeHouse.name} yet.
          <br />
          Add progress photos or mood board images on a Detail page and they&rsquo;ll show up here.
        </div>
      </>
    );
  }

  return (
    <>
      {switcher}
      {entries.map(({ detail, photos, inspiration }) => {
        const room = detail.roomId ? rooms.find((r) => r.id === detail.roomId) : null;
        return (
          <div className="card lookbook-card" key={detail.id}>
            <Link href={`/detail/${detail.id}`} className="lookbook-card-head">
              <span className="lookbook-name">{detail.name}</span>
              <span className="breadcrumb">{room ? room.name : "Not in a specific room"}</span>
            </Link>
            {photos.length ? (
              <div className="lookbook-cols">
                {PHASES.map((phase) => {
                  const phasePhotos = photos.filter((p) => p.phase === phase);
                  if (!phasePhotos.length) return null;
                  return (
                    <div key={phase}>
                      <div className="lookbook-col-title">{PHASE_LABEL[phase]}</div>
                      <div className="lookbook-col-photos">
                        {phasePhotos.map((p) => {
                          const isVideo = (contentTypeByAssetId[p.assetId] || "").startsWith("video/");
                          return (
                            <a
                              key={p.id}
                              className="lookbook-thumb-link"
                              href={`/asset/${p.assetId}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {isVideo ? (
                                <video src={`/asset/${p.assetId}`} className="lookbook-thumb" muted />
                              ) : (
                                <img src={`/asset/${p.assetId}`} className="lookbook-thumb" alt="" />
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
            {inspiration.length ? (
              <details className="lookbook-inspiration">
                <summary>✨ Inspiration ({inspiration.length})</summary>
                <div className="board-grid">
                  {inspiration.map((b) => {
                    const href = b.assetId ? `/asset/${b.assetId}` : b.sourceUrl || "#";
                    return (
                      <a key={b.id} href={href} target="_blank" rel="noreferrer" className="board-item">
                        <img
                          src={b.assetId ? `/asset/${b.assetId}` : b.sourceUrl || ""}
                          className="board-thumb"
                          alt=""
                        />
                      </a>
                    );
                  })}
                </div>
              </details>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
