// Data kecamatan dan kode pos yang lebih lengkap untuk kota-kota di Indonesia

// Data kecamatan/distrik yang diperluas
export const extendedDistrictsByCity: Record<string, string[]> = {
  // Jakarta
  "Kota Jakarta Pusat": [
    "Gambir", "Tanah Abang", "Menteng", "Senen", "Cempaka Putih", "Johar Baru", "Kemayoran", "Sawah Besar"
  ],
  "Kota Jakarta Utara": [
    "Penjaringan", "Pademangan", "Tanjung Priok", "Koja", "Cilincing", "Kelapa Gading"
  ],
  "Kota Jakarta Barat": [
    "Cengkareng", "Grogol Petamburan", "Taman Sari", "Tambora", "Kebon Jeruk", "Kalideres", "Palmerah"
  ],
  "Kota Jakarta Selatan": [
    "Kebayoran Baru", "Kebayoran Lama", "Pasar Minggu", "Cilandak", "Jagakarsa", "Pesanggrahan", 
    "Mampang Prapatan", "Setiabudi", "Tebet"
  ],
  "Kota Jakarta Timur": [
    "Matraman", "Pulogadung", "Jatinegara", "Kramatjati", "Pasar Rebo", "Cakung", "Duren Sawit", "Makasar"
  ],
  
  // Bandung
  "Kota Bandung": [
    "Andir", "Antapani", "Arcamanik", "Astanaanyar", "Babakan Ciparay", "Bandung Kidul", "Bandung Kulon",
    "Bandung Wetan", "Batununggal", "Bojongloa Kaler", "Bojongloa Kidul", "Buahbatu", "Cibeunying Kaler",
    "Cibeunying Kidul", "Cibiru", "Cicendo", "Cidadap", "Cinambo", "Coblong", "Gedebage", "Kiaracondong",
    "Lengkong", "Mandalajati", "Panyileukan", "Rancasari", "Regol", "Sukajadi", "Sukasari", "Sumur Bandung",
    "Ujung Berung"
  ],
  
  // Surabaya
  "Kota Surabaya": [
    "Asemrowo", "Benowo", "Bubutan", "Bulak", "Dukuh Pakis", "Gayungan", "Genteng", "Gubeng", "Gununganyar",
    "Jambangan", "Karangpilang", "Kenjeran", "Krembangan", "Lakarsantri", "Mulyorejo", "Pabean Cantian",
    "Pakal", "Rungkut", "Sambikerep", "Sawahan", "Semampir", "Simokerto", "Sukolilo", "Sukomanunggal",
    "Tambaksari", "Tandes", "Tegalsari", "Tenggilis Mejoyo", "Wiyung", "Wonocolo", "Wonokromo"
  ],
  
  // Medan
  "Kota Medan": [
    "Medan Amplas", "Medan Area", "Medan Barat", "Medan Baru", "Medan Belawan", "Medan Deli", "Medan Denai",
    "Medan Helvetia", "Medan Johor", "Medan Kota", "Medan Labuhan", "Medan Maimun", "Medan Marelan",
    "Medan Perjuangan", "Medan Petisah", "Medan Polonia", "Medan Selayang", "Medan Sunggal", "Medan Tembung",
    "Medan Timur", "Medan Tuntungan"
  ],
  
  // Makassar
  "Kota Makassar": [
    "Biring Kanaya", "Bontoala", "Makassar", "Mamajang", "Manggala", "Mariso", "Panakkukang", "Rappocini",
    "Tallo", "Tamalanrea", "Tamalate", "Ujung Pandang", "Ujung Tanah", "Wajo"
  ],
  
  // Denpasar
  "Kota Denpasar": [
    "Denpasar Barat", "Denpasar Selatan", "Denpasar Timur", "Denpasar Utara"
  ],
  
  // Semarang
  "Kota Semarang": [
    "Banyumanik", "Candisari", "Gajahmungkur", "Gayamsari", "Genuk", "Gunungpati", "Mijen", "Ngaliyan",
    "Pedurungan", "Semarang Barat", "Semarang Selatan", "Semarang Tengah", "Semarang Timur", "Semarang Utara",
    "Tembalang", "Tugu"
  ],
  
  // Yogyakarta
  "Kota Yogyakarta": [
    "Danurejan", "Gedongtengen", "Gondokusuman", "Gondomanan", "Jetis", "Kotagede", "Kraton", "Mantrijeron",
    "Mergangsan", "Ngampilan", "Pakualaman", "Tegalrejo", "Umbulharjo", "Wirobrajan"
  ],
  
  // Palembang
  "Kota Palembang": [
    "Alang-alang Lebar", "Bukit Kecil", "Gandus", "Ilir Barat I", "Ilir Barat II", "Ilir Timur I",
    "Ilir Timur II", "Jakabaring", "Kalidoni", "Kemuning", "Kertapati", "Plaju", "Sako", "Seberang Ulu I",
    "Seberang Ulu II", "Sematang Borang", "Sukarami"
  ]
};

