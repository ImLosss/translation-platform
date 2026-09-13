import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

const prisma = new PrismaClient({
  adapter,
});

// Data mentah glossary
const rawGlossaryData = {
    "REPLACE_AND_LEARN": [
        { "mandarin": "大墟", "translate_to": "Daxu", "detail": "nama tempat/fantasi" },
        { "mandarin": "祖训", "translate_to": "Instruksi Leluhur", "detail": "ajaran leluhur/aturan keluarga" },
        { "mandarin": "牧儿", "translate_to": "Mu'er", "detail": "nama panggilan karakter utama" },
        { "mandarin": "青龙", "translate_to": "Naga Biru", "detail": "makhluk spiritual/empat simbol" },
        { "mandarin": "白虎", "translate_to": "Harimau Putih", "detail": "makhluk spiritual/empat simbol" },
        { "mandarin": "朱雀", "translate_to": "Burung Merah", "detail": "makhluk spiritual/empat simbol" },
        { "mandarin": "玄武", "translate_to": "Kura-kura Hitam", "detail": "makhluk spiritual/empat simbol" },
        { "mandarin": "四灵", "translate_to": "Empat Spiritual", "detail": "empat makhluk simbolis" },
        { "mandarin": "灵血", "translate_to": "Darah Spiritual", "detail": "istilah kultivasi/energi" },
        { "mandarin": "青蛟蛇", "translate_to": "Ular Hijau", "detail": "keturunan makhluk spiritual" },
        { "mandarin": "铁骨虎", "translate_to": "Harimau Tulang Besi", "detail": "keturunan makhluk spiritual" },
        { "mandarin": "雷鸟", "translate_to": "Burung Guntur", "detail": "keturunan makhluk spiritual" },
        { "mandarin": "金龟", "translate_to": "Penyu Emas", "detail": "keturunan makhluk spiritual" },
        { "mandarin": "药师", "translate_to": "Guru Obat", "detail": "profesi/gelar" },
        { "mandarin": "神藏", "translate_to": "Tempat Surgawi", "detail": "istilah kultivasi/titik energi" },
        { "mandarin": "灵胎", "translate_to": "Janin Spiritual", "detail": "istilah kultivasi/tahap tubuh" },
        { "mandarin": "五曜", "translate_to": "Lima Cahaya", "detail": "istilah kultivasi/tahap" },
        { "mandarin": "六合", "translate_to": "Enam Penjuru", "detail": "istilah kultivasi/tahap" },
        { "mandarin": "七星", "translate_to": "Tujuh Bintang", "detail": "istilah kultivasi/tahap" },
        { "mandarin": "天人", "translate_to": "Makhluk Surgawi", "detail": "istilah kultivasi/tahap" },
        { "mandarin": "生死", "translate_to": "Hidup Mati", "detail": "istilah kultivasi/tahap" },
        { "mandarin": "神桥", "translate_to": "Jembatan Surgawi", "detail": "istilah kultivasi/tahap" },
        { "mandarin": "灵体", "translate_to": "Tubuh Spiritual", "detail": "istilah kultivasi/jenis tubuh" },
        { "mandarin": "元气", "translate_to": "Vitalitas", "detail": "energi kehidupan/kultivasi" },
        { "mandarin": "凡体", "translate_to": "Tubuh Fana", "detail": "istilah kultivasi/jenis tubuh" },
        { "mandarin": "霸体", "translate_to": "Tubuh Hegemonik", "detail": "istilah kultivasi/jenis tubuh khusus" },
        { "mandarin": "村长", "translate_to": "Kepala Desa", "detail": "jabatan desa" },
        { "mandarin": "屠夫", "translate_to": "Jagal", "detail": "profesi/gelar karakter" },
        { "mandarin": "马爷爷", "translate_to": "Kakek Ma", "detail": "nama panggilan karakter" },
        { "mandarin": "瘸子爷爷", "translate_to": "Kakek Pincang", "detail": "nama panggilan karakter" },
        { "mandarin": "聋子爷爷", "translate_to": "Kakek Tuli", "detail": "nama panggilan karakter" },
        { "mandarin": "瞎子爷爷", "translate_to": "Kakek Buta", "detail": "nama panggilan karakter" },
        { "mandarin": "哑巴爷爷", "translate_to": "Kakek Bisu", "detail": "nama panggilan karakter" },
        { "mandarin": "神通", "translate_to": "Kekuatan Magis", "detail": "istilah" },
        { "mandarin": "不好", "translate_to": "Gawat", "detail": "istilah" },
        { "mandarin": "刀法", "translate_to": "Ilmu Pedang", "detail": "istilah seni bela diri" },
        { "mandarin": "拳法", "translate_to": "Ilmu Tinju", "detail": "istilah seni bela diri" },
        { "mandarin": "雷音八式", "translate_to": "Delapan Gerakan Suara Guntur", "detail": "nama teknik bela diri" },
        { "mandarin": "千手禅尊", "translate_to": "Seribu Tangan sang Agung", "detail": "nama jurus/teknik" },
        { "mandarin": "导引功", "translate_to": "Teknik Pembimbing", "detail": "nama teknik" },
        { "mandarin": "魔影幻魔功", "translate_to": "Teknik Bayangan Ilusi Iblis", "detail": "nama teknik" },
        { "mandarin": "用法天芥子功", "translate_to": "Teknik Biji Peniru Langit", "detail": "nama teknik" },
        { "mandarin": "九转三证玄功", "translate_to": "Teknik Sembilan Putaran Tiga Pencerahan", "detail": "nama teknik" },
        { "mandarin": "漓江派", "translate_to": "Sekte Lijiang", "detail": "nama sekte/kelompok" },
        { "mandarin": "洪山派", "translate_to": "Sekte Gunung Hong", "detail": "nama sekte/kelompok" },
        { "mandarin": "剑法", "translate_to": "Teknik Pedang", "detail": "istilah seni bela diri" },
        { "mandarin": "剑图", "translate_to": "Pedang Diagram", "detail": "nama teknik/jurus" },
        { "mandarin": "造化天魔功", "translate_to": "Teknik Penciptaan Iblis Langit", "detail": "nama teknik/jurus" },
        { "mandarin": "造化天神功", "translate_to": "Teknik Penciptaan Dewa Langit", "detail": "nama teknik/jurus" },
        { "mandarin": "剑气", "translate_to": "Energi Pedang", "detail": "istilah energi bela diri" },
        { "mandarin": "剑式", "translate_to": "Gaya Pedang", "detail": "istilah teknik dasar pedang" },
        { "mandarin": "剑丸", "translate_to": "Bola Pedang", "detail": "artefak/alat bela diri" },
        { "mandarin": "禅宗", "translate_to": "Zen", "detail": "aliran/ajaran spiritual" },
        { "mandarin": "护法金刚", "translate_to": "Vajra Penjaga", "detail": "makhluk pelindung kuil" },
        { "mandarin": "仙清儿", "translate_to": "Xian Qing'er", "detail": "nama karakter" },
        { "mandarin": "都天魔王", "translate_to": "Raja Iblis Dutian", "detail": "nama karakter/gelar" },
        { "mandarin": "山贼", "translate_to": "Bandit Gunung", "detail": "istilah penjahat" },
        { "mandarin": "山神", "translate_to": "Dewa Gunung", "detail": "makhluk spiritual" },
        { "mandarin": "隙弃罗", "translate_to": "Khakkhara", "detail": "nama artefak/staf biksu" },
        { "mandarin": "大擂音宗", "translate_to": "Sekte Suara Guntur Agung", "detail": "nama sekte/kelompok" },
        { "mandarin": "宗主", "translate_to": "Ketua Sekte", "detail": "jabatan pemimpin sekte" },
        { "mandarin": "延康", "translate_to": "Yankang", "detail": "nama negara/tempat" },
        { "mandarin": "延康国", "translate_to": "Negara Yankang", "detail": "nama negara" },
        { "mandarin": "魔道", "translate_to": "Jalan Iblis", "detail": "aliran/ajaran kultivasi" },
        { "mandarin": "天魔教", "translate_to": "Kultus Iblis Langit", "detail": "nama sekte/kelompok" },
        { "mandarin": "天圣教", "translate_to": "Kultus Suci Langit", "detail": "nama sekte/kelompok" },
        { "mandarin": "教祖师", "translate_to": "Grandmaster Kultus", "detail": "jabatan pemimpin sekte" },
        { "mandarin": "剧变", "translate_to": "Perubahan Besar", "detail": "peristiwa penting" },
        { "mandarin": "刀枪不入", "translate_to": "kebal terhadap pedang dan tombak", "detail": "istilah kekebalan fisik" },
        { "mandarin": "水火不侵", "translate_to": "kebal terhadap air dan api", "detail": "istilah kekebalan fisik" },
        { "mandarin": "百毒不近", "translate_to": "tidak bisa diracuni", "detail": "istilah kekebalan fisik" },
        { "mandarin": "神祇", "translate_to": "Dewa", "detail": "istilah makhluk spiritual" },
        { "mandarin": "神谕", "translate_to": "Orakel", "detail": "wahyu/amanat dewa" },
        { "mandarin": "国师", "translate_to": "Penasihat", "detail": "jabatan penasihat negara" },
        { "mandarin": "宗派", "translate_to": "Sekte", "detail": "kelompok/organisasi kultivasi" },
        { "mandarin": "圣典", "translate_to": "Kitab Suci", "detail": "kitab ajaran utama" },
        { "mandarin": "圣教", "translate_to": "Kultus Suci", "detail": "nama sekte/ajaran" },
        { "mandarin": "牵魂引", "translate_to": "Penarik Jiwa", "detail": "nama kitab" },
        { "mandarin": "巫教", "translate_to": "Kultus Penyihir", "detail": "nama sekte/ajaran" },
        { "mandarin": "圣人之道", "translate_to": "Tao Orang Suci", "detail": "ajaran utama/filosofi" },
        { "mandarin": "异端", "translate_to": "ajaran sesat", "detail": "istilah ajaran menyimpang" },
        { "mandarin": "正道", "translate_to": "Tao yang benar", "detail": "ajaran utama/benar" },
        { "mandarin": "三百六十堂", "translate_to": "360 Aula", "detail": "nama organisasi/kelompok" },
        { "mandarin": "雨堂", "translate_to": "Aula Hujan", "detail": "nama aula/kelompok" },
        { "mandarin": "工堂", "translate_to": "Aula Kerja", "detail": "nama aula/kelompok" },
        { "mandarin": "功法", "translate_to": "cara kultivasi", "detail": "istilah teknik kultivasi" },
        { "mandarin": "修行之道", "translate_to": "jalan kultivasi", "detail": "istilah umum kultivasi" },
        { "mandarin": "尸仙教", "translate_to": "Kultus Mayat Abadi", "detail": "nama sekte/kelompok" },
        { "mandarin": "九幽门", "translate_to": "Sekte Jiuyou", "detail": "nama sekte/kelompok" },
        { "mandarin": "驭龙门", "translate_to": "Sekte Yulong", "detail": "nama sekte/kelompok" },
        { "mandarin": "县令", "translate_to": "Bupati", "detail": "jabatan pemerintahan lokal" },
        { "mandarin": "丽州府", "translate_to": "Prefektur Lizhou", "detail": "nama wilayah administratif" },
        { "mandarin": "锦娘", "translate_to": "Jin Niang", "detail": "nama karakter" },
        { "mandarin": "真元炮", "translate_to": "Meriam Esensi Sejati", "detail": "nama senjata/artefak" },
        { "mandarin": "狐灵儿", "translate_to": "Hu Ling'er", "detail": "nama karakter" },
        { "mandarin": "虞渊初雨", "translate_to": "Yuyuan Chuyu", "detail": "nama karakter" },
        { "mandarin": "御风", "translate_to": "Kendarai angin", "detail": "teknik terbang/melaju dengan angin" },
        { "mandarin": "杀猪刀", "translate_to": "Pisau Pembunuh Babi", "detail": "nama senjata" },
        { "mandarin": "飞僵", "translate_to": "Mayat Terbang", "detail": "makhluk undead/istilah kultivasi" },
        { "mandarin": "符篆", "translate_to": "Jimat", "detail": "alat sihir/artefak" },
        { "mandarin": "尸毒", "translate_to": "Racun Mayat", "detail": "racun khusus dari mayat" },
        { "mandarin": "行尸走肉", "translate_to": "mayat berjalan", "detail": "makhluk undead/zombie" },
        { "mandarin": "控剑术", "translate_to": "Teknik Pengontrol Pedang", "detail": "nama teknik bela diri" },
        { "mandarin": "黄表纸", "translate_to": "kertas kuning", "detail": "media jimat/mantra" },
        { "mandarin": "符箓", "translate_to": "jimat", "detail": "media jimat/mantra" },
        { "mandarin": "法术", "translate_to": "mantra", "detail": "istilah sihir" },
        { "mandarin": "圣女", "translate_to": "Gadis Suci", "detail": "jabatan wanita suci" },
        { "mandarin": "青霄天眼", "translate_to": "Mata Langit Qingxiao", "detail": "nama teknik" },
        { "mandarin": "花巷神医", "translate_to": "Tabib Jalan Bunga", "detail": "julukan" },
        { "mandarin": "千机毒", "translate_to": "Racun Seribu Mekanisme", "detail": "istilah" },
        { "mandarin": "药理", "translate_to": "farmakologi", "detail": "istilah" },
        { "mandarin": "神化", "translate_to": "Wujud Dewa", "detail": "istilah" },
        { "mandarin": "小神医", "translate_to": "Tabib Jenius Muda", "detail": "istila/gelar" },
        { "mandarin": "玉面毒王", "translate_to": "Raja Racun Berwajah Giok", "detail": "istilah/gelar" },
        { "mandarin": "乾天王", "translate_to": "Raja Langit Qian", "detail": "istilah/gelar" },
        { "mandarin": "如莱", "translate_to": "Rulai", "detail": "istilah/gelar" },
        { "mandarin": "陆天王", "translate_to": "Raja Langit Lu", "detail": "istilah/gelar" },
        { "mandarin": "小毒王", "translate_to": "Raja Racun Kecil", "detail": "istilah/gelar" },
        { "mandarin": "太后", "translate_to": "Ibu Suri", "detail": "istilah/gelar" },
        { "mandarin": "玉郎君", "translate_to": "Tuan Giok", "detail": "istilah/gelar" },
        { "mandarin": "含光殿", "translate_to": "Aula Hanguang", "detail": "istilah" },
        { "mandarin": "剑学之殿", "translate_to": "Aula Ilmu Pedang", "detail": "istilah" },
        { "mandarin": "土子居", "translate_to": "Asrama Murid", "detail": "istilah" },
        { "mandarin": "千尊塔", "translate_to": "Menara Seribu Patung", "detail": "istilah" },
        { "mandarin": "大师兄", "translate_to": "Kakak Senior", "detail": "panggilan" },
        { "mandarin": "师兄", "translate_to": "Senior", "detail": "panggilan" },
        { "mandarin": "师弟", "translate_to": "Adik", "detail": "panggilan" },
        { "mandarin": "穷夫子", "translate_to": "Guru Qiong", "detail": "panggilan" },
        { "mandarin": "师父", "translate_to": "Guru", "detail": "panggilan" },
        { "mandarin": "秦爱卿", "translate_to": "Menteri Qin", "detail": "panggilan" },
        { "mandarin": "天录楼", "translate_to": "Menara Tianlu", "detail": "nama tempat" },
        { "mandarin": "南疆", "translate_to": "Perbatasan Selatan", "detail": "nama tempat" },
        { "mandarin": "大襄城", "translate_to": "Kota Daxiang", "detail": "nama tempat" },
        { "mandarin": "狼居胥国", "translate_to": "Negara Langjuxu", "detail": "nama negara" },
        { "mandarin": "太学院", "translate_to": "Akademi Agung", "detail": "institusi pendidikan kultivasi" },
        { "mandarin": "皇子苑", "translate_to": "Asrama Pangeran", "detail": "asrama bangsawan di Akademi Agung" },
        { "mandarin": "道子", "translate_to": "Murid Tao", "detail": "gelar murid inti Sekte Tao" },
        { "mandarin": "偷天神腿", "translate_to": "Teknik Kaki Mencuri Langit", "detail": "nama teknik/jurus" },
        { "mandarin": "剑出开皇", "translate_to": "Pedang Kaihuang", "detail": "nama teknik/jurus" },
         { "mandarin": "落日剑法", "translate_to": "Pedang Matahari Terbenam", "detail": "nama teknik/jurus" },
        { "mandarin": "云踪雀影", "translate_to": "Bayangan Burung Awan", "detail": "nama teknik gerakan" },
        { "mandarin": "四象战阵", "translate_to": "Formasi Empat Simbol", "detail": "formasi/jurus kelompok" },
        { "mandarin": "百魔图", "translate_to": "Gambar Seratus Iblis", "detail": "nama artefak/teknik" },
        { "mandarin": "阴阳道眼", "translate_to": "Mata Tao Yin-Yang", "detail": "nama teknik mata" },
        { "mandarin": "振威校尉", "translate_to": "Komandan Zhenwei", "detail": "jabatan militer pangkat enam" },
        { "mandarin": "肥七", "translate_to": "Gemuk Ketujuh", "detail": "julukan/nama panggilan karakter" },
        { "mandarin": "丹阳子", "translate_to": "Danyangzi", "detail": "nama karakter" },
        { "mandarin": "林轩", "translate_to": "Lin Xuan", "detail": "nama karakter" },
        { "mandarin": "昆子羽", "translate_to": "Kun Ziyu", "detail": "nama karakter" },
        { "mandarin": "毓秀", "translate_to": "Yuxiu", "detail": "nama karakter" },
        { "mandarin": "秦兄弟", "translate_to": "Saudara Qin", "detail": "nama panggilan karakter" },
        { "mandarin": "九龙帝王功", "translate_to": "Teknik Kaisar Sembilan Naga", "detail": "jurus keluarga kekaisaran" },
        { "mandarin": "五龙绞杀", "translate_to": "Lima Naga Mencekik", "detail": "sub-jurus Kaisar Sembilan Naga" },
        { "mandarin": "先天太玄功", "translate_to": "Teknik Bawaan Tai Xuan", "detail": "jurus inti Sekte Tao" },
        { "mandarin": "大六合剑法", "translate_to": "Ilmu Pedang Enam Penjuru Agung", "detail": "pedang ciptaan Penasihat Negara" },
        { "mandarin": "绕剑式", "translate_to": "Jurus Mengelilingi Pedang", "detail": "jurus variasi pedang" },
        { "mandarin": "剑气无垠", "translate_to": "Energi Pedang Tak Terbatas", "detail": "jurus energi pedang" },
        { "mandarin": "元气丝", "translate_to": "Benang Energi", "detail": "istilah" },
        { "mandarin": "山人", "translate_to": "Petapa", "detail": "istilah" },
        { "mandarin": "大祭酒", "translate_to": "Pemimpin Besar", "detail": "gelar/jabatan" },
        { "mandarin": "太子少保", "translate_to": "Pembimbing Putra Mahkota", "detail": "gelar/jabatan" },
        { "mandarin": "灵玉书", "translate_to": "Ling Yushu", "detail": "nama karakter, Pangeran Kedua Yankang" },
        { "mandarin": "延康国二皇子", "translate_to": "Pangeran Kedua Yankang", "detail": "gelar pangeran" },
        { "mandarin": "五品游骑将军", "translate_to": "Jenderal Kavaleri Tingkat Lima", "detail": "jabatan militer" },
        { "mandarin": "孝义将军", "translate_to": "Jenderal Xiaoyi", "detail": "jabatan militer" },
        { "mandarin": "帅", "translate_to": "Panglima", "detail": "jabatan militer" },
        { "mandarin": "副将", "translate_to": "Wakil Jenderal", "detail": "jabatan militer" },
        { "mandarin": "将", "translate_to": "Jenderal", "detail": "jabatan militer" },
        { "mandarin": "副统领", "translate_to": "Wakil Komandan", "detail": "jabatan militer" },
        { "mandarin": "统领", "translate_to": "Komandan", "detail": "jabatan militer" },
        { "mandarin": "统队", "translate_to": "Kapten Pasukan", "detail": "jabatan militer" },
        { "mandarin": "凌云道人", "translate_to": "Pendeta Lingyun", "detail": "nama tokoh" },
        { "mandarin": "天子门生", "translate_to": "Murid Istana", "detail": "gelar kehormatan dari kaisar" },
        { "mandarin": "中散大夫", "translate_to": "Pejabat Kehormatan Istana", "detail": "jabatan" },
        { "mandarin": "霸山祭酒", "translate_to": "Pemimpin Bashan", "detail": "jabatan" },
        { "mandarin": "少教主", "translate_to": "Pemimpin Muda", "detail": "istilah" },
        { "mandarin": "机关像", "translate_to": "Boneka Mekanis", "detail": "istilah" },
        { "mandarin": "沈施主", "translate_to": "Tuan Shen", "detail": "panggilan" },
        { "mandarin": "青牛", "translate_to": "Sapi Hijau", "detail": "panggilan" },
        { "mandarin": "禅子", "translate_to": "Murid Zen", "detail": "istilah/gelar" },
        { "mandarin": "长老", "translate_to": "Tetua", "detail": "jabatan" },
        { "mandarin": "大育天魔经", "translate_to": "Kitab Ajaran Iblis Langit", "detail": "istilah" },
        { "mandarin": "一大一统功法", "translate_to": "Teknik Penyatuan", "detail": "nama teknik" },
        { "mandarin": "镇星君地侯真功", "translate_to": "Teknik Sejati Dewa Bintang Penguasa Bumi", "detail": "nama teknik" },
        { "mandarin": "楼兰黄金宫", "translate_to": "Istana Emas Loulan", "detail": "nama tempat" },
        { "mandarin": "灵宝不动禅功", "translate_to": "Teknik Zen Harta Roh Tak Tergoyahkan", "detail": "nama teknik" },
        { "mandarin": "失迷香", "translate_to": "Dupa Pelumpuh", "detail": "nama obat/racun" },
        { "mandarin": "丹方", "translate_to": "resep obat", "detail": "istilah" },
        { "mandarin": "禅法", "translate_to": "Ajaran Zen", "detail": "istilah" },
        { "mandarin": "圣地", "translate_to": "Tempat Suci", "detail": "istilah" },
        { "mandarin": "心魔", "translate_to": "Iblis hati", "detail": "istilah" },
        { "mandarin": "人皇印", "translate_to": "Segel Kaisar Manusia", "detail": "istilah" },
        { "mandarin": "灵兵", "translate_to": "Prajurit Spiritual", "detail": "istilah" },
        { "mandarin": "武可汗", "translate_to": "Penguasa Perang", "detail": "gelar" },
        { "mandarin": "天可汗", "translate_to": "Penguasa Langit", "detail": "gelar" },
        { "mandarin": "天刀", "translate_to": "Pedang Langit", "detail": "gelar" },
        { "mandarin": "大巫", "translate_to": "Penyihir Agung", "detail": "gelar" },
        { "mandarin": "巫尊", "translate_to": "Tuan Penyihir Agung", "detail": "gelar/jabatan" },
        { "mandarin": "大尊", "translate_to": "Yang Mulia Agung", "detail": "gelar/jabatan" },
        { "mandarin": "教主", "translate_to": "Pemimpin Kultus", "detail": "gelar/jabatan" },
        { "mandarin": "圣教主", "translate_to": "Pemimpin Kultus Suci", "detail": "gelar/jabatan" },
        { "mandarin": "魔神", "translate_to": "Dewa Iblis", "detail": "gelar/jabatan" },
        { "mandarin": "圣人", "translate_to": "Orang Suci", "detail": "gelar" },
        { "mandarin": "四钱", "translate_to": "13 gram", "detail": "satuan ukuran" },
        { "mandarin": "一两六钱", "translate_to": "50 gram", "detail": "satuan ukuran" },
        { "mandarin": "无忧乡", "translate_to": "Tanah Wuyou", "detail": "nama tempat" },
        { "mandarin": "传送法门", "translate_to": "Teknik Teleportasi", "detail": "istilah teknik" },
        { "mandarin": "多面空间封禁术", "translate_to": "Teknik Segel Ruang Multidimensi", "detail": "istilah teknik" },
        { "mandarin": "太学博士", "translate_to": "Doktor Akademi Agung", "detail": "gelar" },
        { "mandarin": "匪盗", "translate_to": "Perompak", "detail": "istilah" },
        { "mandarin": "龙麒麟", "translate_to": "Naga Qilin", "detail": "makhluk mitologi" },
        { "mandarin": "太玄算经", "translate_to": "Kitab Numerologi Agung", "detail": "istilah" },
        { "mandarin": "如莱大乘经", "translate_to": "Kitab Mahayana Rulai", "detail": "istilah" },
        { "mandarin": "朝廷", "translate_to": "Istana", "detail": "istilah" },
        { "mandarin": "少保剑", "translate_to": "Pedang Shaobao", "detail": "nama benda" },
        { "mandarin": "传送旗", "translate_to": "Panji Teleportasi", "detail": "nama benda" },
        { "mandarin": "千幢塔", "translate_to": "Menara Seribu Tingkat", "detail": "nama benda" },
        { "mandarin": "一升", "translate_to": "1 liter", "detail": "satuan ukuran" },
        { "mandarin": "田真君", "translate_to": "Petapa Tian", "detail": "panggilan/gelar" },
        { "mandarin": "长耳禅师", "translate_to": "Biksu Chang'er", "detail": "panggilan/gelar" },
        { "mandarin": "李散人", "translate_to": "Petapa Li", "detail": "panggilan/gelar" },
        { "mandarin": "禅师", "translate_to": "Biksu", "detail": "gelar" },
        { "mandarin": "调鬼遣神符字令", "translate_to": "Jimat Pemanggilan Arwah dan Dewa", "detail": "istilah" }
    ]
}

