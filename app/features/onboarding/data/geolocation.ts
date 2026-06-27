// Data geolocation lengkap untuk 38 provinsi di Indonesia

export const PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bengkulu",
  "Lampung",
  "Kepulauan Bangka Belitung",
  "Kepulauan Riau",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya"
] as const;

// Data kota/kabupaten berdasarkan provinsi
export const citiesByProvince: Record<string, string[]> = {
  "Aceh": [
    "Kota Banda Aceh", "Kota Sabang", "Kota Langsa", "Kota Lhokseumawe", "Kota Subulussalam",
    "Kabupaten Aceh Selatan", "Kabupaten Aceh Tenggara", "Kabupaten Aceh Timur", "Kabupaten Aceh Tengah",
    "Kabupaten Aceh Barat", "Kabupaten Aceh Besar", "Kabupaten Pidie", "Kabupaten Bireuen",
    "Kabupaten Aceh Utara", "Kabupaten Aceh Barat Daya", "Kabupaten Gayo Lues", "Kabupaten Aceh Tamiang",
    "Kabupaten Nagan Raya", "Kabupaten Aceh Jaya", "Kabupaten Simeulue"
  ],
  "Sumatera Utara": [
    "Kota Medan", "Kota Pematangsiantar", "Kota Sibolga", "Kota Tanjungbalai", "Kota Binjai",
    "Kota Tebing Tinggi", "Kota Padangsidimpuan", "Kota Gunungsitoli", "Kabupaten Deli Serdang",
    "Kabupaten Langkat", "Kabupaten Karo", "Kabupaten Simalungun", "Kabupaten Dairi", "Kabupaten Toba Samosir",
    "Kabupaten Mandailing Natal", "Kabupaten Nias", "Kabupaten Nias Selatan", "Kabupaten Pakpak Bharat",
    "Kabupaten Humbang Hasundutan", "Kabupaten Samosir", "Kabupaten Serdang Bedagai", "Kabupaten Batu Bara",
    "Kabupaten Padang Lawas Utara", "Kabupaten Padang Lawas", "Kabupaten Labuhanbatu", "Kabupaten Labuhanbatu Selatan",
    "Kabupaten Labuhanbatu Utara", "Kabupaten Nias Barat", "Kabupaten Nias Utara"
  ],
  "Sumatera Barat": [
    "Kota Padang", "Kota Solok", "Kota Sawahlunto", "Kota Padang Panjang", "Kota Bukittinggi",
    "Kota Payakumbuh", "Kota Pariaman", "Kabupaten Pesisir Selatan", "Kabupaten Solok", "Kabupaten Sijunjung",
    "Kabupaten Tanah Datar", "Kabupaten Padang Pariaman", "Kabupaten Agam", "Kabupaten Lima Puluh Kota",
    "Kabupaten Pasaman", "Kabupaten Pasaman Barat", "Kabupaten Kepulauan Mentawai", "Kabupaten Dharmasraya",
    "Kabupaten Solok Selatan"
  ],
  "Riau": [
    "Kota Pekanbaru", "Kota Dumai", "Kabupaten Kampar", "Kabupaten Indragiri Hulu", "Kabupaten Indragiri Hilir",
    "Kabupaten Pelalawan", "Kabupaten Siak", "Kabupaten Kuantan Singingi", "Kabupaten Kepulauan Meranti",
    "Kabupaten Rokan Hulu", "Kabupaten Rokan Hilir", "Kabupaten Bengkalis"
  ],
  "Jambi": [
    "Kota Jambi", "Kabupaten Kerinci", "Kabupaten Merangin", "Kabupaten Sarolangun", "Kabupaten Batanghari",
    "Kabupaten Muaro Jambi", "Kabupaten Tanjung Jabung Timur", "Kabupaten Tanjung Jabung Barat",
    "Kabupaten Tebo", "Kabupaten Bungo"
  ],
  "Sumatera Selatan": [
    "Kota Palembang", "Kota Pagar Alam", "Kota Lubuklinggau", "Kota Prabumulih", "Kabupaten Musi Rawas",
    "Kabupaten Musi Banyuasin", "Kabupaten Banyuasin", "Kabupaten Ogan Komering Ilir", "Kabupaten Ogan Komering Ulu",
    "Kabupaten Ogan Ilir", "Kabupaten Empat Lawang", "Kabupaten Penukal Abab Lematang Ilir",
    "Kabupaten Musi Rawas Utara", "Kabupaten Ogan Komering Ulu Selatan", "Kabupaten Ogan Komering Ulu Timur"
  ],
  "Bengkulu": [
    "Kota Bengkulu", "Kabupaten Bengkulu Selatan", "Kabupaten Rejang Lebong", "Kabupaten Bengkulu Utara",
    "Kabupaten Kaur", "Kabupaten Seluma", "Kabupaten Mukomuko", "Kabupaten Lebong", "Kabupaten Kepahiang",
    "Kabupaten Bengkulu Tengah"
  ],
  "Lampung": [
    "Kota Bandar Lampung", "Kota Metro", "Kabupaten Lampung Selatan", "Kabupaten Lampung Tengah",
    "Kabupaten Lampung Utara", "Kabupaten Lampung Barat", "Kabupaten Tanggamus", "Kabupaten Tulang Bawang",
    "Kabupaten Tulang Bawang Barat", "Kabupaten Mesuji", "Kabupaten Pringsewu", "Kabupaten Way Kanan",
    "Kabupaten Lampung Timur", "Kabupaten Pesawaran", "Kabupaten Pesisir Barat"
  ],
  "Kepulauan Bangka Belitung": [
    "Kota Pangkal Pinang", "Kabupaten Bangka", "Kabupaten Belitung", "Kabupaten Bangka Barat",
    "Kabupaten Bangka Tengah", "Kabupaten Bangka Selatan", "Kabupaten Belitung Timur"
  ],
  "Kepulauan Riau": [
    "Kota Batam", "Kota Tanjung Pinang", "Kabupaten Bintan", "Kabupaten Karimun", "Kabupaten Natuna",
    "Kabupaten Lingga", "Kabupaten Kepulauan Anambas"
  ],
  "DKI Jakarta": [
    "Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Kepulauan Seribu"
  ],
  "Jawa Barat": [
    "Kota Bandung", "Kota Bekasi", "Kota Bogor", "Kota Cimahi", "Kota Cirebon", "Kota Depok", "Kota Sukabumi",
    "Kota Tasikmalaya", "Kabupaten Bandung", "Kabupaten Bandung Barat", "Kabupaten Bekasi", "Kabupaten Bogor",
    "Kabupaten Ciamis", "Kabupaten Cianjur", "Kabupaten Cirebon", "Kabupaten Garut", "Kabupaten Indramayu",
    "Kabupaten Karawang", "Kabupaten Kuningan", "Kabupaten Majalengka", "Kabupaten Pangandaran",
    "Kabupaten Purwakarta", "Kabupaten Subang", "Kabupaten Sukabumi", "Kabupaten Sumedang", "Kabupaten Tasikmalaya"
  ],
  "Jawa Tengah": [
    "Kota Semarang", "Kota Salatiga", "Kota Surakarta", "Kota Pekalongan", "Kota Tegal", "Kota Magelang",
    "Kabupaten Semarang", "Kabupaten Kendal", "Kabupaten Demak", "Kabupaten Grobogan", "Kabupaten Pati",
    "Kabupaten Jepara", "Kabupaten Kudus", "Kabupaten Rembang", "Kabupaten Blora", "Kabupaten Boyolali",
    "Kabupaten Sragen", "Kabupaten Sukoharjo", "Kabupaten Wonogiri", "Kabupaten Karanganyar", "Kabupaten Klaten",
    "Kabupaten Purworejo", "Kabupaten Kebumen", "Kabupaten Banjarnegara", "Kabupaten Purbalingga",
    "Kabupaten Banyumas", "Kabupaten Cilacap", "Kabupaten Brebes", "Kabupaten Tegal", "Kabupaten Pekalongan",
    "Kabupaten Batang", "Kabupaten Temanggung", "Kabupaten Wonosobo", "Kabupaten Magelang"
  ],
  "DI Yogyakarta": [
    "Kota Yogyakarta", "Kabupaten Sleman", "Kabupaten Bantul", "Kabupaten Kulon Progo", "Kabupaten Gunungkidul"
  ],
  "Jawa Timur": [
    "Kota Surabaya", "Kota Malang", "Kota Batu", "Kota Blitar", "Kota Kediri", "Kota Madiun", "Kota Mojokerto",
    "Kota Pasuruan", "Kota Probolinggo", "Kabupaten Gresik", "Kabupaten Sidoarjo", "Kabupaten Mojokerto",
    "Kabupaten Jombang", "Kabupaten Bojonegoro", "Kabupaten Tuban", "Kabupaten Lamongan", "Kabupaten Madiun",
    "Kabupaten Magetan", "Kabupaten Ngawi", "Kabupaten Pacitan", "Kabupaten Ponorogo", "Kabupaten Trenggalek",
    "Kabupaten Tulungagung", "Kabupaten Blitar", "Kabupaten Kediri", "Kabupaten Lumajang", "Kabupaten Jember",
    "Kabupaten Banyuwangi", "Kabupaten Bondowoso", "Kabupaten Situbondo", "Kabupaten Probolinggo",
    "Kabupaten Pasuruan", "Kabupaten Sampang", "Kabupaten Pamekasan", "Kabupaten Sumenep", "Kabupaten Bangkalan",
    "Kabupaten Nganjuk"
  ],
  "Banten": [
    "Kota Serang", "Kota Tangerang", "Kota Cilegon", "Kota Tangerang Selatan", "Kabupaten Serang",
    "Kabupaten Tangerang", "Kabupaten Lebak", "Kabupaten Pandeglang"
  ],
  "Bali": [
    "Kota Denpasar", "Kabupaten Badung", "Kabupaten Bangli", "Kabupaten Buleleng", "Kabupaten Gianyar",
    "Kabupaten Jembrana", "Kabupaten Karangasem", "Kabupaten Klungkung", "Kabupaten Tabanan"
  ],
  "Nusa Tenggara Barat": [
    "Kota Mataram", "Kota Bima", "Kabupaten Lombok Barat", "Kabupaten Lombok Tengah", "Kabupaten Lombok Timur",
    "Kabupaten Sumbawa", "Kabupaten Dompu", "Kabupaten Bima", "Kabupaten Lombok Utara", "Kabupaten Sumbawa Barat"
  ],
  "Nusa Tenggara Timur": [
    "Kota Kupang", "Kabupaten Kupang", "Kabupaten Timor Tengah Selatan", "Kabupaten Timor Tengah Utara",
    "Kabupaten Belu", "Kabupaten Alor", "Kabupaten Lembata", "Kabupaten Flores Timur", "Kabupaten Sikka",
    "Kabupaten Ende", "Kabupaten Ngada", "Kabupaten Manggarai", "Kabupaten Rote Ndao", "Kabupaten Manggarai Barat",
    "Kabupaten Sumba Barat", "Kabupaten Sumba Timur", "Kabupaten Manggarai Timur", "Kabupaten Sabu Raijua",
    "Kabupaten Malaka", "Kabupaten Sumba Tengah", "Kabupaten Sumba Barat Daya"
  ],
  "Kalimantan Barat": [
    "Kota Pontianak", "Kota Singkawang", "Kabupaten Kapuas Hulu", "Kabupaten Sintang", "Kabupaten Sanggau",
    "Kabupaten Ketapang", "Kabupaten Sekadau", "Kabupaten Melawi", "Kabupaten Kayong Utara", "Kabupaten Kubu Raya",
    "Kabupaten Landak", "Kabupaten Bengkayang", "Kabupaten Sambas", "Kabupaten Mempawah"
  ],
  "Kalimantan Tengah": [
    "Kota Palangkaraya", "Kabupaten Kotawaringin Barat", "Kabupaten Kotawaringin Timur", "Kabupaten Kapuas",
    "Kabupaten Barito Selatan", "Kabupaten Barito Utara", "Kabupaten Katingan", "Kabupaten Seruyan",
    "Kabupaten Sukamara", "Kabupaten Lamandau", "Kabupaten Gunung Mas", "Kabupaten Pulang Pisau",
    "Kabupaten Murung Raya", "Kabupaten Barito Timur"
  ],
  "Kalimantan Selatan": [
    "Kota Banjarmasin", "Kota Banjarbaru", "Kabupaten Tanah Laut", "Kabupaten Kotabaru", "Kabupaten Banjar",
    "Kabupaten Barito Kuala", "Kabupaten Tapin", "Kabupaten Hulu Sungai Selatan", "Kabupaten Hulu Sungai Tengah",
    "Kabupaten Hulu Sungai Utara", "Kabupaten Tabalong", "Kabupaten Tanah Bumbu", "Kabupaten Balangan"
  ],
  "Kalimantan Timur": [
    "Kota Samarinda", "Kota Balikpapan", "Kota Bontang", "Kabupaten Paser", "Kabupaten Kutai Kartanegara",
    "Kabupaten Berau", "Kabupaten Kutai Barat", "Kabupaten Kutai Timur", "Kabupaten Penajam Paser Utara",
    "Kabupaten Mahakam Ulu"
  ],
  "Kalimantan Utara": [
    "Kota Tarakan", "Kabupaten Bulungan", "Kabupaten Malinau", "Kabupaten Nunukan", "Kabupaten Tana Tidung"
  ],
  "Sulawesi Utara": [
    "Kota Manado", "Kota Bitung", "Kota Tomohon", "Kota Kotamobagu", "Kabupaten Minahasa", "Kabupaten Minahasa Selatan",
    "Kabupaten Minahasa Utara", "Kabupaten Minahasa Tenggara", "Kabupaten Bolaang Mongondow",
    "Kabupaten Bolaang Mongondow Selatan", "Kabupaten Bolaang Mongondow Timur", "Kabupaten Bolaang Mongondow Utara",
    "Kabupaten Kepulauan Sangihe", "Kabupaten Kepulauan Talaud", "Kabupaten Siau Tagulandang Biaro"
  ],
  "Sulawesi Tengah": [
    "Kota Palu", "Kabupaten Donggala", "Kabupaten Toli-toli", "Kabupaten Buol", "Kabupaten Parigi Moutong",
    "Kabupaten Poso", "Kabupaten Morowali", "Kabupaten Banggai", "Kabupaten Banggai Kepulauan",
    "Kabupaten Banggai Laut", "Kabupaten Morowali Utara", "Kabupaten Sigi", "Kabupaten Tojo Una-una"
  ],
  "Sulawesi Selatan": [
    "Kota Makassar", "Kota Parepare", "Kota Palopo", "Kabupaten Gowa", "Kabupaten Sinjai", "Kabupaten Maros",
    "Kabupaten Pangkajene dan Kepulauan", "Kabupaten Barru", "Kabupaten Bone", "Kabupaten Soppeng", "Kabupaten Wajo",
    "Kabupaten Sidenreng Rappang", "Kabupaten Pinrang", "Kabupaten Enrekang", "Kabupaten Luwu", "Kabupaten Tana Toraja",
    "Kabupaten Luwu Utara", "Kabupaten Luwu Timur", "Kabupaten Toraja Utara", "Kabupaten Kepulauan Selayar",
    "Kabupaten Bulukumba", "Kabupaten Bantaeng", "Kabupaten Jeneponto", "Kabupaten Takalar"
  ],
  "Sulawesi Tenggara": [
    "Kota Kendari", "Kota Baubau", "Kabupaten Kolaka", "Kabupaten Konawe", "Kabupaten Muna", "Kabupaten Buton",
    "Kabupaten Konawe Selatan", "Kabupaten Bombana", "Kabupaten Wakatobi", "Kabupaten Kolaka Utara",
    "Kabupaten Konawe Utara", "Kabupaten Buton Utara", "Kabupaten Kolaka Timur", "Kabupaten Konawe Kepulauan",
    "Kabupaten Muna Barat", "Kabupaten Buton Tengah", "Kabupaten Buton Selatan"
  ],
  "Gorontalo": [
    "Kota Gorontalo", "Kabupaten Gorontalo", "Kabupaten Gorontalo Utara", "Kabupaten Bone Bolango",
    "Kabupaten Pohuwato", "Kabupaten Boalemo"
  ],
  "Sulawesi Barat": [
    "Kabupaten Majene", "Kabupaten Polewali Mandar", "Kabupaten Mamasa", "Kabupaten Mamuju", "Kabupaten Mamuju Tengah",
    "Kabupaten Mamuju Utara"
  ],
  "Maluku": [
    "Kota Ambon", "Kota Tual", "Kabupaten Maluku Tengah", "Kabupaten Maluku Tenggara", "Kabupaten Kepulauan Tanimbar",
    "Kabupaten Buru", "Kabupaten Seram Bagian Barat", "Kabupaten Seram Bagian Timur", "Kabupaten Maluku Barat Daya",
    "Kabupaten Buru Selatan"
  ],
  "Maluku Utara": [
    "Kota Ternate", "Kota Tidore Kepulauan", "Kabupaten Halmahera Barat", "Kabupaten Halmahera Tengah",
    "Kabupaten Halmahera Utara", "Kabupaten Halmahera Selatan", "Kabupaten Kepulauan Sula", "Kabupaten Halmahera Timur",
    "Kabupaten Pulau Morotai"
  ],
  "Papua": [
    "Kota Jayapura", "Kabupaten Jayapura", "Kabupaten Keerom", "Kabupaten Sarmi", "Kabupaten Mamberamo Raya",
    "Kabupaten Mamberamo Tengah", "Kabupaten Waropen", "Kabupaten Supiori", "Kabupaten Biak Numfor",
    "Kabupaten Yapen", "Kabupaten Nabire", "Kabupaten Paniai", "Kabupaten Puncak Jaya", "Kabupaten Dogiyai",
    "Kabupaten Intan Jaya", "Kabupaten Deiyai", "Kabupaten Mimika"
  ],
  "Papua Barat": [
    "Kota Sorong", "Kabupaten Sorong", "Kabupaten Manokwari", "Kabupaten Fakfak", "Kabupaten Sorong Selatan",
    "Kabupaten Raja Ampat", "Kabupaten Teluk Bintuni", "Kabupaten Teluk Wondama", "Kabupaten Kaimana",
    "Kabupaten Tambrauw", "Kabupaten Maybrat", "Kabupaten Manokwari Selatan", "Kabupaten Pegunungan Arfak"
  ],
  "Papua Selatan": [
    "Kabupaten Merauke", "Kabupaten Boven Digoel", "Kabupaten Mappi", "Kabupaten Asmat"
  ],
  "Papua Tengah": [
    "Kabupaten Nabire", "Kabupaten Paniai", "Kabupaten Dogiyai", "Kabupaten Intan Jaya", "Kabupaten Deiyai",
    "Kabupaten Mimika", "Kabupaten Puncak", "Kabupaten Puncak Jaya"
  ],
  "Papua Pegunungan": [
    "Kabupaten Jayawijaya", "Kabupaten Lanny Jaya", "Kabupaten Mamberamo Tengah", "Kabupaten Yalimo",
    "Kabupaten Pegunungan Bintang", "Kabupaten Tolikara"
  ],
  "Papua Barat Daya": [
    "Kabupaten Sorong", "Kabupaten Sorong Selatan", "Kabupaten Raja Ampat", "Kabupaten Tambrauw",
    "Kabupaten Maybrat", "Kabupaten Manokwari Selatan", "Kabupaten Pegunungan Arfak"
  ]
};

