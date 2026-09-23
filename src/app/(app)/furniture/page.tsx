import Link from "next/link";
import { getFurnitureData } from "@/lib/queries";
import { actualCost, estimatedSpendFor, detailPath, photosForDetail, inspirationForDetail } from "@/lib/derived";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FurniturePage() {
  const {
    houses,
    rooms,
    details,
    materialItems,
    lineItems,
    progressPhotos,
    progressPhotoDetails,
    boardImages,
    boardImageDetails,
    contentTypeByAssetId,
  } = await getFurnitureData();

  if (!details.length) {
    return (
      <div className="empty-state">
        Nothing tagged as furniture yet — check &ldquo;Furniture&rdquo; on a detail page to have it show up here,
        split out of the renovation budget.
      </div>
    );
  }

  const sorted = [...details].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="furniture-grid">
      {sorted.map((d) => {
        const act = actualCost(lineItems, d.id);
        const est = estimatedSpendFor(d, materialItems, act);
        const cost = act || est;

        // Best-available image: an "after" progress photo, else any progress
        // photo, else the first inspiration image — a furniture item rarely
        // has its own dedicated photo yet, so this falls back gracefully.
        const detailPhotos = photosForDetail(progressPhotos, progressPhotoDetails, d.id);
        const afterPhoto = detailPhotos.find((p) => p.phase === "after") || detailPhotos[0];
        const inspiration = inspirationForDetail(boardImages, boardImageDetails, d.id)[0];
        const isVideo = afterPhoto ? (contentTypeByAssetId[afterPhoto.assetId] || "").startsWith("video/") : false;
        const imgSrc = afterPhoto
          ? `/asset/${afterPhoto.assetId}`
          : inspiration
            ? inspiration.assetId
              ? `/asset/${inspiration.assetId}`
              : inspiration.sourceUrl
            : null;

        return (
          <Link key={d.id} href={`/detail/${d.id}`} className="furniture-card">
            {imgSrc ? (
              isVideo ? (
                <video src={imgSrc} className="furniture-thumb" muted />
              ) : (
                <img src={imgSrc} className="furniture-thumb" alt="" />
              )
            ) : (
              <div className="furniture-thumb">No photo</div>
            )}
            <div className="furniture-card-body">
              <div className="furniture-name">{d.name}</div>
              <div className="furniture-meta">{detailPath(houses, rooms, d)}</div>
              {cost ? <div className="furniture-cost">{money(cost)}</div> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