// Data kode pos yang diperluas
export const extendedPostalCodesByCity: Record<string, string[]> = {
  // Jakarta
  "Kota Jakarta Pusat": ["10110", "10120", "10130", "10140", "10150", "10160", "10170", "10180", "10190"],
  "Kota Jakarta Utara": ["14110", "14120", "14130", "14140", "14150", "14160", "14170", "14180", "14190"],
  "Kota Jakarta Barat": ["11110", "11120", "11130", "11140", "11150", "11160", "11170", "11180", "11190"],
  "Kota Jakarta Selatan": ["12110", "12120", "12130", "12140", "12150", "12160", "12170", "12180", "12190"],
  "Kota Jakarta Timur": ["13110", "13120", "13130", "13140", "13150", "13160", "13170", "13180", "13190"],
  
  // Bandung
  "Kota Bandung": [
    "40111", "40112", "40113", "40114", "40115", "40116", "40117", "40118", "40119",
    "40121", "40122", "40123", "40124", "40125", "40126", "40127", "40128", "40129",
    "40131", "40132", "40133", "40134", "40135", "40136", "40137", "40138", "40139",
    "40141", "40142", "40143", "40144", "40145", "40146", "40147", "40148", "40149"
  ],
  
  // Surabaya
  "Kota Surabaya": [
    "60111", "60112", "60113", "60114", "60115", "60116", "60117", "60118", "60119",
    "60121", "60122", "60123", "60124", "60125", "60126", "60127", "60128", "60129",
    "60131", "60132", "60133", "60134", "60135", "60136", "60137", "60138", "60139",
    "60141", "60142", "60143", "60144", "60145", "60146", "60147", "60148", "60149",
    "60151", "60152", "60153", "60154", "60155", "60156", "60157", "60158", "60159"
  ],
  
  // Medan
  "Kota Medan": [
    "20111", "20112", "20113", "20114", "20115", "20116", "20117", "20118", "20119",
    "20121", "20122", "20123", "20124", "20125", "20126", "20127", "20128", "20129",
    "20131", "20132", "20133", "20134", "20135", "20136", "20137", "20138", "20139",
    "20141", "20142", "20143", "20144", "20145", "20146", "20147", "20148", "20149"
  ],
  
  // Makassar
  "Kota Makassar": [
    "90111", "90112", "90113", "90114", "90115", "90116", "90117", "90118", "90119",
    "90121", "90122", "90123", "90124", "90125", "90126", "90127", "90128", "90129",
    "90131", "90132", "90133", "90134", "90135", "90136", "90137", "90138", "90139"
  ],
  
  // Denpasar
  "Kota Denpasar": ["80211", "80221", "80231", "80241", "80251", "80261", "80271", "80281"],
  
  // Semarang
  "Kota Semarang": [
    "50111", "50112", "50113", "50114", "50115", "50116", "50117", "50118", "50119",
    "50121", "50122", "50123", "50124", "50125", "50126", "50127", "50128", "50129",
    "50131", "50132", "50133", "50134", "50135", "50136", "50137", "50138", "50139"
  ],
  
  // Yogyakarta
  "Kota Yogyakarta": [
    "55111", "55121", "55131", "55141", "55151", "55161", "55171", "55181", "55191",
    "55211", "55221", "55231", "55241", "55251", "55261", "55271", "55281", "55291"
  ],
  
  // Palembang
  "Kota Palembang": [
    "30111", "30112", "30113", "30114", "30115", "30116", "30117", "30118", "30119",
    "30121", "30122", "30123", "30124", "30125", "30126", "30127", "30128", "30129",
    "30131", "30132", "30133", "30134", "30135", "30136", "30137", "30138", "30139"
  ]
};

// Gabungkan data extended dengan data default
export const getExtendedDistrictsByCity = (city: string): string[] => {
  return extendedDistrictsByCity[city] || [];
};

export const getExtendedPostalCodesByCity = (city: string): string[] => {
  return extendedPostalCodesByCity[city] || [];
};