async function main() {
  // 1. Buat atau update admin user
  const password = await bcrypt.hash('123456', 10);
  const adminUser = await prisma.user.upsert({
    where: {
      email: 'admin@example.com',
    },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: password,
      role: 'ADMIN',
      provider: 'LOCAL',
    },
  });
  console.log(`User ${adminUser.email} disiapkan.`);

  // 2. Persiapkan data entries ke format database
  const entriesToInsert: { source: string; target: string; detail?: string | null }[] = [];

  // for (const item of rawGlossaryData.LIST_CULTIVATION as any[]) {
  //   let mainDetail = 'Tingkat Kultivasi';

  //   // Jika 'details' adalah string, timpa atau gabungkan ke mainDetail
  //   if (typeof item.detail === 'string') {
  //     mainDetail = item.detail;
  //   }

  //   // Masukkan data utama
  //   entriesToInsert.push({
  //     source: item.mandarin,
  //     target: item.replace,
  //     detail: mainDetail,
  //   });

  //   // Cek jika ada sub-tahapan di properti 'tahap' (Format Lama)
  //   if (item.tahap && Array.isArray(item.tahap)) {
  //     for (const subItem of item.tahap) {
  //       entriesToInsert.push({
  //         source: subItem.mandarin,
  //         target: subItem.replace,
  //         detail: 'Sub-tingkat Kultivasi',
  //       });
  //     }
  //   }

  //   // Cek jika ada sub-tahapan di properti 'details' (Format Baru)
  //   if (item.details && Array.isArray(item.details)) {
  //     for (const subItem of item.details) {
  //       let subDetail = 'Sub-tingkat Kultivasi';
        
  //       // Jika ada properti gelar tambahan, masukkan ke dalam detail
  //       if (subItem.gelar) {
  //         subDetail += ` | Gelar: ${subItem.gelar}`;
  //       }

  //       entriesToInsert.push({
  //         source: subItem.mandarin,
  //         target: subItem.replace,
  //         detail: subDetail,
  //       });
  //     }
  //   }
  // }

  // Proses array REPLACE_AND_LEARN
  for (const item of rawGlossaryData.REPLACE_AND_LEARN) {
    entriesToInsert.push({
      source: item.mandarin,
      target: item.translate_to,
      detail: item.detail,
    });
  }

  // 3. Buat atau cek Glossary "Tales of Herding Gods"
  let glossary = await prisma.glossary.findFirst({
    where: { name: 'Tales of Herding Gods' },
  });

  if (!glossary) {
    glossary = await prisma.glossary.create({
      data: {
        name: 'Tales of Herding Gods',
        sourceLanguage: 'zh',
        targetLanguage: 'id',
        userId: adminUser.id,
      },
    });
    console.log('Glossary "Tales of Herding Gods" dibuat.');
  } else {
    // Opsional: Hapus entry lama supaya tidak dobel jika di-seed ulang
    await prisma.glossaryEntry.deleteMany({
      where: { glossaryId: glossary.id },
    });
    console.log('Entry lama dihapus untuk menghindari duplikasi.');
  }

  // 4. Masukkan Glossary Entries secara massal (bulk insert)
  await prisma.glossaryEntry.createMany({
    data: entriesToInsert.map((e) => ({
      source: e.source,
      target: e.target,
      detail: e.detail ?? null,
      glossaryId: glossary!.id,
    })),
  });

  console.log(`Berhasil menyisipkan ${entriesToInsert.length} istilah ke dalam glossary "Tales of Herding Gods".`);
  console.log('Seeder selesai');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });