export const name = "Banten";

export const cities = [
  "Kabupaten Pandeglang",
  "Kabupaten Lebak",
  "Kabupaten Tangerang",
  "Kabupaten Serang",
  "Kota Tangerang",
  "Kota Cilegon",
  "Kota Serang",
  "Kota Tangerang Selatan",
];

export const districtsByCity: Record<string, string[]> = {
  "Kabupaten Pandeglang": [
    "Pandeglang", "Majasari", "Cadasari", "Jiput", "Cimanuk", "Cipeucang",
    "Banjar", "Kaduhejo", "Mekarjaya", "Sukaresmi", "Mandalawangi", "Picung",
    "Bojong", "Saketi", "Menes", "Cikedal", "Pulosari", "Karangtanjung",
    "Koroncong", "Patia", "Sindangresmi", "Pagelaran", "Angsana", "Cimanggu",
    "Cigeulis", "Cibaliung", "Cikeusik", "Sobang", "Munjul", "Labuan",
    "Carita", "Banjarsari", "Sumur", "Panimbang", "Cibitung",
  ],
  "Kabupaten Lebak": [
    "Rangkasbitung", "Kalanganyar", "Maja", "Curugbitung", "Warunggunung",
    "Cibadak", "Cikulur", "Cileles", "Leuwidamar", "Muncang", "Sobang",
    "Gunung Kencana", "Bojongmanik", "Cirinten", "Cipanas", "Sajira",
    "Cimarga", "Malingping", "Wanasalam", "Panggarangan", "Banjarsari",
    "Cijaku", "Bayah", "Cilograng", "Lebakgedong", "Cihara", "Cigemblong",
    "Rompin",
  ],
  "Kabupaten Tangerang": [
    "Balaraja", "Jambe", "Cisoka", "Solear", "Tigaraksa", "Legok",
    "Pagedangan", "Cisauk", "Panongan", "Cikupa", "Curug", "Kelapa Dua",
    "Sindang Jaya", "Rajeg", "Sepatan", "Sepatan Timur", "Pakuhaji",
    "Teluknaga", "Kosambi", "Sukadiri", "Kresek", "Kronjo", "Kemiri",
    "Mauk", "Sukamulya", "Gunung Kaler", "Jayanti",
  ],
  "Kabupaten Serang": [
    "Serang", "Cipocok Jaya", "Kasemen", "Walantaka", "Curug", "Taktakan",
    "Kramatwatu", "Waringinkurung", "Bojonegara", "Pulo Ampel", "Anyar",
    "Cinangka", "Padarincang", "Ciomas", "Pabuaran", "Gunungsari",
    "Baros", "Petir", "Tunjung Teja", "Cikeusal", "Pamarayan", "Kragilan",
    "Jawilan", "Kopo", "Cikande", "Kibin", "Carenang", "Ciruas", "Pontang",
    "Tirtayasa", "Tanara",
  ],
  "Kota Tangerang": [
    "Tangerang", "Pinang", "Cipondoh", "Ciledug", "Karawaci", "Jatiuwung",
    "Cibodas", "Periuk", "Batuceper", "Neglasari", "Benda", "Karangtengah",
    "Larangan",
  ],
  "Kota Cilegon": [
    "Cilegon", "Jombang", "Citangkil", "Pulomerak", "Purwakarta", "Grogol",
    "Cibeber", "Ciwandan",
  ],
  "Kota Serang": [
    "Serang", "Cipocok Jaya", "Kasemen", "Walantaka", "Curug", "Taktakan",
  ],
  "Kota Tangerang Selatan": [
    "Serpong", "Serpong Utara", "Ciputat", "Ciputat Timur", "Pamulang",
    "Pondok Aren", "Setu",
  ],
};

export const postalCodesByCity: Record<string, string[]> = {
  "Kabupaten Pandeglang": ["42201", "42202", "42211", "42212", "42251", "42261", "42271", "42281", "42291"],
  "Kabupaten Lebak": ["42311", "42312", "42313", "42321", "42351", "42361", "42371", "42381", "42391", "42393"],
  "Kabupaten Tangerang": ["15610", "15710", "15720", "15730", "15810", "15820", "15821", "15830"],
  "Kabupaten Serang": ["42151", "42161", "42171", "42172", "42181", "42182", "42191"],
  "Kota Tangerang": ["15111", "15112", "15113", "15114", "15115", "15116", "15117", "15118", "15119"],
  "Kota Cilegon": ["42411", "42412", "42421", "42422", "42431", "42432", "42435", "42436", "42437", "42438"],
  "Kota Serang": ["42111", "42112", "42113", "42114", "42115", "42116", "42117", "42118", "42119"],
  "Kota Tangerang Selatan": ["15310", "15315", "15320", "15321", "15326", "15330", "15331", "15339", "15340", "15345", "15411", "15412", "15413", "15414", "15415", "15416", "15417", "15418", "15419"],
};
