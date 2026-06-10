/**
 * Indonesian Location Data - Complete
 * All 34 provinces with cities and districts
 */

export const PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Jambi",
  "Sumatera Selatan",
  "Lampung",
  "Bangka Belitung",
  "Kepulauan Riau",
  "DKI Jakarta",
  "Jawa Barat",
  "Banten",
  "Jawa Tengah",
  "Yogyakarta",
  "Jawa Timur",
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
  "Papua Pegunungan",
];

export const CITIES_BY_PROVINCE: Record<string, string[]> = {
  // Aceh
  "Aceh": [
    "Banda Aceh",
    "Aceh Barat",
    "Aceh Barat Daya",
    "Aceh Jaya",
    "Aceh Selatan",
    "Aceh Singkil",
    "Aceh Tamiang",
    "Aceh Tengah",
    "Aceh Tenggara",
    "Aceh Timur",
    "Aceh Utara",
    "Bireuen",
    "Lhokseumawe",
    "Pidie",
    "Pidie Jaya",
    "Sabang",
    "Simeulue",
  ],

  // Sumatera Utara
  "Sumatera Utara": [
    "Asahan",
    "Batubara",
    "Binjai",
    "Dairi",
    "Deli Serdang",
    "Gunungsitoli",
    "Humbang Hasundutan",
    "Karo",
    "Labuhanbatu",
    "Labuhanbatu Selatan",
    "Labuhanbatu Utara",
    "Langkat",
    "Mandailing Natal",
    "Medan",
    "Nias",
    "Nias Barat",
    "Nias Selatan",
    "Nias Utara",
    "Padang Lawas",
    "Padang Lawas Utama",
    "Pakpak Bharat",
    "Pematangsiantar",
    "Samosir",
    "Serdang Bedagai",
    "Sibolga",
    "Simalungun",
    "Tanjungbalai",
    "Tapanuli Selatan",
    "Tapanuli Tengah",
    "Tapanuli Utara",
    "Tebing Tinggi",
    "Toba Samosir",
  ],

  // Sumatera Barat
  "Sumatera Barat": [
    "Agam",
    "Bukittinggi",
    "Dharmasraya",
    "Lima Puluh Kota",
    "Mentawai",
    "Padang",
    "Padang Panjang",
    "Pariaman",
    "Pasaman",
    "Pasaman Barat",
    "Payakumbuh",
    "Pesisir Selatan",
    "Sawah Lunto",
    "Solok",
    "Solok Selatan",
    "Tanah Datar",
  ],

  // Riau
  "Riau": [
    "Bengkalis",
    "Dumai",
    "Indragiri Hilir",
    "Indragiri Hulu",
    "Kampar",
    "Kuantan Singingi",
    "Meranti",
    "Natuna",
    "Pekanbaru",
    "Rokan Hilir",
    "Rokan Hulu",
    "Siak",
  ],

  // Jambi
  "Jambi": [
    "Batanghari",
    "Bungo",
    "Jambi",
    "Kerinci",
    "Kuantan Singingi",
    "Merangin",
    "Muara Bulian",
    "Muara Enim",
    "Sarolangun",
    "Tanjung Jabung Barat",
    "Tanjung Jabung Timur",
  ],

  // Sumatera Selatan
  "Sumatera Selatan": [
    "Banyuasin",
    "Empat Lawang",
    "Lahat",
    "Muba",
    "Muara Enim",
    "Musi Banyuasin",
    "Musi Rawas",
    "Musi Rawas Utama",
    "Ogan Ilir",
    "Ogan Komering Ilir",
    "Ogan Komering Ulu",
    "Ogan Komering Ulu Selatan",
    "Ogan Komering Ulu Timur",
    "Palembang",
    "Penukal Abab Lematang Ilir",
  ],

  // Lampung
  "Lampung": [
    "Bandarlampung",
    "Lampung Barat",
    "Lampung Selatan",
    "Lampung Tengah",
    "Lampung Timur",
    "Lampung Utara",
    "Metro",
    "Pesawaran",
    "Pringsewu",
    "Tanggamus",
    "Way Kanan",
  ],

  // Bangka Belitung
  "Bangka Belitung": [
    "Bangka",
    "Bangka Barat",
    "Bangka Selatan",
    "Bangka Tengah",
    "Belitung",
    "Belitung Timur",
    "Pangkal Pinang",
  ],

  // Kepulauan Riau
  "Kepulauan Riau": [
    "Anambas",
    "Batam",
    "Bintan",
    "Karimun",
    "Kepulauan Meranti",
    "Natuna",
    "Tanjung Pinang",
  ],

  // DKI Jakarta
  "DKI Jakarta": [
    "Jakarta Pusat",
    "Jakarta Utara",
    "Jakarta Barat",
    "Jakarta Selatan",
    "Jakarta Timur",
    "Kepulauan Seribu",
  ],

  // Jawa Barat
  "Jawa Barat": [
    "Bandung",
    "Bandung Barat",
    "Banjar",
    "Bekasi",
    "Bogor",
    "Cirebon",
    "Ciamis",
    "Cianjur",
    "Ciarwis",
    "Depok",
    "Garut",
    "Indramayu",
    "Karawang",
    "Kuningan",
    "Majalengka",
    "Pangandaran",
    "Purwakarta",
    "Subang",
    "Sukabumi",
    "Sumedang",
    "Tasikmalaya",
  ],

  // Banten
  "Banten": [
    "Anyer",
    "Balaraja",
    "Banten",
    "Cikampek",
    "Cilegon",
    "Lebak",
    "Pandeglang",
    "Serang",
    "Tangerang",
    "Tangerang Selatan",
  ],

  // Jawa Tengah
  "Jawa Tengah": [
    "Ambarawa",
    "Batang",
    "Blora",
    "Boyolali",
    "Brebes",
    "Cepu",
    "Demak",
    "Grobogan",
    "Jepara",
    "Karanganyar",
    "Kendal",
    "Klaten",
    "Kudus",
    "Magelang",
    "Mungkidjo",
    "Pati",
    "Pekalongan",
    "Purwodadi",
    "Purwokerto",
    "Purworejo",
    "Rembang",
    "Salatiga",
    "Semarang",
    "Sragen",
    "Sukoharjo",
    "Sleman",
    "Temanggung",
    "Tegal",
    "Ungaran",
    "Wonogiri",
    "Wonosbo",
  ],

  // Yogyakarta
  "Yogyakarta": [
    "Bantul",
    "Gunung Kidul",
    "Kulon Progo",
    "Sleman",
    "Yogyakarta",
  ],

  // Jawa Timur
  "Jawa Timur": [
    "Batu",
    "Bangkalan",
    "Banyuwangi",
    "Blitar",
    "Bojonegoro",
    "Bondowoso",
    "Gresik",
    "Jember",
    "Jombang",
    "Kediri",
    "Kota Probolinggo",
    "Kota Surabaya",
    "Lamongan",
    "Lumajang",
    "Madiun",
    "Magetan",
    "Malang",
    "Mojokerto",
    "Nganjuk",
    "Ngawi",
    "Pacitan",
    "Pamekasan",
    "Pasuruan",
    "Ponorogo",
    "Sampang",
    "Sidoarjo",
    "Situbondo",
    "Surabaya",
    "Sumenep",
    "Trenggalek",
    "Tuban",
    "Tulungagung",
  ],

  // Bali
  "Bali": [
    "Badung",
    "Bangli",
    "Buleleng",
    "Denpasar",
    "Gianyar",
    "Jembrana",
    "Karangasem",
    "Klungkung",
    "Tabanan",
  ],

  // Nusa Tenggara Barat
  "Nusa Tenggara Barat": [
    "Bima",
    "Dompu",
    "Kota Mataram",
    "Lombok Barat",
    "Lombok Tengah",
    "Lombok Timur",
    "Lombok Utara",
    "Mataram",
    "Sumbawa",
    "Sumbawa Barat",
  ],

  // Nusa Tenggara Timur
  "Nusa Tenggara Timur": [
    "Alor",
    "Amanuban Barat",
    "Amanuban Timur",
    "Belu",
    "Flores Timur",
    "Kupang",
    "Kupang Barat",
    "Lembata",
    "Malaka",
    "Manggarai",
    "Manggarai Barat",
    "Manggarai Timur",
    "Nagekeo",
    "Ngada",
    "Ende",
    "Rote Ndao",
    "Sabu Raijua",
    "Sikka",
    "Timor Tengah Selatan",
    "Timor Tengah Utara",
  ],

  // Kalimantan Barat
  "Kalimantan Barat": [
    "Bengkayang",
    "Capuas",
    "Ketapang",
    "Kayong Utara",
    "Kubu Raya",
    "Landak",
    "Mempawah",
    "Melawi",
    "Mempawah",
    "Pontianak",
    "Sambas",
    "Sanggau",
    "Sekadau",
    "Singkawang",
  ],

  // Kalimantan Tengah
  "Kalimantan Tengah": [
    "Barito Selatan",
    "Barito Timur",
    "Barito Utara",
    "Gumas",
    "Gunung Mas",
    "Kapuas",
    "Kotawaringin Barat",
    "Kotawaringin Timur",
    "Lamandau",
    "Murung Raya",
    "Palangka Raya",
    "Pulang Pisau",
    "Sakhalin",
    "Sukamara",
    "Sukamura",
    "Tanjung Selor",
  ],

  // Kalimantan Selatan
  "Kalimantan Selatan": [
    "Balangan",
    "Banjar",
    "Banjarbaru",
    "Banjarmasin",
    "Hulu Sungai Selatan",
    "Hulu Sungai Tengah",
    "Hulu Sungai Utara",
    "Kotabaru",
    "Kuala Kapuas",
    "Tanah Bumbu",
    "Tanah Laut",
    "Tapin",
  ],

  // Kalimantan Timur
  "Kalimantan Timur": [
    "Balikpapan",
    "Berau",
    "Bontang",
    "Kutai Barat",
    "Kutai Kartanegara",
    "Kutai Timur",
    "Mahakam Ulu",
    "Penajam Paser Utara",
    "Samarinda",
    "Sangatta",
  ],

  // Kalimantan Utara
  "Kalimantan Utara": [
    "Bulungan",
    "Malinau",
    "Nunukan",
    "Tanjung Selor",
    "Tarakan",
  ],

  // Sulawesi Utara
  "Sulawesi Utara": [
    "Bitung",
    "Bolang Mongondow",
    "Bolang Mongondow Utara",
    "Bolang Mongondow Selatan",
    "Bolang Mongondow Timur",
    "Bunaken",
    "Gorontalo Utara",
    "Kendari",
    "Kepulauan Sangihe",
    "Kepulauan Talaud",
    "Kota Manado",
    "Kota Tomohon",
    "Manado",
    "Minahasa",
    "Minahasa Selatan",
    "Minahasa Tenggara",
    "Minahasa Utara",
    "Tomohon",
  ],

  // Sulawesi Tengah
  "Sulawesi Tengah": [
    "Banggai",
    "Banggai Kepulauan",
    "Banggai Laut",
    "Buol",
    "Donggala",
    "Gorontalo",
    "Morowali",
    "Morowali Utara",
    "Parigi Moutong",
    "Palu",
    "Sigi",
    "Tavarang",
    "Tojo Una-Una",
    "Tondan",
    "Tori-Tori",
  ],

  // Sulawesi Selatan
  "Sulawesi Selatan": [
    "Bantaeng",
    "Barru",
    "Bone",
    "Bulukumba",
    "Enrekang",
    "Gowa",
    "Jeneponto",
    "Kepulauan Selayar",
    "Luwu",
    "Luwu Timur",
    "Luwu Utara",
    "Makassar",
    "Mamasa",
    "Maros",
    "Pangkajene Kepulauan",
    "Pare-Pare",
    "Pinrang",
    "Sidenreng Rappang",
    "Sinjai",
    "Soppeng",
    "Takalar",
    "Tana Toraja",
    "Toraja Utara",
    "Wajo",
  ],

  // Sulawesi Tenggara
  "Sulawesi Tenggara": [
    "Bombana",
    "Buton",
    "Buton Utara",
    "Buton Selatan",
    "Kolaka",
    "Kolaka Timur",
    "Kolaka Utara",
    "Konawe",
    "Konawe Selatan",
    "Konawe Utara",
    "Kendari",
    "Muna",
    "Muna Barat",
    "Wakatobi",
  ],

  // Gorontalo
  "Gorontalo": [
    "Boalemo",
    "Bone Bolango",
    "Gorontalo",
    "Gorontalo Utara",
    "Pohuwato",
    "Tilamuta",
  ],

  // Sulawesi Barat
  "Sulawesi Barat": [
    "Mamasa",
    "Mamuju",
    "Mamuju Utara",
    "Majene",
    "Polewali Mandar",
  ],

  // Maluku
  "Maluku": [
    "Ambon",
    "Banyuasin",
    "Buru",
    "Buru Selatan",
    "Ceram",
    "Halmahera Barat",
    "Halmahera Selatan",
    "Halmahera Tengah",
    "Halmahera Timur",
    "Halmahera Utara",
    "Kepulauan Aru",
    "Kepulauan Sula",
    "Kepulauan Tanimbar",
    "Kota Ambon",
    "Kota Tual",
    "Laut",
    "Maluku Barat Daya",
    "Maluku Tenggara",
    "Maluku Tenggara Barat",
    "Maluku Utara",
    "Manado",
    "Sanana",
    "Seram Bagian Barat",
    "Seram Bagian Timur",
    "Tual",
    "Wakatobi",
  ],

  // Maluku Utara
  "Maluku Utara": [
    "Halmahera Barat",
    "Halmahera Selatan",
    "Halmahera Tengah",
    "Halmahera Timur",
    "Halmahera Utara",
    "Kepulauan Sula",
    "Morotai",
    "Tidore Kepulauan",
    "Ternate",
  ],

  // Papua
  "Papua": [
    "Asmat",
    "Biak Numfor",
    "Biak",
    "Boven Digul",
    "Deiyai",
    "Dogiyai",
    "Fakfak",
    "Intan Jaya",
    "Jayawijaya",
    "Jayapura",
    "Kerom",
    "Kota Jayapura",
    "Lanny Jaya",
    "Mamberamo Raya",
    "Mamberamo Tengah",
    "Mappi",
    "Merauke",
    "Mimika",
    "Nabire",
    "Nduga",
    "Paniai",
    "Puncak",
    "Puncak Jaya",
    "Sarmi",
    "Supiori",
    "Tolikara",
    "Waropen",
    "Yapen Waropen",
  ],

  // Papua Barat
  "Papua Barat": [
    "Arfak",
    "Fakfak",
    "Kaimana",
    "Kota Sorong",
    "Maybrat",
    "Manokwari",
    "Manokwari Selatan",
    "Pegunungan Arfak",
    "Raja Ampat",
    "Sorong",
    "Sorong Selatan",
    "Tambrauw",
    "Teluk Bintuni",
    "Teluk Wondama",
  ],

  // Papua Selatan
  "Papua Selatan": [
    "Asmat",
    "Boven Digul",
    "Mappi",
    "Merauke",
  ],

  // Papua Pegunungan
  "Papua Pegunungan": [
    "Dogiyai",
    "Intan Jaya",
    "Jayawijaya",
    "Lanny Jaya",
    "Nduga",
    "Puncak",
    "Puncak Jaya",
    "Tolikara",
  ],
};

