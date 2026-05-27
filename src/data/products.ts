const IMG = {
  spray: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/Insecticide-spray_k6fb1l",
  powder: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/insecticidal-powder_1_qgidhf",
  snake: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/Snake-Repellent-powder_rfwym0",
  led: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/100W-High-Brightness-LED-Light_q9qvnx",
  hex: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/hexazinone_jdngkg",
  fly: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/fly-catcher_gbolka",
  wrist: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/Mosquito-Repellent-Wristband_wvj0ye",
  solar200w: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/200w_solar_2k_aqvidy",
  magneticWindow: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/mosquito-window-net_wx8up8",
  kit4in1: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/4-1-kit_nzknir",
  kitComplete: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/complete-home-kit.jpeg",
  kitBeforeAfter: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/be-after-4-1.jpeg",
};

export type Category = "lighting" | "home-protection" | "farm-protection" | "fashion-design";

export interface Product {
  slug: string;
  name: string;
  price: number | null;
  originalPrice?: number;
  category: Category;
  image: string;
  images?: string[];
  imageVariants?: {
    thumbnail?: string;
    medium?: string;
    original?: string;
    webp?: string;
  };
  variants?: { id: string; label: string; price: number; originalPrice?: number }[];
  tagline: string;
  description: string;
  usage: string[];
  safety: string[];
  specs: { label: string; value: string }[];
  badge?: string;
}

export const categories: { id: Category; name: string; description: string }[] = [
  { id: "lighting", name: "Lighting", description: "Bright, durable lights for vendors and homes." },
  { id: "home-protection", name: "Home Protection", description: "Snake repellents, nets, wristbands and more." },
  { id: "farm-protection", name: "Farm Protection", description: "Trusted chemicals and farm protection products for productive fields." },
  { id: "fashion-design", name: "Fashion & Design", description: "Products coming soon — stylish, creative essentials for your brand." },
];

