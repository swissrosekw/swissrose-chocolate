export const KUWAIT_LOCATIONS = {
  "Al Asimah": ["Kuwait City", "Dasman", "Sharq", "Mirqab", "Salhiya", "Bneid Al Gar", "Dasma", "Khaldiya", "Qadsiya", "Kaifan", "Mansouriya", "Nuzha", "Faiha", "Shamiya", "Rawda", "Adiliya"],
  "Hawalli": ["Hawalli", "Salmiya", "Salwa", "Rumaithiya", "Bayan", "Mishref", "Jabriya", "Surra", "Hitteen", "Shuhada", "Siddiq", "Zahra"],
  "Al Farwaniyah": ["Farwaniya", "Jleeb Al-Shuyoukh", "Khaitan", "Firdous", "Ardiya", "Riggae", "Andalous", "Abdullah Al-Mubarak", "Omariya", "Rabiya"],
  "Al Ahmadi": ["Ahmadi", "Fahaheel", "Mangaf", "Mahboula", "Fintas", "Abu Halifa", "Sabahiya", "Riqqa", "Wafra", "Zoor"],
  "Mubarak Al-Kabeer": ["Mubarak Al-Kabeer", "Qurain", "Awaq Al Qurain", "Sabah Al Salem", "Funaitees", "Adan", "Qusour", "Abu Ftaira", "Messila"],
  "Al Jahra": ["Jahra", "Sulaibiya", "Qasr", "Amghara", "Nasseem", "Taima", "Oyoun", "Waha", "Abdaly"]
} as const;

export type Governorate = keyof typeof KUWAIT_LOCATIONS;
export type City = typeof KUWAIT_LOCATIONS[Governorate][number];
