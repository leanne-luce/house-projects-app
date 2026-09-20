window.CLUB_LUCE_DATA = {
  houses: [
    { id: "rosewood", name: "Rosewood", address: "41 Rosewood Lane", purchasePrice: 412000 },
    { id: "cabin", name: "The Cabin", address: "Tatton Forest", purchasePrice: 96000 }
  ],
  rooms: [
    { id: "kitchen", houseId: "rosewood", name: "Kitchen" },
    { id: "hall", houseId: "rosewood", name: "Entry hall" },
    { id: "studio", houseId: "rosewood", name: "Studio" },
    { id: "porch", houseId: "cabin", name: "Porch" }
  ],
  details: [
    { id: "d1", houseId: "rosewood", roomId: "kitchen", name: "Backsplash tile", status: "in_progress", timeframe: "Sep '26", est: 800, act: 940, checklist: [true, true, false, false, false] },
    { id: "d2", houseId: "rosewood", roomId: "kitchen", name: "Open shelving", status: "not_started", timeframe: "Oct '26", est: 220, act: 0, checklist: [false, false] },
    { id: "d3", houseId: "rosewood", roomId: "hall", name: "Stair runner", status: "on_hold", timeframe: "Q1 '27", est: 640, act: 120, checklist: [true, false, false] },
    { id: "d4", houseId: "rosewood", roomId: "studio", name: "Paint — lime wash", status: "done", timeframe: "Aug '26", est: 300, act: 265, checklist: [true, true, true] },
    { id: "d5", houseId: "rosewood", roomId: "studio", name: "Pegboard wall", status: "in_progress", timeframe: "Sep '26", est: 150, act: 88, checklist: [true, false] },
    { id: "d6", houseId: "cabin", roomId: "porch", name: "Re-hang the door", status: "not_started", timeframe: "Someday", est: 0, act: 0, checklist: [] }
  ],
  materials: [
    { id: "m1", detailId: "d1", description: "Zellige tile, 4×4, oatmeal", status: "need_to_source", qty: "38 sq ft" },
    { id: "m2", detailId: "d1", description: "Tile adhesive + grout", status: "ordered", qty: "2 bags" },
    { id: "m3", detailId: "d3", description: "Sisal runner, 27in", status: "need_to_source", qty: "14 ft" },
    { id: "m4", detailId: "d5", description: "Birch ply, 12mm", status: "have", qty: "1 sheet" }
  ],
  spend: [
    { id: "s1", detailId: "d1", description: "Zellige tile — deposit", vendor: "Otto Tiles", amount: 620 },
    { id: "s2", detailId: "d1", description: "Adhesive, grout, spacers", vendor: "Lowe's", amount: 320 },
    { id: "s3", detailId: "d3", description: "Runner samples", vendor: "Sisal Co", amount: 120 },
    { id: "s4", detailId: "d5", description: "Birch ply sheet", vendor: "Timber Yard", amount: 88 }
  ],
  inbox: [
    { id: "i1", text: "Tile grout colour — try the warm grey, not white", time: "Today, 9:14", photo: false },
    { id: "i2", text: "", time: "Yesterday, 18:02", photo: true },
    { id: "i3", text: "https://ottotiles.co.uk/zellige-oatmeal", time: "Yesterday, 11:47", photo: false }
  ]
};
