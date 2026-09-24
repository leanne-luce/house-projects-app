import { getHousesTreeData } from "@/lib/queries";
import { HouseTree } from "./house-tree";

export const dynamic = "force-dynamic";

export default async function HousesPage() {
  const data = await getHousesTreeData();
  return (
    <HouseTree
      houses={data.houses}
      rooms={data.rooms}
      details={data.details}
      materialItems={data.materialItems}
      lineItems={data.lineItems}
      paletteColors={data.paletteColors}
    />
  );
}