export const DISTRICTS_BY_CITY: Record<string, string[]> = {
  // Jakarta Pusat
  "Jakarta Pusat": [
    "Menteng",
    "Tanah Abang",
    "Kemayoran",
    "Sawah Besar",
    "Johar Baru",
    "Cempaka Putih",
  ],
  // Jakarta Utara
  "Jakarta Utara": [
    "Ancol",
    "Cilincing",
    "Kelapa Gading",
    "Kronologi",
    "Marunda",
    "Pancoranmas",
    "Penjaringan",
    "Pademangan",
    "Tanjung Priok",
  ],
  // Jakarta Barat
  "Jakarta Barat": [
    "Cengkareng",
    "Grogol Petamburan",
    "Kalideres",
    "Kembangan",
    "Palmerah",
    "Tambora",
  ],
  // Jakarta Selatan
  "Jakarta Selatan": [
    "Cilandak",
    "Cipete",
    "Jagakarsa",
    "Kebayoran Baru",
    "Kebayoran Lama",
    "Kuningan",
    "Mampang Prapatan",
    "Pancoran",
    "Pesanggrahan",
    "Pondok Labu",
    "Setiabudi",
    "Tebet",
  ],
  // Jakarta Timur
  "Jakarta Timur": [
    "Cakung",
    "Ciracas",
    "Cipayung",
    "Duren Sawit",
    "Jatinegara",
    "Kramat Jati",
    "Maktab",
    "Makasar",
    "Mustika Jaya",
    "Pal Meriam",
    "Pasar Rebo",
    "Pulogadung",
    "Ujung Menteng",
  ],
  // Bandung
  "Bandung": [
    "Andir",
    "Antapani",
    "Astanaanyar",
    "Babakan Ciparay",
    "Bandung",
    "Batununggal",
    "Bojongloa Kaler",
    "Bojongloa Kidul",
    "Buahbatu",
    "Cibaduyut",
    "Cisangkuy",
    "Coblong",
    "Dayeuhkolot",
    "Gedebage",
    "Mandalajati",
    "Panyileukan",
    "Rancacili",
    "Rancasari",
    "Regol",
    "Samoja",
    "Sumur Bandung",
    "Sukajadi",
    "Sukasari",
    "Sukatani",
    "Sukawisma",
    "Tapos",
    "Tegalluar",
    "Tenjo",
    "Wates",
  ],
  // Surabaya
  "Surabaya": [
    "Bulak",
    "Dukuh Pakis",
    "Genteng",
    "Gresik",
    "Gubeng",
    "Gunung Anyar",
    "Jambangan",
    "Karang Pilang",
    "Kenjeran",
    "Krembangan",
    "Lakarsantri",
    "Mulyorejo",
    "Pabean Cantian",
    "Pakal",
    "Pancoran Anom",
    "Perak",
    "Rungkut",
    "Sambikerep",
    "Sawahan",
    "Sememi",
    "Simokerto",
    "Simolawang",
    "Sukolilo",
    "Tegalsari",
    "Tenggilis Mejoyo",
    "Tandes",
    "Wiyung",
    "Wonokromo",
    "Wonocolo",
  ],
  // Medan
  "Medan": [
    "Amplas",
    "Belawan",
    "Denai",
    "Johor",
    "Karo",
    "Labuhan",
    "Laksamana",
    "Medan Barat",
    "Medan Deli",
    "Medan Johor",
    "Medan Kota",
    "Medan Maimun",
    "Medan Perjuangan",
    "Medan Satria",
    "Medan Selayang",
    "Medan Sunggal",
    "Medan Tembung",
    "Medan Timur",
    "Perjuangan",
    "Petisah",
    "Sunggal",
    "Tanjung Morawa",
    "Tembung",
  ],
  
  // Banten - Serang
  "Serang": [
    "Serang",
    "Ciomas",
    "Ciruas",
    "Kasemen",
    "Tanara",
    "Bandjarreja",
    "Cinangka",
  ],
  
  // Banten - Pandeglang
  "Pandeglang": [
    "Pandeglang",
    "Cigeulis",
    "Cijeruk",
    "Cimanuk",
    "Labuan",
    "Menes",
    "Sumur",
    "Carita",
    "Patia",
    "Bojongprotok",
  ],
  
  // Banten - Lebak
  "Lebak": [
    "Rangkasbitung",
    "Lebak Wangi",
    "Cipanas",
    "Cilograng",
    "Cimarga",
    "Gunungjaya",
    "Lebakgedong",
    "Lebakpulus",
    "Malingping",
    "Mangunjaya",
    "Muara",
    "Nanggung",
    "Pasir Putih",
    "Sancak",
  ],
  
  // Banten - Tangerang
  "Tangerang": [
    "Tangerang",
    "Balaraja",
    "Tigaraksa",
    "Jayanti",
    "Kemiri",
    "Pabuaran",
    "Krontal",
    "Tirtamulya",
    "Benda",
    "Cikupa",
    "Cisoka",
    "Girang",
    "Jambe",
    "Karawaci",
    "Legok",
    "Mantua",
    "Pasar Kemis",
    "Sepatan",
    "Sepatan Timur",
    "Solear",
    "Teluk Naga",
    "Teluknaga",
  ],
  
  // Banten - Tangerang Selatan
  "Tangerang Selatan": [
    "Cisauk",
    "Ciputat",
    "Setu",
    "Pondok Aren",
    "Larangan",
    "Rempoa",
    "Ciputat Timur",
  ],
  
  // Banten - Cilegon
  "Cilegon": [
    "Cibeber",
    "Ciceri",
    "Cilegon",
    "Grogol",
    "Jombang",
    "Pulomerak",
  ],
  
  // Banten - Anyer
  "Anyer": [
    "Anyer",
    "Baduy",
    "Carita",
    "Labuan",
  ],
  
  // Bogor
  "Bogor": [
    "Bogor Selatan",
    "Bogor Tengah",
    "Bogor Utara",
    "Bubulak",
    "Cilendek Barat",
    "Cilendek Timur",
    "Cimahpar",
    "Curug",
    "Kemang",
    "Kebon Pedes",
    "Menteng",
    "Mulyaharja",
    "Pabaton",
    "Sempur",
    "Sukasari",
    "Tanahabang",
    "Tanah Sareal",
  ],
  
  // Bekasi
  "Bekasi": [
    "Ancol",
    "Babelan",
    "Bekasi Barat",
    "Bekasi Selatan",
    "Bekasi Timur",
    "Bekasi Utara",
    "Bintang",
    "Cabang",
    "Cikampek",
    "Cikarang Barat",
    "Cikarang Timur",
    "Ciketing",
    "Cilebar",
    "Cilegon",
    "Cireundeu",
    "Jatiasih",
    "Jatimakmur",
    "Jaticempaka",
    "Kranji",
    "Medan",
    "Mustikajaya",
    "Pejuang",
    "Rawalumbu",
    "Setu",
    "Tambun Selatan",
    "Tambun Utara",
  ],
  
  // Depok
  "Depok": [
    "Beji",
    "Bojongsari",
    "Cilodong",
    "Cimanggis",
    "Cipeucang",
    "Cipayung",
    "Citayam",
    "Citeureup",
    "Ciwhiteung",
    "Jatijajar",
    "Junrejo",
    "Kemang",
    "Limo",
    "Pancoran Mas",
    "Pondok Cina",
    "Pondok Timur",
    "Sawangan",
    "Sukatani",
    "Sukmajaya",
    "Tapos",
    "Tarakanita",
    "Tirtajaya",
    "Tugu",
  ],
  
  // Cirebon
  "Cirebon": [
    "Astana",
    "Cabang",
    "Cirebon",
    "Ciweru",
    "Gunung Jati",
    "Kapetakan",
    "Kedawung",
    "Klangenan",
    "Lemahabang",
    "Lemahbang",
    "Mundu",
    "Palimanan",
    "Pangenan",
    "Pelabuhan",
    "Plered",
    "Sedong",
    "Sumber",
    "Suranenggala",
    "Tengah",
    "Tirto",
    "Widasari",
    "Weru",
    "Wringin",
  ],
  
  // Semarang
  "Semarang": [
    "Banyumanik",
    "Berat",
    "Candisari",
    "Candi",
    "Cepu",
    "Gajahmungkur",
    "Gunungpati",
    "Karang Anyar",
    "Karangayu",
    "Kemasan",
    "Kudu",
    "Kuningan",
    "Lamper Kidul",
    "Lamper Lor",
    "Mangkang",
    "Mayoran",
    "Medarom",
    "Mejobo",
    "Mranggen",
    "Mulyo",
    "Ngesrep",
    "Pandean",
    "Parang",
    "Patemon",
    "Pedurungan",
    "Penggaron",
    "Semarang Barat",
    "Semarang Selatan",
    "Semarang Tengah",
    "Semarang Timur",
    "Semarang Utara",
    "Semampir",
    "Semanggi",
    "Setiabudi",
    "Tanjung",
    "Tanjung Mas",
    "Tembalang",
    "Tengah",
    "Tubanan",
    "Tulung Agung",
    "Ungaran",
    "Wates",
    "Wonosari",
  ],
  
  // Yogyakarta
  "Yogyakarta": [
    "Gedongtengen",
    "Gondomanan",
    "Jetis",
    "Kotagede",
    "Kraton",
    "Mantrijeron",
    "Merapi",
    "Minomartani",
    "Pakualaman",
    "Panakkukang",
    "Polokarto",
    "Semaki",
    "Suryodiningratan",
    "Tegalrejo",
    "Umbulharjo",
    "Wirobrajan",
  ],
  
  // Denpasar (Bali)
  "Denpasar": [
    "Denpasar Barat",
    "Denpasar Selatan",
    "Denpasar Tengah",
    "Denpasar Timur",
    "Denpasar Utara",
  ],
  
  // Mataram (NTB)
  "Kota Mataram": [
    "Ampenan",
    "Cakranegara",
    "Mataram",
    "Pejanggik",
    "Sekarbela",
    "Selaparang",
  ],
  
  // Kupang (NTT)
  "Kupang": [
    "Alak",
    "Kelapa Lima",
    "Kota Lama",
    "Oebobo",
    "Pasir Panjang",
    "Tarus",
  ],
  
  // Pontianak (Kalbar)
  "Pontianak": [
    "Pontianak Barat",
    "Pontianak Kota",
    "Pontianak Selatan",
    "Pontianak Tenggara",
    "Pontianak Timur",
    "Pontianak Utara",
  ],
  
  // Palangka Raya (Kalteng)
  "Palangka Raya": [
    "Bukit Batu",
    "Jekan Raya",
    "Pahandut",
    "Rakumaka",
    "Sabangau",
  ],
  
  // Banjarmasin (Kalsel)
  "Banjarmasin": [
    "Astambul",
    "Banjarmasin Barat",
    "Banjarmasin Selatan",
    "Banjarmasin Tengah",
    "Banjarmasin Timur",
    "Banjarmasin Utara",
    "Cempaka",
    "Liang Anggang",
    "Pekauman",
  ],
  
  // Samarinda (Kaltim)
  "Samarinda": [
    "Samarinda Ilir",
    "Samarinda Kota",
    "Samarinda Seberang",
    "Samarinda Ulu",
    "Loa Janan Ilir",
    "Sambutan",
    "Sungai Kunjang",
  ],
  
  // Manado (Sulut)
  "Kota Manado": [
    "Bailang",
    "Bunaken",
    "Malalayang",
    "Manado Barat",
    "Manado Selatan",
    "Manado Tengah",
    "Manado Timur",
    "Manado Utara",
    "Mapanget",
    "Mawang",
    "Mogisulang",
    "Paal",
    "Tanjung",
    "Tikala",
    "Tuminting",
    "Wanea",
  ],
  
  // Palu (Sulteng)
  "Palu": [
    "Palu Barat",
    "Palu Selatan",
    "Palu Tengah",
    "Palu Timur",
    "Palu Utara",
    "Tawaeli",
  ],
  
  // Makassar (Sulsel)
  "Makassar": [
    "Makassar Barat",
    "Makassar Selatan",
    "Makassar Tengah",
    "Makassar Timur",
    "Makassar Utara",
    "Mariso",
    "Ujung Pandang",
    "Wajo",
    "Baddoka",
    "Tamalanrea",
  ],
  
  // Kendari (Sultra)
  "Kendari": [
    "Kendari Barat",
    "Kendari Kota",
    "Kendari Timur",
    "Abeli",
    "Baruga",
    "Poasia",
  ],
  
  // Ambon (Maluku)
  "Ambon": [
    "Ambon Barat",
    "Ambon Tengah",
    "Ambon Timur",
    "Leitimur Selatan",
    "Leitimur Utara",
    "Muara Tebo",
    "Nusaniwe",
  ],
  
  // Ternate (Malut)
  "Ternate": [
    "Ternate Barat",
    "Ternate Selatan",
    "Ternate Tengah",
    "Ternate Timur",
    "Ternate Utara",
    "Moti",
  ],
  
  // Jayapura (Papua)
  "Jayapura": [
    "Jayapura Selatan",
    "Jayapura Tengah",
    "Jayapura Timur",
    "Jayapura Utara",
    "Abepura",
    "Heram",
  ],
  
  // Sorong (Papua Barat)
  "Kota Sorong": [
    "Sorong Barat",
    "Sorong Kota",
    "Sorong Selatan",
    "Sorong Timur",
    "Sorong Utara",
  ],
};

