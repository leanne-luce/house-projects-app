import { getInboxTabData } from "@/lib/queries";
import { InboxList } from "./inbox-list";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const data = await getInboxTabData();
  return (
    <InboxList
      unfiled={data.unfiled}
      details={data.details}
      houses={data.houses}
      rooms={data.rooms}
      contentTypeByAssetId={data.contentTypeByAssetId}
    />
  );
}