export const products: Product[] = [
  {
    slug: "insecticidal-spray",
    name: "Insecticidal Spray 500ml",
    price: 999,
    originalPrice: 1499,
    category: "farm-protection",
    image: IMG.spray,
    tagline: "Fast knockdown for cockroaches, bed bugs, ants & fleas.",
    description:
      "A powerful 500ml ready-to-use insecticide spray engineered for quick action against household pests. Low odor formula, surface-safe, and effective for weeks.",
    usage: [
      "Shake well before use.",
      "Spray 20–30cm from infested surfaces.",
      "Ventilate the area for 15 minutes after application.",
    ],
    safety: [
      "Keep out of reach of children and pets.",
      "Avoid contact with eyes and food surfaces.",
      "Do not inhale directly.",
    ],
    specs: [
      { label: "Volume", value: "500 ml" },
      { label: "Targets", value: "Cockroach, bed bug, ant, flea" },
      { label: "Format", value: "Trigger spray" },
    ],
    badge: "Best Seller",
  },
  {
    slug: "insecticidal-powder",
    name: "Insecticidal Powder Sachet",
    price: 80,
    originalPrice: 149,
    category: "farm-protection",
    image: IMG.powder,
    tagline: "Fipronil 0.3% — affordable, effective, single-use sachet.",
    description: "Pocket-sized 8g sachet of insecticidal powder. Place near pest hotspots for long-lasting effect.",
    usage: ["Sprinkle along cracks, corners, and entry points.", "Reapply every 2 weeks for best results."],
    safety: ["Wash hands after use.", "Keep away from food and children."],
    specs: [
      { label: "Net content", value: "8 g" },
      { label: "Active ingredient", value: "Fipronil 0.3%" },
    ],
  },
  {
    slug: "snake-repellent-powder",
    name: "Snake Repellent Powder",
    price: 1980,
    originalPrice: 3999,
    category: "home-protection",
    image: IMG.snake,
    variants: [
      { id: "500g", label: "500g", price: 2399, originalPrice: 3999 },
      { id: "1000g", label: "1000g", price: 3599, originalPrice: 7998 },
      { id: "1500g", label: "1500g", price: 5699, originalPrice: 11997 },
    ],
    tagline: "Single product with size variants for every property.",
    description:
      "Outdoor-use granular powder that creates a stable barrier around your home compound or farm. Weather-resistant.",
    usage: ["Apply a continuous 5cm-wide line around the perimeter.", "Reapply after heavy rain."],
    safety: ["For outdoor use only.", "Wear gloves when applying."],
    specs: [
      { label: "Use", value: "Outdoor / Perimeter" },
      { label: "Coverage", value: "Varies by size" },
    ],
  },
  {
    slug: "led-light-100w",
    name: "100W High Brightness LED Light",
    price: 1280,
    originalPrice: 1600,
    category: "lighting",
    image: IMG.led,
    tagline: "Rechargeable, USB, IP65 — built for night markets & vendors.",
    description:
      "A premium portable 100W LED bulb with built-in lithium battery, hook, USB charging, and waterproof construction.",
    usage: ["Charge via USB-C cable (included).", "Hang or place on flat surface."],
    safety: ["Do not submerge.", "Charge in a dry area."],
    specs: [
      { label: "Power", value: "100 W" },
      { label: "Battery", value: "Lithium-ion" },
      { label: "Rating", value: "IP65 Waterproof" },
    ],
    badge: "Top Rated",
  },
  {
    slug: "hexazinone-herbicide",
    name: "Hexazinone Herbicide 1kg",
    price: 2999,
    originalPrice: 3999,
    category: "farm-protection",
    image: IMG.hex,
    tagline: "Granule formulation, 5% Hexazinone — for weed-free fields.",
    description:
      "Reliable selective herbicide trusted by Kenyan farmers. Targets stubborn weeds with long residual control.",
    usage: ["Apply pre-emergence at recommended dose.", "Avoid application before heavy rain."],
    safety: ["Slightly toxic — wear PPE.", "Do not contaminate water sources."],
    specs: [
      { label: "Active ingredient", value: "Hexazinone 5%" },
      { label: "Formulation", value: "Granule" },
    ],
  },
  {
    slug: "automatic-fly-catcher",
    name: "Automatic Fly Catcher",
    price: 1,
    originalPrice: 200,
    category: "home-protection",
    image: IMG.fly,
    tagline: "No baiting, no poisons, no mess — just results.",
    description:
      "Sticky fly catcher roll with super lure. Ideal for kitchens, shops, and farms.",
    usage: ["Twist open and hang in fly-prone areas.", "Replace when fully covered."],
    safety: ["Keep away from hair and pets."],
    specs: [
      { label: "Type", value: "Sticky lure roll" },
    ],
  },
  {
    slug: "mosquito-window-net",
    name: "Mosquito Window Net",
    price: 599,
    originalPrice: 999,
    category: "home-protection",
    image: IMG.magneticWindow,
    tagline: "Breathable barrier — keep mosquitoes out, fresh air in.",
    description: "Adhesive-mounted mosquito net for windows. Cuttable to size.",
    usage: ["Clean window frame, attach adhesive strips, press net firmly."],
    safety: ["Indoor use."],
    specs: [{ label: "Size", value: "150 × 130 cm" }],
  },
  {
    slug: "solar-ceiling-light-200w",
    name: "200W Solar Ceiling Light",
    price: 2400,
    originalPrice: 2800,
    category: "lighting",
    image: IMG.solar200w,
    tagline: "Bright, reliable, eco-friendly — power from the sun.",
    description: "200W solar-powered ceiling light with 12000mAh battery, motion sensor, and remote control. Perfect for homes, farms, and off-grid areas.",
    usage: ["Mount on ceiling with included brackets.", "Charge in direct sunlight for 6-8 hours.", "Use remote control to adjust brightness."],
    safety: ["Do not submerge in water.", "Install in dry location."],
    specs: [
      { label: "Power", value: "200 W" },
      { label: "Battery", value: "12000 mAh" },
      { label: "Lighting time", value: "Up to 12 hours" },
      { label: "Features", value: "Motion sensor, remote control" },
    ],
    badge: "Eco-Friendly",
  },
  {
    slug: "mosquito-repellent-wristband",
    name: "Mosquito Repellent Wristband",
    price: 199,
    originalPrice: 299,
    category: "home-protection",
    image: IMG.wrist,
    tagline: "DEET-free wearable protection — great for kids and travel.",
    description: "Comfortable silicone wristband infused with natural repellents. Up to 240 hours per band.",
    usage: ["Wear on wrist or ankle.", "Store in sealed pouch when not in use."],
    safety: ["Skin-safe; remove if irritation occurs."],
    specs: [{ label: "Duration", value: "Up to 240 h" }],
  },
  {
    slug: "4-in-1-home-pest-control-kit",
    name: "4-in-1 Home Pest Control Kit",
    price: 3599,
    originalPrice: 6232,
    category: "home-protection",
    image: IMG.kit4in1,
    images: [IMG.kit4in1, IMG.kitComplete, IMG.kitBeforeAfter],
    tagline: "Complete home protection — spray, powder, repellent & traps.",
    description: "Comprehensive pest control kit with insecticidal spray, powder, snake repellent, and fly catchers. Everything you need for a pest-free home.",
    usage: [
      "Use spray for immediate knockdown.",
      "Apply powder in cracks and corners.",
      "Sprinkle repellent around perimeter.",
      "Hang fly catchers in problem areas.",
    ],
    safety: [
      "Keep out of reach of children and pets.",
      "Wear gloves when applying powders.",
      "Ventilate areas after spraying.",
    ],
    specs: [
      { label: "Includes", value: "Spray, powder, repellent, fly catchers" },
      { label: "Coverage", value: "Average 3-bedroom home" },
      { label: "Duration", value: "Up to 3 months" },
    ],
    badge: "Complete Solution",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const formatKES = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
