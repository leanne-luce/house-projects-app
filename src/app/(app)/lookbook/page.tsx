import Link from "next/link";
import { getLookBookData } from "@/lib/queries";
import { detailPath } from "@/lib/derived";
import type { details as detailsTable, progressPhotos as progressPhotosTable } from "@/db/schema";

export const dynamic = "force-dynamic";

type Detail = typeof detailsTable.$inferSelect;
type ProgressPhoto = typeof progressPhotosTable.$inferSelect;

const PHASES = ["before", "during", "after"] as const;
const PHASE_LABEL: Record<string, string> = { before: "Before", during: "During", after: "After" };

export default async function LookBookPage() {
  const { houses, rooms, details, progressPhotos, contentTypeByAssetId } = await getLookBookData();

  const entries: { detail: Detail; photos: ProgressPhoto[] }[] = details
    .map((detail) => ({ detail, photos: progressPhotos.filter((p) => p.detailId === detail.id) }))
    .filter((entry) => entry.photos.length > 0);

  if (!entries.length) {
    return (
      <div className="empty-state">
        <div className="big-emoji">📷</div>
        No before/after photos yet.
        <br />
        Add progress photos on a Detail page and they&rsquo;ll show up here.
      </div>
    );
  }

  const byHouse = new Map<string, typeof entries>();
  for (const entry of entries) {
    const key = entry.detail.houseId;
    if (!byHouse.has(key)) byHouse.set(key, []);
    byHouse.get(key)!.push(entry);
  }

  return (
    <>
      {houses
        .filter((h) => byHouse.has(h.id))
        .map((h) => (
          <div key={h.id}>
            <div className="lookbook-house">{h.name}</div>
            {byHouse
              .get(h.id)!
              .sort((a, b) => a.detail.name.localeCompare(b.detail.name))
              .map(({ detail, photos }) => (
                <div className="card lookbook-card" key={detail.id}>
                  <Link href={`/detail/${detail.id}`} className="lookbook-card-head">
                    <span className="lookbook-name">{detail.name}</span>
                    <span className="breadcrumb">{detailPath(houses, rooms, detail)}</span>
                  </Link>
                  <div className="lookbook-cols">
                    {PHASES.map((phase) => {
                      const phasePhotos = photos.filter((p) => p.phase === phase);
                      if (!phasePhotos.length) return null;
                      return (
                        <div key={phase}>
                          <div className="lookbook-col-title">{PHASE_LABEL[phase]}</div>
                          <div className="lookbook-col-photos">
                            {phasePhotos.map((p) => {
                              const isVideo = (contentTypeByAssetId[p.assetId] || "").startsWith(
                                "video/"
                              );
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
                </div>
              ))}
          </div>
        ))}
    </>
  );
}
