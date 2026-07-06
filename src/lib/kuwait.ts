// Kuwait governorates and their areas — used by checkout and profile address forms
export const KUWAIT_AREAS: Record<string, string[]> = {
  'Al Asimah (Capital)': [
    'Sharq', 'Dasman', 'Mirqab', 'Qibla', 'Salhiya',
    'Dasma', 'Bneid Al-Gar', 'Mansouriya', 'Faiha', 'Shamiya', 'Rawda',
    'Adailiya', 'Nuzha', 'Qadsiya', "Da'iya", 'Abdullah Al-Salem', 'Surra',
    'Yarmouk', 'Jaber Al-Ahmad', 'Sulaibikhat', 'Doha',
    'Shuwaikh Industrial', 'Shuwaikh Port',
  ],
  'Hawalli': [
    'Hawalli', 'Salmiya', 'Rumaithiya', 'Jabriya', 'Bayan', 'Mishref',
    'Maidan Hawalli', 'Salwa', "Bida'a", 'Mubarak Al-Abdullah',
    'Shuhada', 'Heteen', 'Zahra', 'Salam', 'Siddeeq',
  ],
  'Farwaniya': [
    'Farwaniya', 'Jleeb Al-Shuyoukh', 'Khaitan', 'Ardiya', 'Andalous',
    'Ferdous', 'Sabah Al-Nasser', 'Rehab', 'Rabiya', 'Al-Rai', 'Al-Riggai',
    'Al-Dajeej', 'Al-Shadadiya', 'Al-Omariya', 'Abdullah Al-Mubarak', 'Ishbiliya',
  ],
  'Mubarak Al-Kabeer': [
    'Mubarak Al-Kabeer', 'Sabah Al-Salem', 'Adan', 'Qusour', 'Qurain',
    'Fintas', 'Masila', 'Abu Fiteira', 'Funaitees', 'Subhan',
  ],
  'Al Ahmadi': [
    'Ahmadi', 'Fahaheel', 'Mangaf', 'Mahboula', 'Abu Halifa', 'Fintas',
    'Egaila', 'Hadiya', 'Dhaher', 'Riqqa', 'Sabah Al-Ahmad', 'Al-Khiran',
    'Wafra', 'Jaber Al-Ali', 'Fahad Al-Ahmad',
  ],
  'Al Jahra': [
    'Jahra', 'Saad Al-Abdullah', 'Tima', 'Oyoun', 'Qasr', 'Naseem',
    'Waha', 'Naeem', 'Nuwaiseeb', 'Jahra Industrial Area', 'Kabad', 'Sulaibiya',
  ],
};
export const GOVERNORATES = Object.keys(KUWAIT_AREAS);