// Data kecamatan/distrik berdasarkan kota (disederhanakan)
export const districtsByCity: Record<string, string[]> = {
  "Kota Jakarta Pusat": ["Gambir", "Tanah Abang", "Menteng", "Senen", "Cempaka Putih", "Johar Baru"],
  "Kota Jakarta Selatan": ["Kebayoran Baru", "Kebayoran Lama", "Pasar Minggu", "Cilandak", "Jagakarsa", "Pesanggrahan"],
  "Kota Bandung": ["Andir", "Antapani", "Arcamanik", "Astanaanyar", "Babakan Ciparay", "Bandung Kidul", "Bandung Kulon"],
  "Kota Surabaya": ["Asemrowo", "Benowo", "Bubutan", "Bulak", "Dukuh Pakis", "Gayungan", "Genteng", "Gubeng"],
  "Kota Medan": ["Medan Amplas", "Medan Area", "Medan Barat", "Medan Baru", "Medan Belawan", "Medan Deli", "Medan Denai"],
  "Kota Makassar": ["Biring Kanaya", "Bontoala", "Makassar", "Mamajang", "Manggala", "Mariso", "Panakkukang", "Rappocini"],
  "Kota Denpasar": ["Denpasar Barat", "Denpasar Selatan", "Denpasar Timur", "Denpasar Utara"],
  "Kota Semarang": ["Banyumanik", "Candisari", "Gajahmungkur", "Gayamsari", "Genuk", "Gunungpati", "Mijen"],
  "Kota Yogyakarta": ["Danurejan", "Gedongtengen", "Gondokusuman", "Gondomanan", "Jetis", "Kotagede", "Kraton"]
};

// Data kode pos berdasarkan kota (disederhanakan)
export const postalCodesByCity: Record<string, string[]> = {
  "Kota Jakarta Pusat": ["10110", "10120", "10130", "10140", "10150"],
  "Kota Jakarta Selatan": ["12110", "12120", "12130", "12140", "12150"],
  "Kota Bandung": ["40111", "40112", "40113", "40114", "40115", "40116"],
  "Kota Surabaya": ["60111", "60112", "60113", "60114", "60115", "60116"],
  "Kota Medan": ["20111", "20112", "20113", "20114", "20115", "20116"],
  "Kota Makassar": ["90111", "90112", "90113", "90114", "90115", "90116"],
  "Kota Denpasar": ["80211", "80221", "80231", "80241", "80251"],
  "Kota Semarang": ["50111", "50112", "50113", "50114", "50115", "50116"],
  "Kota Yogyakarta": ["55111", "55121", "55131", "55141", "55151"]
};

// Helper functions
export const getCitiesByProvince = (province: string): string[] => {
  return citiesByProvince[province] || [];
};

export const getDistrictsByCity = (city: string): string[] => {
  return districtsByCity[city] || [];
};

export const getPostalCodesByCity = (city: string): string[] => {
  return postalCodesByCity[city] || [];
};