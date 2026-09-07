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
  LIST_CULTIVATION: [
    { mandarin: '学员', replace: 'Student' },
    { mandarin: '学徒级', replace: 'Apprentice' },
    { mandarin: '行星级', replace: 'Star Traveler' },
    { mandarin: '恒星级', replace: 'Stellar' },
    { mandarin: '宇宙级', replace: 'Universe' },
    { mandarin: '域主级', replace: 'Domain Master' },
    { mandarin: '界主级', replace: 'World Master' },
    {
      mandarin: '不朽',
      replace: 'Undying',
      tahap: [
        { mandarin: '不朽军主', replace: 'Lord' },
        { mandarin: '封侯不朽', replace: 'Marquis' },
        { mandarin: '封王不朽', replace: 'King' },
      ],
    },
    {
      mandarin: '宇宙尊者',
      replace: 'Universe Venerable',
      tahap: [
        { mandarin: '宇宙高等尊者', replace: 'Elementary Intermediate Advanced' },
        { mandarin: '宇宙霸主', replace: 'Universe Overlord' },
        { mandarin: '顶尖宇宙霸主', replace: 'Apex Universe Overlord' },
      ],
    },
    { mandarin: '宇宙之主', replace: 'Universe Master' },
    { mandarin: '真神/宇宙最强者', replace: 'True God' },
    { mandarin: '虚空真神', replace: 'Void True God' },
    { mandarin: '永恒真神', replace: 'Eternal True God' },
    { mandarin: '混沌主宰', replace: 'Lord of Chaos' },
    { mandarin: '神王', replace: 'God King' },
  ],
  REPLACE_AND_LEARN: [
    { mandarin: '乾巫宇宙国', translate_to: 'Kerajaan Alam Semesta Qianwu', detail: 'nama wilayah' },
    { mandarin: '监察特使', translate_to: 'Utusan Inspeksi Khusus', detail: 'jabatan' },
    { mandarin: '姬青', translate_to: 'Ji Qing', detail: 'nama karakter' },
    { mandarin: '迪伦', translate_to: 'Dilun', detail: 'nama karakter' },
    { mandarin: '罗峰', translate_to: 'Luo Feng', detail: 'nama karakter' },
    { mandarin: '真衍王', translate_to: 'Raja Zhenyan', detail: 'nama karakter' },
    { mandarin: '血兽王', translate_to: 'Raja Binatang Darah', detail: 'nama karakter' },
    { mandarin: '重箭王', translate_to: 'Raja Panah Berat', detail: 'nama karakter' },
    { mandarin: '魄瑜侯', translate_to: 'Poyu Hou', detail: 'nama karakter/jabatan' },
    { mandarin: '银雪侯', translate_to: 'Yin Xuehou', detail: 'nama karakter/jabatan' },
    { mandarin: '拉布利亚星域', translate_to: 'Domain Lablya', detail: 'nama wilayah' },
    { mandarin: '金角族', translate_to: 'Ras Golden Horn', detail: 'nama ras' },
    { mandarin: '幻灵王', translate_to: 'Raja Huanling', detail: 'nama karakter' },
    { mandarin: '魅族', translate_to: 'Ras Spirit Devil', detail: 'nama ras' },
    { mandarin: '混元单位', translate_to: 'Hunyuan', detail: 'mata uang' },
    { mandarin: '垃圾星域', translate_to: 'Domain Sampah', detail: 'nama wilayah' },
    { mandarin: '武部', translate_to: 'Divisi Ksatria', detail: 'nama divisi' },
    { mandarin: '洪', translate_to: 'Hong', detail: 'nama karakter' },
    { mandarin: '卑状', translate_to: 'Benzer', detail: 'nama karakter' },
    { mandarin: '血武者', translate_to: 'Ksatria Darah', detail: 'istilah/pejuang' },
    { mandarin: '血洛之力', translate_to: 'Kekuatan Darah', detail: 'istilah/teknik' },
    { mandarin: '圣碑', translate_to: 'Nisan Suci', detail: 'istilah/benda suci' },
    { mandarin: '人族', translate_to: 'Ras Manusia', detail: 'nama ras' },
    { mandarin: '塔文部', translate_to: 'Suku Tawen', detail: 'nama suku' },
    { mandarin: '兽神峡谷', translate_to: 'Lembah Dewa Binatang', detail: 'nama tempat' },
    { mandarin: '倾峰界', translate_to: 'Alam Qinfeng', detail: 'nama tempat' },
    { mandarin: '残图', translate_to: 'Peta Sisa', detail: 'istilah' },
    { mandarin: '碎片', translate_to: 'Pecahan', detail: 'istilah' },
    { mandarin: '兽神雕像', translate_to: 'Patung Dewa Binatang', detail: 'nama benda' },
    { mandarin: '希罗多元老', translate_to: 'Patriark Tua Silord', detail: 'nama jabatan/karakter' },
    { mandarin: '巴巴塔', translate_to: 'Babata', detail: 'nama karakter' },
    { mandarin: '魔杀族', translate_to: 'Ras Demon Killer', detail: 'nama ras' },
    { mandarin: '金角巨兽', translate_to: 'Golden Horned Behemoth', detail: 'nama makhluk' },
    { mandarin: '世界树', translate_to: 'Pohon Dunia', detail: 'nama makhluk' },
    { mandarin: '天狼', translate_to: 'Serigala Langit', detail: 'nama makhluk' },
    { mandarin: '银眸', translate_to: 'Mata Perak', detail: 'nama makhluk' },
    { mandarin: '噬魂兽', translate_to: 'Binatang Pemakan Jiwa', detail: 'nama makhluk' },
    { mandarin: '拉斯奥大陆', translate_to: 'Daratan Lasao', detail: 'nama tempat' },
    { mandarin: '魔烛王', translate_to: 'Raja Mozhu', detail: 'nama karakter' },
    { mandarin: '蚀火尊者', translate_to: 'Venerable Shihuo', detail: 'nama karakter/jabatan' },
    { mandarin: '九剑尊者', translate_to: 'Venerable Jiu Jian', detail: 'nama karakter/jabatan' },
    { mandarin: '珑玉王', translate_to: 'Raja Longyu', detail: 'nama karakter' },
    { mandarin: '维尼安', translate_to: 'Winea', detail: 'nama karakter' },
    { mandarin: '不朽晶', translate_to: 'Kristal Undying', detail: 'istilah/benda' },
    { mandarin: '宇宙最强者', translate_to: 'True God', detail: 'istilah kultivasi' },
    { mandarin: '第九星域牢狱', translate_to: 'Penjara Domain Bintang Kesembilan', detail: 'nama tempat' },
    { mandarin: '纪元', translate_to: 'Era', detail: 'istilah/waktu' },
    { mandarin: '神国传送', translate_to: 'Teleportasi Kerajaan Dewa', detail: 'istilah/teknik' },
    { mandarin: '神国', translate_to: 'Kerajaan Dewa', detail: 'istilah' },
    { mandarin: '冰狱巨头', translate_to: 'Penguasa Penjara Es', detail: 'istilah' },
    { mandarin: '世界戒', translate_to: 'Cincin Dunia', detail: 'istilah' },
    { mandarin: '虚拟宇宙公司', translate_to: 'Perusahaan Alam Semesta Virtual', detail: 'nama organisasi' },
    { mandarin: '黑龙山', translate_to: 'Black Dragon Mountain', detail: 'nama organisasi' },
    { mandarin: '银河系', translate_to: 'Galaksi Bima Sakti', detail: 'nama wilayah' },
    { mandarin: '火焰法则', translate_to: 'Hukum Api', detail: 'istilah/konsep' },
    { mandarin: '陨墨星', translate_to: 'Planet Meteorit', detail: 'istilah' },
    { mandarin: '碑', translate_to: 'Monumen', detail: 'istilah' },
    { mandarin: '摩云藤', translate_to: 'Cloud Vine', detail: 'nama monster' },
    { mandarin: '血魔花', translate_to: 'Blood Demon Flower', detail: 'nama monster' },
    { mandarin: '食星草', translate_to: 'Star Eating Plant', detail: 'nama monster' },
    { mandarin: '阿墨', translate_to: 'Amo', detail: 'nama monster' },
    { mandarin: '焱神族', translate_to: 'Ras Yanshen', detail: 'nama ras' },
    { mandarin: '毋窿星域', translate_to: 'Domain Bintang Wulong', detail: 'nama tempat' },
    { mandarin: '祖神教', translate_to: 'Sekte Dewa Leluhur', detail: 'nama sekte' },
    { mandarin: '将甲', translate_to: 'Zirah Jenderal', detail: 'istilah' },
    { mandarin: '岩石', translate_to: 'Yanshi', detail: 'nama karakter' },
    { mandarin: '魅女', translate_to: 'Meinu', detail: 'nama karakter' },
    { mandarin: '毒药', translate_to: 'Duyao', detail: 'nama karakter' },
    { mandarin: '疯子', translate_to: 'Fengzi', detail: 'nama karakter' },
    { mandarin: '机械族', translate_to: 'Ras Robot', detail: 'nama ras' },
    { mandarin: '机械族傀儡', translate_to: 'Boneka Ras Robot', detail: 'istilah' },
    { mandarin: '不好', translate_to: 'Gawat', detail: 'istilah' },
    { mandarin: '衍神兵', translate_to: 'Senjata Yanshen', detail: 'senjata' },
    { mandarin: '魔女族', translate_to: 'Ras Monu', detail: 'nama ras' },
    { mandarin: '妖族', translate_to: 'Ras Iblis', detail: 'nama ras' },
    { mandarin: '碎星带', translate_to: 'Sabuk Bintang Hancur', detail: 'nama tempat' },
    { mandarin: '五彩渊华', translate_to: 'Kedalaman Lima Warna', detail: 'nama tempat' },
    { mandarin: '虬嗜族', translate_to: 'Ras Qiushi', detail: 'nama ras' },
    { mandarin: '食尸鬼', translate_to: 'Pemakan bangkai', detail: 'nama monster' },
    { mandarin: '强者/武者', translate_to: 'Pejuang', detail: 'istilah' },
    { mandarin: '时空魔兽', translate_to: 'Binatang Iblis Ruang-waktu', detail: 'nama monster' },
    { mandarin: '皇族', translate_to: 'Keluarga Kerajaan', detail: 'istilah' },
    { mandarin: '兽神兵', translate_to: 'Senjata Dewa Binatang', detail: 'senjata' },
    { mandarin: '无名秘典', translate_to: 'Kitab Rahasia Tanpa Nama', detail: 'istilah' },
    { mandarin: '秘法 三振穿梭宇宙', translate_to: 'Teknik Rahasia: Tiga Serangan Menembus Alam Semesta', detail: 'istilah penggunaan teknik' },
    { mandarin: '卡巫族', translate_to: 'Ras Kawu', detail: 'nama ras' },
    { mandarin: '雾沙岛', translate_to: 'Pulau Kabut Pasir', detail: 'nama tempat' },
    { mandarin: '星光族', translate_to: 'Ras Bintang', detail: 'nama ras' },
    { mandarin: '撕天一爪', translate_to: 'Cakar Penghancur Langit', detail: 'nama jurus/teknik' },
    { mandarin: '弑吴羽翼', translate_to: 'Sayap Shiwu', detail: 'nama benda' },
    { mandarin: '剑河罗', translate_to: 'Pedang Sungai Luo', detail: 'nama benda' },
    { mandarin: '千宝河', translate_to: 'Sungai Seribu Harta', detail: 'nama tempat' },
    { mandarin: '锁空之臂', translate_to: 'Lengan Pengunci Ruang', detail: 'nama benda' },
    { mandarin: '空间之心', translate_to: 'Inti Ruang', detail: 'nama benda' },
    { mandarin: '信符', translate_to: 'Token', detail: 'istilah' },
    { mandarin: '星空巨兽联盟', translate_to: 'Aliansi Behemoth Langit', detail: 'istilah' },
    { mandarin: '兽神传承令', translate_to: 'Token Warisan Dewa Binatang', detail: 'istilah' },
    { mandarin: '祖神秘境', translate_to: 'Alam Rahasia Dewa Leluhur', detail: 'istilah' },
    { mandarin: '黑烬旋风', translate_to: 'Badai Hitam', detail: 'istilah' },
    { mandarin: '五彩极光湖', translate_to: 'Danau Aurora Lima Warna', detail: 'istilah' },
    { mandarin: '荣耀世界', translate_to: 'Dunia Kemuliaan', detail: 'istilah' },
    { mandarin: '皇海', translate_to: 'Laut Kerajaan', detail: 'istilah' },
    { mandarin: '天狼殿', translate_to: 'Aula Serigala Langit', detail: 'istilah' },
    { mandarin: '神将', translate_to: 'Jenderal Dewa', detail: 'istilah' },
    { mandarin: '护教使者', translate_to: 'Utusan Pelindung Sekte', detail: 'istilah' },
    { mandarin: '紫荆岛', translate_to: 'Pulau Zijing', detail: 'nama tempat' },
    { mandarin: '岛主殿', translate_to: 'Aula Penguasa Pulau', detail: 'nama tempat' },
    { mandarin: '护教兽神殿', translate_to: 'Aula Dewa Binatang Pelindung Sekte', detail: 'nama tempat' },
    { mandarin: '祖神宫', translate_to: 'Istana Dewa Leluhur', detail: 'nama tempat' },
    { mandarin: '宝藏之地', translate_to: 'Tanah Harta Karun', detail: 'nama tempat' },
    { mandarin: '虎甲', translate_to: 'Tiger Beetle', detail: 'nama monster' },
    { mandarin: '虎甲虫族王者', translate_to: 'Raja Tiger Beetle', detail: 'nama monster' },
    { mandarin: '猎螳王者', translate_to: 'Mantis Hunter King', detail: 'nama monster' },
    { mandarin: '锋影王者', translate_to: 'Blade Shadow King', detail: 'nama monster' },
    { mandarin: '明月策', translate_to: 'Strategi Bulan Terang', detail: 'nama teknik/jurus' },
    { mandarin: '银河挂长空', translate_to: 'Galaksi Membentang di Langit', detail: 'nama teknik/jurus' },
    { mandarin: '金线极光域', translate_to: 'Domain Aurora Emas', detail: 'nama teknik/jurus' },
    { mandarin: '银翼王', translate_to: 'Raja Sayap Perak', detail: 'julukan' },
    { mandarin: '七剑王', translate_to: 'Raja Tujuh Pedang', detail: 'julukan' },
    { mandarin: '血魔王', translate_to: 'Raja Iblis Darah', detail: 'julukan' },
    { mandarin: '祭塔', translate_to: 'Menara Persembahan', detail: 'istilah' },
    { mandarin: '伊琳娜', translate_to: 'Irina', detail: 'nama karakter' },
    { mandarin: '布洛琳', translate_to: 'Brolin', detail: 'nama karakter' },
    { mandarin: '拿识族', translate_to: 'Ras Nashi', detail: 'nama ras' },
    { mandarin: '虫族', translate_to: 'Ras Serangga', detail: 'nama ras' },
    { mandarin: '焱祭大陆', translate_to: 'Daratan Yanji', detail: 'nama tempat/benua' },
    { mandarin: '兽神', translate_to: 'Dewa Binatang', detail: 'entitas puncak/ilahi' },
    { mandarin: '血洛晶', translate_to: 'Blood Luo Crystal', detail: 'istilah' },
    { mandarin: '感应器', translate_to: 'Sensor Koneksi', detail: 'istilah' },
    { mandarin: '瑜蓝单位', translate_to: 'Yulan', detail: 'mata uang' },
    { mandarin: '封王巅峰强者', translate_to: 'puncak level Undying King', detail: 'istilah kultivasi' },
    { mandarin: '封王初等', translate_to: 'Undying King Awal', detail: 'istilah kultivasi' },
    { mandarin: '封王高等', translate_to: 'Undying King Akhir', detail: 'istilah kultivasi' },
    { mandarin: '封王极限', translate_to: 'Undying King Ekstrem', detail: 'istilah kultivasi' },
    { mandarin: '火神源晶', translate_to: 'Kristal Api Dewa', detail: 'nama benda' },
    { mandarin: '水神源晶', translate_to: 'Kristal Air Dewa', detail: 'nama benda' },
    { mandarin: '祖神令', translate_to: 'Token Dewa Leluhur', detail: 'nama benda' },
    { mandarin: '探测仪', translate_to: 'Detektor', detail: 'nama benda' },
    { mandarin: '飞船', translate_to: 'Kapal Kosmik', detail: 'kendaraan luar angkasa berskala kosmik' },
    { mandarin: '宇宙舟', translate_to: 'Kapal Semesta', detail: 'istilah' },
    { mandarin: '之舟', translate_to: 'Kapal Makam', detail: 'istilah' },
    { mandarin: 'F9级飞船', translate_to: 'Kapal Kosmik level F9', detail: 'tingkatan kapal kosmik' },
    { mandarin: '鸿盟', translate_to: 'Aliansi Hong', detail: 'nama organisasi' },
    { mandarin: '九绝神国基座', translate_to: 'Fondasi Kerajaan Dewa Sembilan Absolut', detail: 'artefak/fondasi inti Kerajaan Dewa' },
    { mandarin: '星幻王', translate_to: 'Raja Xinghuan', detail: 'gelar tokoh' },
    { mandarin: '紫钟王', translate_to: 'Raja Zizhong', detail: 'gelar tokoh' },
    { mandarin: '银河领主', translate_to: 'Penguasa Galaksi', detail: 'gelar tokoh' },
    { mandarin: '化雾之主', translate_to: 'Master Huawu', detail: 'gelar tokoh' },
    { mandarin: '垣奥之主', translate_to: "Master Yuan'ao", detail: 'gelar tokoh' },
    { mandarin: '星河之主', translate_to: 'Master Xinghe', detail: 'gelar tokoh' },
    { mandarin: '虚金之主', translate_to: 'Master Xujin', detail: 'gelar tokoh' },
    { mandarin: '封砻之主', translate_to: 'Master Fenglong', detail: 'gelar tokoh' },
    { mandarin: '紫钟', translate_to: 'Lonceng Ungu', detail: 'nama benda' },
    { mandarin: '紫月圣地', translate_to: 'Tanah Suci Bulan Ungu', detail: 'nama tempat' },
    { mandarin: '东帝圣地', translate_to: 'Tanah Suci Kaisar Timur', detail: 'nama tempat' },
    { mandarin: '焰水湖', translate_to: 'Danau Air Api', detail: 'nama tempat' },
    { mandarin: '刀河王', translate_to: 'Raja Sungai Pedang', detail: 'gelar tokoh' },
    { mandarin: '不朽神体', translate_to: 'Tubuh Undying', detail: 'istilah' },
    { mandarin: '神体', translate_to: 'Tubuh Dewa', detail: 'istilah' },
    { mandarin: '熔岩魔神', translate_to: 'Dewa Api Lava', detail: 'istilah' },
    { mandarin: '幽海分身', translate_to: 'Klon Samudera', detail: 'istilah' },
    { mandarin: '无尽幽海', translate_to: 'Laut Jiuyou', detail: 'istilah' },
    { mandarin: '时间法则', translate_to: 'Hukum Waktu', detail: 'istilah' },
    { mandarin: '六方狱界', translate_to: 'Penjara Enam Arah', detail: 'formasi/artefak Ras Robot' },
    { mandarin: '域外战场', translate_to: 'Medan Perang Luar Wilayah', detail: 'arena perang kosmik antar ras' },
    { mandarin: '混沌城主', translate_to: 'Penguasa Kota Chaos', detail: 'istilah' },
    { mandarin: '王甲', translate_to: 'Zirah Raja', detail: 'istilah' },
    { mandarin: '皇甲', translate_to: 'Zirah Kaisar', detail: 'istilah' },
    { mandarin: '劫甲', translate_to: 'Zirah Malapetaka', detail: 'istilah' },
    { mandarin: '灭绝神铠', translate_to: 'Zirah Dewa Pemusnah', detail: 'istilah' },
    { mandarin: '疯魔灭神甲', translate_to: 'Zirah Dewa Pemusnah Gila', detail: 'istilah' },
    { mandarin: '原魂', translate_to: 'Jiwa Asal', detail: 'istilah' },
    { mandarin: '九劫秘典劫', translate_to: 'Kitab Rahasia Sembilan Bencana', detail: 'istilah' },
    { mandarin: '精神念师', translate_to: 'Ahli Mental', detail: 'istilah' },
    { mandarin: '灵魂能力', translate_to: 'Kemampuan Mental', detail: 'istilah' },
    { mandarin: '黑武者', translate_to: 'Kesatria Hitam', detail: 'istilah' },
    { mandarin: '通天桥', translate_to: 'Jembatan Penghubung Langit', detail: 'istilah' },
    { mandarin: '众等竞宝', translate_to: 'Lelang Harta Patungan', detail: 'istilah' },
    { mandarin: '星辰塔', translate_to: 'Menara Bintang', detail: 'istilah' },
    { mandarin: '禁地空间', translate_to: 'Ruang Terlarang', detail: 'istilah' },
    { mandarin: '外星移民', translate_to: 'Imigran Asing', detail: 'istilah' },
    { mandarin: '宇宝堂', translate_to: 'Toko Yubao', detail: 'nama tempat' },
    { mandarin: '梦光神使传承晶', translate_to: 'Kristal Warisan Malaikat Cahaya Mimpi', detail: 'nama benda' },
    { mandarin: '镇封星辰', translate_to: 'Bintang Penyegel', detail: 'nama benda' },
    { mandarin: '金属板', translate_to: 'Pelat Logam', detail: 'nama benda' },
    { mandarin: '茨维卡', translate_to: 'Ciweika', detail: 'nama karakter' },
    { mandarin: '冰狱之主', translate_to: 'Penguasa Penjara Es', detail: 'panggilan gelar' },
    { mandarin: '第一真主', translate_to: 'True God Pertama', detail: 'panggilan gelar' },
    { mandarin: '双子旋域', translate_to: 'Wilayah Pusaran Kembar', detail: 'nama tempat' },
    { mandarin: '原始通天山', translate_to: 'Gunung Tongtian Primordial', detail: 'nama tempat' },
    { mandarin: '不灭焚焰', translate_to: 'Api Pembakaran Undying', detail: 'nama teknik/jurus' },
    { mandarin: '九幽 海眼', translate_to: 'Pusaran Laut Jiuyou', detail: 'nama teknik/jurus' },
    { mandarin: '万星布道图', translate_to: 'Peta 10 Ribu Bintang', detail: 'nama teknik/jurus' },
    { mandarin: '击电奔星', translate_to: 'Bintang Sambaran Kilat', detail: 'nama teknik/jurus' },
    { mandarin: '炳如日星', translate_to: 'Kilau Matahari dan Bintang', detail: 'nama teknik/jurus' },
    { mandarin: '星火贯天', translate_to: 'Meteor Penembus Langit', detail: 'nama teknik/jurus' },
    { mandarin: '雷神践踏', translate_to: 'Hantaman Dewa Petir', detail: 'nama teknik/jurus' },
    { mandarin: '冰浑丝网', translate_to: 'Jaring Es', detail: 'nama teknik/jurus' },
    { mandarin: '一线鞭影', translate_to: 'Cambuk Bayangan', detail: 'nama teknik/jurus' },
  ],
};

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

  // Proses array LIST_CULTIVATION
  for (const item of rawGlossaryData.LIST_CULTIVATION) {
    entriesToInsert.push({
      source: item.mandarin,
      target: item.replace,
      detail: 'Tingkat Kultivasi',
    });

    // Cek jika ada sub-tahapan di dalamnya
    if (item.tahap && Array.isArray(item.tahap)) {
      for (const subItem of item.tahap) {
        entriesToInsert.push({
          source: subItem.mandarin,
          target: subItem.replace,
          detail: 'Sub-tingkat Kultivasi',
        });
      }
    }
  }

  // Proses array REPLACE_AND_LEARN
  for (const item of rawGlossaryData.REPLACE_AND_LEARN) {
    entriesToInsert.push({
      source: item.mandarin,
      target: item.translate_to,
      detail: item.detail,
    });
  }

  // 3. Buat atau cek Glossary "Swallowed Star"
  let glossary = await prisma.glossary.findFirst({
    where: { name: 'Swallowed Star' },
  });

  if (!glossary) {
    glossary = await prisma.glossary.create({
      data: {
        name: 'Swallowed Star',
        sourceLanguage: 'Mandarin',
        targetLanguage: 'Indonesia',
        userId: adminUser.id,
      },
    });
    console.log('Glossary "Swallowed Star" dibuat.');
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

  console.log(`Berhasil menyisipkan ${entriesToInsert.length} istilah ke dalam glossary "Swallowed Star".`);
  console.log('Seeder selesai');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });