const adjectives = [
  "Silent", "Hidden", "Quiet", "Shadow", "Mystic", "Clever", "Swift", "Brave",
  "Calm", "Bold", "Keen", "Wise", "Nimble", "Stealth", "Bright", "Dark",
  "Amber", "Copper", "Frosted", "Gilded", "Hollow", "Ivory", "Jade", "Lunar",
  "Marble", "Noble", "Onyx", "Prism", "Rustic", "Sapphire", "Tidal", "Velvet",
];

const animals = [
  "Tiger", "Wolf", "Falcon", "Raven", "Lynx", "Otter", "Crane", "Viper",
  "Badger", "Cobra", "Eagle", "Fox", "Hawk", "Ibis", "Jaguar", "Kestrel",
  "Lemur", "Mink", "Newt", "Osprey", "Puma", "Quail", "Robin", "Stag",
  "Tapir", "Urial", "Vole", "Weasel", "Xerus", "Yak", "Zebra", "Moose",
];

export function generateAnonName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}${animal}${num}`;
}