/**
 * Postal codes mapped by city
 * Most major cities with their common postal code ranges
 */
export const POSTAL_CODES_BY_CITY: Record<string, string[]> = {
  // Jakarta
  "Jakarta Pusat": ["10110", "10120", "10130", "10140", "10150", "10160", "10170", "10180", "10190", "10210", "10220", "10230", "10240", "10250"],
  "Jakarta Utara": ["14110", "14120", "14130", "14140", "14150", "14160", "14170", "14180", "14190", "14210", "14220", "14240", "14250", "14260", "14270"],
  "Jakarta Barat": ["11110", "11120", "11130", "11140", "11150", "11160", "11170", "11180", "11190", "11210", "11220", "11230", "11240", "11250"],
  "Jakarta Selatan": ["12110", "12120", "12130", "12140", "12150", "12160", "12170", "12180", "12190", "12210", "12220", "12230", "12240", "12250", "12260", "12270", "12280", "12290", "12300", "12310", "12320", "12330", "12340", "12350"],
  "Jakarta Timur": ["13110", "13120", "13130", "13140", "13150", "13160", "13170", "13180", "13190", "13210", "13220", "13230", "13240", "13250", "13260", "13270", "13280", "13290"],
  
  // Bandung
  "Bandung": ["40111", "40112", "40113", "40114", "40115", "40116", "40117", "40118", "40119", "40121", "40122", "40123", "40124", "40125", "40126", "40127", "40128", "40129", "40131", "40132", "40133", "40134", "40135", "40136", "40141", "40142", "40143", "40144", "40145", "40151", "40152", "40153", "40161", "40162", "40171", "40172"],
  
  // Surabaya
  "Surabaya": ["60111", "60112", "60113", "60114", "60115", "60116", "60117", "60118", "60119", "60121", "60122", "60123", "60124", "60125", "60126", "60127", "60128", "60129", "60131", "60132", "60133", "60134", "60135", "60136", "60141", "60142", "60143", "60144", "60145", "60151", "60152", "60153", "60154", "60155", "60161", "60162", "60163", "60164", "60165", "60166", "60167", "60168", "60169", "60171", "60172", "60173", "60174", "60175", "60176", "60177", "60178", "60179", "60181", "60182", "60183", "60184", "60185", "60186", "60187", "60188", "60189"],
  
  // Medan
  "Medan": ["20111", "20112", "20113", "20114", "20115", "20116", "20117", "20118", "20119", "20121", "20122", "20123", "20124", "20125", "20126", "20127", "20128", "20129", "20131", "20132", "20133", "20134", "20135", "20141", "20142", "20143", "20144", "20145", "20151", "20152", "20153", "20154", "20155", "20156", "20157", "20158", "20159", "20161", "20162", "20163", "20164", "20165", "20166", "20167", "20168", "20169", "20211", "20212", "20213", "20214", "20215", "20216", "20217", "20218", "20219", "20221", "20222", "20223", "20224", "20225"],
  
  // Serang (Banten)
  "Serang": ["42111", "42112", "42113", "42114", "42115", "42116", "42117", "42118", "42119", "42121", "42122", "42123"],
  
  // Pandeglang (Banten)
  "Pandeglang": ["42211", "42212", "42213", "42214", "42215", "42216", "42217", "42218"],
  
  // Lebak (Banten)
  "Lebak": ["42311", "42312", "42313", "42314", "42315", "42316", "42317", "42318", "42319", "42321", "42322", "42323"],
  
  // Tangerang
  "Tangerang": ["15111", "15112", "15113", "15114", "15115", "15116", "15117", "15118", "15119", "15121", "15122", "15123", "15124", "15125", "15126", "15127", "15128", "15129", "15131", "15132", "15133", "15134", "15135", "15141", "15142", "15143", "15144", "15145", "15146"],
  
  // Tangerang Selatan
  "Tangerang Selatan": ["15310", "15311", "15312", "15313", "15314", "15315", "15316", "15317", "15318", "15319", "15320", "15321", "15322", "15323", "15324", "15325"],
  
  // Cilegon (Banten)
  "Cilegon": ["42411", "42412", "42413", "42414", "42415", "42416"],
  
  // Bogor
  "Bogor": ["16111", "16112", "16113", "16114", "16115", "16116", "16117", "16118", "16119", "16121", "16122", "16123", "16124", "16125", "16126", "16127", "16128", "16129", "16131", "16132", "16133", "16134", "16135", "16141", "16142", "16143", "16144", "16145", "16151", "16152", "16153", "16154", "16155"],
  
  // Bekasi
  "Bekasi": ["17111", "17112", "17113", "17114", "17115", "17116", "17117", "17118", "17119", "17121", "17122", "17123", "17124", "17125", "17126", "17127", "17128", "17129", "17131", "17132", "17133", "17134", "17135", "17141", "17142", "17143", "17144", "17145", "17151", "17152", "17153", "17154", "17155"],
  
  // Depok
  "Depok": ["16411", "16412", "16413", "16414", "16415", "16416", "16417", "16418", "16419", "16421", "16422", "16423", "16424", "16425"],
  
  // Cirebon
  "Cirebon": ["45111", "45112", "45113", "45114", "45115", "45116", "45117", "45118", "45119", "45121", "45122", "45123", "45124", "45125", "45126"],
  
  // Semarang
  "Semarang": ["50111", "50112", "50113", "50114", "50115", "50116", "50117", "50118", "50119", "50121", "50122", "50123", "50124", "50125", "50126", "50127", "50128", "50129", "50131", "50132", "50133", "50134", "50135", "50136", "50137", "50138", "50141", "50142", "50143", "50144", "50145", "50146", "50147", "50148", "50149", "50151", "50152", "50153", "50154", "50155", "50156", "50157", "50158", "50159", "50161", "50162", "50163"],
  
  // Yogyakarta
  "Yogyakarta": ["55111", "55112", "55113", "55114", "55115", "55116", "55117", "55118", "55119", "55121", "55122", "55123", "55124", "55125", "55126", "55127", "55128", "55129", "55131", "55132", "55133", "55134", "55135", "55136", "55137", "55138", "55139", "55141", "55142", "55143", "55144", "55145", "55146"],
  
  // Denpasar (Bali)
  "Denpasar": ["80111", "80112", "80113", "80114", "80115", "80116", "80117", "80118", "80119", "80121", "80122", "80123", "80124"],
  
  // Mataram (NTB)
  "Kota Mataram": ["83111", "83112", "83113", "83114", "83115", "83116"],
  
  // Kupang (NTT)
  "Kupang": ["85111", "85112", "85113", "85114", "85115", "85116", "85117", "85118"],
  
  // Pontianak (Kalbar)
  "Pontianak": ["78111", "78112", "78113", "78114", "78115", "78116", "78117", "78118", "78119", "78121", "78122", "78123"],
  
  // Palangka Raya (Kalteng)
  "Palangka Raya": ["73111", "73112", "73113", "73114", "73115", "73116"],
  
  // Banjarmasin (Kalsel)
  "Banjarmasin": ["70111", "70112", "70113", "70114", "70115", "70116", "70117", "70118", "70119", "70121", "70122", "70123"],
  
  // Samarinda (Kaltim)
  "Samarinda": ["75111", "75112", "75113", "75114", "75115", "75116", "75117", "75118", "75119", "75121", "75122", "75123", "75124", "75125"],
  
  // Manado (Sulut)
  "Kota Manado": ["95111", "95112", "95113", "95114", "95115", "95116", "95117", "95118", "95119", "95121", "95122", "95123"],
  
  // Palu (Sulteng)
  "Palu": ["94111", "94112", "94113", "94114", "94115", "94116"],
  
  // Makassar (Sulsel)
  "Makassar": ["90111", "90112", "90113", "90114", "90115", "90116", "90117", "90118", "90119", "90121", "90122", "90123", "90124", "90125", "90126"],
  
  // Kendari (Sultra)
  "Kendari": ["93111", "93112", "93113", "93114", "93115", "93116"],
  
  // Ambon (Maluku)
  "Ambon": ["97111", "97112", "97113", "97114", "97115", "97116"],
  
  // Ternate (Malut)
  "Ternate": ["97711", "97712", "97713", "97714"],
  
  // Jayapura (Papua)
  "Jayapura": ["99111", "99112", "99113", "99114", "99115", "99116"],
  
  // Sorong (Papua Barat)
  "Kota Sorong": ["98411", "98412", "98413", "98414"],
};

/**
 * Get cities for a given province
 */
export const getCitiesByProvince = (province: string): string[] => {
  return CITIES_BY_PROVINCE[province] || [];
};

/**
 * Get districts for a given city
 */
export const getDistrictsByCity = (city: string): string[] => {
  return DISTRICTS_BY_CITY[city] || [];
};

/**
 * Get postal codes for a given city
 */
export const getPostalCodesByCity = (city: string): string[] => {
  return POSTAL_CODES_BY_CITY[city] || [];
};
