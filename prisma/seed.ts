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
    "LIST_CULTIVATION": [
      { "mandarin": "搬血境", "replace": "Blood Circulation" },
      { "mandarin": "洞天境", "replace": "Heavenly Passage" },
      { "mandarin": "化灵境", "replace": "Spiritual Transformation", "details": "Master" },
      { "mandarin": "铭纹境", "replace": "Engravement", "details": "Lord" },
      { "mandarin": "列阵境", "replace": "Formation Array", "details": "Noble King" },
      { "mandarin": "尊者境", "replace": "Venerable", "details": "Human Emperor" },
      { "mandarin": "神火境", "replace": "Divine Flame", "details": "False God" },
      { "mandarin": "真一境", "replace": "True God", "details": "True God" },
      { "mandarin": "圣祭境", "replace": "Holy Sacrifice", "details": "Divine King" },
      { "mandarin": "天神境", "replace": "Heavenly Deity", "details": "Divine King" },
      { "mandarin": "虚道境", "replace": "Void Dao" },
      { "mandarin": "斩我境", "replace": "Self-Severing", "details": "Sect Master/Ketua Sekte" },
      { "mandarin": "遁一境", "replace": "Self-Release", "details": "Sect Master/Ketua Sekte" },
      { "mandarin": "至尊境", "replace": "Supreme", "details": "Peak of the Mortal Dao" },
      { "mandarin": "准真仙", "replace": "Half True Immortal" },
      { "mandarin": "真仙", "replace": "True Immortal", "details": "Immortal" },
      { "mandarin": "准仙王", "replace": "Half Immortal King" },
      { "mandarin": "仙王/不朽之王/葬王", "replace": "Immortal King", "details": "King" },
      { "mandarin": "准仙帝", "replace": "Half Immortal Emperor", "details": "Dao Ancestor (Daozu)" },
      { "mandarin": "仙帝", "replace": "Immortal Emperor", "details": "Emperor" },
      { "mandarin": "仙帝极限", "replace": "Sacrifice to the Dao Realm", "details": "Sacrifice" },
      { "mandarin": "祭道之上", "replace": "Transcendence", "details": "Detachment" }
    ],
    "REPLACE_AND_LEARN": [
        { "mandarin": "混沌蚊", "translate_to": "Nyamuk Kekacauan", "detail": "nama makhluk" },
        { "mandarin": "凤凰", "translate_to": "Phoenix", "detail": "nama makhluk" },
        { "mandarin": "混沌蚊湖", "translate_to": "Danau Nyamuk Kekacauan", "detail": "nama tempat" },
        { "mandarin": "荒", "translate_to": "Huang", "detail": "nama karakter" },
        { "mandarin": "帝昆", "translate_to": "Di Kun", "detail": "nama karakter" },
        { "mandarin": "鹤无双", "translate_to": "He Wushuang", "detail": "nama karakter" },
        { "mandarin": "虚空", "translate_to": "Kehampaan", "detail": "istilah/tempat" },
        { "mandarin": "仙气", "translate_to": "Energi Abadi", "detail": "istilah" },
        { "mandarin": "仙殿", "translate_to": "Istana Immortal", "detail": "nama tempat/organisasi" },
        { "mandarin": "人仙", "translate_to": "Manusia Abadi", "detail": "istilah/ras" },
        { "mandarin": "傀儡附魂之术", "translate_to": "Teknik Merasuki Boneka", "detail": "nama teknik" },
        { "mandarin": "天劫", "translate_to": "Petaka Langit", "detail": "istilah" },
        { "mandarin": "雷劫", "translate_to": "Petaka Petir", "detail": "istilah" },
        { "mandarin": "天河水", "translate_to": "Air Sungai Langit", "detail": "istilah/benda" },
        { "mandarin": "师父", "translate_to": "Guru", "detail": "panggilan guru" },
        { "mandarin": "天骄", "translate_to": "Jenius", "detail": "istilah/julukan" },
        { "mandarin": "斩魂消魄", "translate_to": "Memotong dan Memusnahkan Roh", "detail": "istilah/teknik" },
        { "mandarin": "灭度苍生", "translate_to": "Memusnahkan Makhluk Hidup", "detail": "istilah/teknik" },
        { "mandarin": "道则", "translate_to": "Aturan Dao", "detail": "istilah/konsep" },
        { "mandarin": "罪纹", "translate_to": "Pola Dosa", "detail": "istilah" },
        { "mandarin": "不朽之王", "translate_to": "Immortal King", "detail": "istilah" },
        { "mandarin": "金身不灭体", "translate_to": "Tubuh Emas Abadi", "detail": "istilah" },
        { "mandarin": "赤王后裔", "translate_to": "Keturunan Raja Chi", "detail": "istilah" },
        { "mandarin": "生死关隘", "translate_to": "Penghalang Hidup dan Mati", "detail": "istilah" },
        { "mandarin": "三生万物", "translate_to": "Tiga Melahirkan Segalanya", "detail": "istilah/konsep" },
        { "mandarin": "九重天", "translate_to": "Langit Tingkat 9", "detail": "istilah/tempat/tingkatan" },
        { "mandarin": "雷域", "translate_to": "Wilayah Petir", "detail": "nama tempat" },
        { "mandarin": "冥土死气", "translate_to": "Energi Kematian Tanah Nether", "detail": "istilah/energi" },
        { "mandarin": "天谴", "translate_to": "Hukuman Langit", "detail": "istilah" },
        { "mandarin": "第三杀阵", "translate_to": "Formasi Pembunuhan Ketiga", "detail": "nama teknik/formasi" },
        { "mandarin": "黑暗牢笼", "translate_to": "Penjara Kegelapan", "detail": "nama tempat" },
        { "mandarin": "元神", "translate_to": "Roh Primordial", "detail": "istilah" },
        { "mandarin": "神秘古路", "translate_to": "Jalan Kuno Misterius", "detail": "nama tempat/istilah" },
        { "mandarin": "隐患", "translate_to": "Bahaya Tersembunyi", "detail": "istilah" },
        { "mandarin": "断生之路", "translate_to": "Jalan Pemutus Hidup", "detail": "nama tempat/istilah" },
        { "mandarin": "圣祭领域", "translate_to": "Ranah Holy Sacrified", "detail": "istilah/ranah kultivasi" },
        { "mandarin": "太阴之水", "translate_to": "Air Bulan", "detail": "istilah/benda" },
        { "mandarin": "太阴至宝", "translate_to": "Harta Karun Bulan", "detail": "istilah/benda" },
        { "mandarin": "太阴本源石", "translate_to": "Batu Asal Bulan", "detail": "istilah/benda" },
        { "mandarin": "补天教", "translate_to": "Sekte Butian", "detail": "nama sekte" },
        { "mandarin": "清漪", "translate_to": "Qing Yi", "detail": "nama karakter" },
        { "mandarin": "月婵", "translate_to": "Yue Chan", "detail": "nama karakter" },
        { "mandarin": "圣女", "translate_to": "Wanita Suci", "detail": "jabatan/sebutan" },
        { "mandarin": "舅爷", "translate_to": "Paman", "detail": "hubungan keluarga" },
        { "mandarin": "教主", "translate_to": "Ketua Sekte", "detail": "jabatan" },
        { "mandarin": "精英弟子", "translate_to": "Murid Elite", "detail": "istilah/sebutan" },
        { "mandarin": "三道仙气", "translate_to": "Tiga Energi Abadi", "detail": "istilah" },
        { "mandarin": "奇尸", "translate_to": "Mayat Ajaib", "detail": "istilah/benda" },
        { "mandarin": "冥土", "translate_to": "Tanah Nether", "detail": "nama tempat" },
        { "mandarin": "走火入魔", "translate_to": "Kerasukan", "detail": "istilah" },
        { "mandarin": "小千世界", "translate_to": "Seribu Dunia Kecil", "detail": "istilah/tempat" },
        { "mandarin": "雷劫之液", "translate_to": "Cairan Petaka Petir", "detail": "istilah/benda" },
        { "mandarin": "主人", "translate_to": "Majikan", "detail": "istilah/sebutan" },
        { "mandarin": "宁川", "translate_to": "Ning Chuan", "detail": "nama karakter" },
        { "mandarin": "约战", "translate_to": "Pertarungan yang dijanjikan", "detail": "istilah/aksi" },
        { "mandarin": "声威", "translate_to": "Momentum/Kewibawaan", "detail": "istilah" },
        { "mandarin": "不好", "translate_to": "Gawat", "detail": "istilah" },
        { "mandarin": "古祖", "translate_to": "Leluhur Kuno", "detail": "istilah" },
        { "mandarin": "正主", "translate_to": "Majikan Asli", "detail": "istilah/sebutan" },
        { "mandarin": "九天神威", "translate_to": "Kekuatan Heavenly Deity Tingkat 9", "detail": "istilah/tingkatan" },
        { "mandarin": "六冠王", "translate_to": "Raja Enam Mahkota", "detail": "gelar/istilah" },
        { "mandarin": "边荒七王", "translate_to": "Tujuh Raja Perbatasan", "detail": "gelar/istilah" },
        { "mandarin": "战仙", "translate_to": "Immortal Perang", "detail": "istilah" },
        { "mandarin": "师姐", "translate_to": "Kakak Senior (perempuan)", "detail": "istilah/sebutan" },
        { "mandarin": "天神书院", "translate_to": "Akademi Tianshen", "detail": "nama institusi" },
        { "mandarin": "三千道州", "translate_to": "Benua 3.000 Provinsi", "detail": "nama wilayah" },
        { "mandarin": "边荒", "translate_to": "Perbatasan", "detail": "nama wilayah" },
        { "mandarin": "太古盟约", "translate_to": "Perjanjian Aliansi Kuno", "detail": "istilah/perjanjian" },
        { "mandarin": "至尊殿堂", "translate_to": "Istana Supreme", "detail": "nama tempat" },
        { "mandarin": "无人区", "translate_to": "Wilayah Tanpa Pemilik", "detail": "nama wilayah" },
        { "mandarin": "古城", "translate_to": "Kota Kuno", "detail": "nama tempat" },
        { "mandarin": "嵊州", "translate_to": "Provinsi Sheng", "detail": "nama wilayah" },
        { "mandarin": "魔洲", "translate_to": "Pulau Iblis", "detail": "nama tempat" },
        { "mandarin": "柳神", "translate_to": "Dewi Willow", "detail": "nama karakter" },
        { "mandarin": "孟天正", "translate_to": "Meng Tianzheng", "detail": "nama karakter" },
        { "mandarin": "不朽者", "translate_to": "Tuan Immortal", "detail": "istilah/julukan" },
        { "mandarin": "无量天", "translate_to": "Langit Tanpa Batas", "detail": "nama tempat" },
        { "mandarin": "长老", "translate_to": "Tetua", "detail": "jabatan" },
        { "mandarin": "万灵图", "translate_to": "Peta 10.000 Roh", "detail": "istilah/benda" },
        { "mandarin": "十界图", "translate_to": "Peta Sepuluh Dunia", "detail": "istilah/benda" },
        { "mandarin": "大道之花", "translate_to": "Bunga Great Dao", "detail": "istilah/benda" },
        { "mandarin": "风族", "translate_to": "Klan Feng", "detail": "nama Klan" },
        { "mandarin": "安澜族", "translate_to": "Klan Anlan", "detail": "nama Klan" },
        { "mandarin": "战仆", "translate_to": "Pelayan Perang", "detail": "istilah" },
        { "mandarin": "战神书院", "translate_to": "Akademi Dewa Perang", "detail": "istilah" },
        { "mandarin": "天功", "translate_to": "Teknik Langit", "detail": "istilah" },
        { "mandarin": "真名之力", "translate_to": "Kekuatan Nama Sejati", "detail": "istilah" },
        { "mandarin": "阵旗", "translate_to": "Bendera Formasi", "detail": "istilah" },
        { "mandarin": "战旗", "translate_to": "Bendera Perang", "detail": "istilah" },
        { "mandarin": "神药", "translate_to": "Obat Dewa", "detail": "istilah" },
        { "mandarin": "大道铡刀", "translate_to": "Pedang Great Dao", "detail": "nama senjata" },
        { "mandarin": "大罗剑胎", "translate_to": "Pedang Great Luo", "detail": "nama senjata" },
        { "mandarin": "灭帝剑", "translate_to": "Pedang Penghancur Kaisar", "detail": "nama senjata" },
        { "mandarin": "鲲鹏法", "translate_to": "Teknik Kunpeng", "detail": "nama teknik" },
        { "mandarin": "六道轮回天功", "translate_to": "Teknik Enam Jalan Reinkarnasi", "detail": "nama teknik" },
        { "mandarin": "万矛穿心", "translate_to": "Sepuluh Ribu Tombak Menusuk Jantung", "detail": "nama teknik" },
        { "mandarin": "轮回", "translate_to": "Reinkarnasi", "detail": "istilah" },
        { "mandarin": "往生", "translate_to": "kelahiran kembali", "detail": "istilah" },
        { "mandarin": "仙金", "translate_to": "Emas Abadi", "detail": "nama benda" },
        { "mandarin": "莫道", "translate_to": "Modao", "detail": "nama karakter" },
        { "mandarin": "王曦", "translate_to": "Wangxi", "detail": "nama karakter" },
        { "mandarin": "仙子", "translate_to": "Peri", "detail": "julukan" },
        { "mandarin": "金刚琢", "translate_to": "Cincin Vajra", "detail": "nama benda" },
        { "mandarin": "大长老", "translate_to": "Tetua Agung", "detail": "jabatan/gelar" },
        { "mandarin": "异域", "translate_to": "Dunia Asing", "detail": "istilah" },
        { "mandarin": "列阵境", "translate_to": "Ranah Pembentukan Formasi", "detail": "istilah" },
        { "mandarin": "仙古", "translate_to": "Ancient Immortal", "detail": "nama tempat/era" },
        { "mandarin": "仙古法", "translate_to": "Metode Kuno", "detail": "istilah" },
        { "mandarin": "今世法", "translate_to": "Metode Masa Kini", "detail": "istilah" },
        { "mandarin": "小胖子", "translate_to": "Bocah Gendut", "detail": "istilah" },
        { "mandarin": "玉石经书", "translate_to": "Kitab Giok", "detail": "istilah" },
        { "mandarin": "古字", "translate_to": "Aksara Kuno", "detail": "istilah" },
        { "mandarin": "界坟", "translate_to": "Makam Dunia", "detail": "istilah" },
        { "mandarin": "谪仙", "translate_to": "Immortal Terbuang", "detail": "istilah" },
        { "mandarin": "青月焰", "translate_to": "Api Qingyue", "detail": "istilah" },
        { "mandarin": "平乱诀", "translate_to": "Teknik Penakluk Kekacauan", "detail": "nama teknik" },
        { "mandarin": "九转天功", "translate_to": "Teknik Langit Sembilan Putaran", "detail": "nama teknik" },
        { "mandarin": "王曦仙子", "translate_to": "Peri Wangxi", "detail": "nama/julukan karakter" },
        { "mandarin": "长生王家", "translate_to": "Keluarga Wang Abadi", "detail": "nama keluarga" },
        { "mandarin": "仙种", "translate_to": "Benih Immortal", "detail": "istilah" },
        { "mandarin": "黑暗仙金剑", "translate_to": "Pedang Emas Abadi Kegelapan", "detail": "nama senjata" },
        { "mandarin": "太初古矿", "translate_to": "Tambang Kuno Taichu", "detail": "nama tempat" },
        { "mandarin": "唯一洞天", "translate_to": "Heavenly Passage Tunggal", "detail": "istilah kultivasi" },
        { "mandarin": "丹", "translate_to": "Pill", "detail": "istilah" },
        { "mandarin": "神泉", "translate_to": "Mata Air Ilahi", "detail": "istilah" },
        { "mandarin": "荒蛮之地", "translate_to": "Tanah Terbelakang", "detail": "istilah" },
        { "mandarin": "打神石", "translate_to": "Batu Pemukul Dewa", "detail": "nama harta" },
        { "mandarin": "辟邪神竹", "translate_to": "Bambu Suci Penangkal Kejahatan", "detail": "nama harta" },
        { "mandarin": "长老院", "translate_to": "Aula Tetua", "detail": "istilah" },
        { "mandarin": "战灵之神", "translate_to": "Dewa Roh Perang", "detail": "istilah" },
        { "mandarin": "五魔封天种", "translate_to": "Lima Iblis Penyegel Benih Langit", "detail": "istilah" },
        { "mandarin": "密阁", "translate_to": "Paviliiun Rahasia", "detail": "istilah" },
        { "mandarin": "锤骨法", "translate_to": "Metode Penempaan Tulang", "detail": "istilah" },
        { "mandarin": "书童", "translate_to": "Pelayan", "detail": "istilah" },
        { "mandarin": "极限之路", "translate_to": "Jalan Ekstrem", "detail": "istilah" },
        { "mandarin": "小天王", "translate_to": "Raja Langit Muda", "detail": "panggilan" },
        { "mandarin": "前辈", "translate_to": "Senior", "detail": "panggilan" },
        { "mandarin": "原始真解", "translate_to": "Pemahaman Sejati Primordial", "detail": "istilah" },
        { "mandarin": "元母鼎", "translate_to": "Tungku Asal Primordial", "detail": "nama harta" },
        { "mandarin": "不灭经", "translate_to": "Kitab Keabadian", "detail": "istilah" },
        { "mandarin": "太古十凶", "translate_to": "Sepuluh Binatang Buas Kuno", "detail": "istilah" },
        { "mandarin": "十全大补汤", "translate_to": "Sup Penguat Kesempurnaan", "detail": "istilah" },
        { "mandarin": "强者", "translate_to": "Ahli Kuat", "detail": "istilah" },
        { "mandarin": "神威", "translate_to": "Kekuatan Ilahi", "detail": "istilah" },
        { "mandarin": "天角蚁", "translate_to": "Semut Tanduk Langit", "detail": "nama makhluk" },
        { "mandarin": "血凰狮", "translate_to": "Singa Phoenix Darah", "detail": "nama makhluk" },
        { "mandarin": "葬士", "translate_to": "Makhluk Pemakaman", "detail": "nama makhluk" },
        { "mandarin": "葬王", "translate_to": "Raja Pemakaman", "detail": "nama makhluk" },
        { "mandarin": "引魂莲", "translate_to": "Teratai Penarik Jiwa", "detail": "nama harta" },
        { "mandarin": "界灭香", "translate_to": "Dupa Penghancur Dunia", "detail": "nama harta" },
        { "mandarin": "炼仙壶", "translate_to": "Guci Pemurnian Immortal", "detail": "nama harta" },
        { "mandarin": "起源古器", "translate_to": "Artefak Kuno Asal", "detail": "nama harta" },
        { "mandarin": "超绝峰", "translate_to": "Puncak Chaojue", "detail": "nama tempat" },
        { "mandarin": "不灭峰", "translate_to": "Puncak Keabadian", "detail": "nama tempat" },
        { "mandarin": "大赤天", "translate_to": "Langit Dachi", "detail": "nama tempat" },
        { "mandarin": "天兽森林", "translate_to": "Hutan Binatang Langit", "detail": "nama tempat" },
        { "mandarin": "金乌峰", "translate_to": "Puncak Jinwu", "detail": "nama tempat" }
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

  for (const item of rawGlossaryData.LIST_CULTIVATION as any[]) {
    let mainDetail = 'Tingkat Kultivasi';

    // Jika 'details' adalah string, timpa atau gabungkan ke mainDetail
    if (typeof item.details === 'string') {
      mainDetail = item.details;
    }

    // Masukkan data utama
    entriesToInsert.push({
      source: item.mandarin,
      target: item.replace,
      detail: mainDetail,
    });

    // Cek jika ada sub-tahapan di properti 'tahap' (Format Lama)
    if (item.tahap && Array.isArray(item.tahap)) {
      for (const subItem of item.tahap) {
        entriesToInsert.push({
          source: subItem.mandarin,
          target: subItem.replace,
          detail: 'Sub-tingkat Kultivasi',
        });
      }
    }

    // Cek jika ada sub-tahapan di properti 'details' (Format Baru)
    if (item.details && Array.isArray(item.details)) {
      for (const subItem of item.details) {
        let subDetail = 'Sub-tingkat Kultivasi';
        
        // Jika ada properti gelar tambahan, masukkan ke dalam detail
        if (subItem.gelar) {
          subDetail += ` | Gelar: ${subItem.gelar}`;
        }

        entriesToInsert.push({
          source: subItem.mandarin,
          target: subItem.replace,
          detail: subDetail,
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

  // 3. Buat atau cek Glossary "Perfect World"
  let glossary = await prisma.glossary.findFirst({
    where: { name: 'Perfect World' },
  });

  if (!glossary) {
    glossary = await prisma.glossary.create({
      data: {
        name: 'Perfect World',
        sourceLanguage: 'zh',
        targetLanguage: 'id',
        userId: adminUser.id,
      },
    });
    console.log('Glossary "Perfect World" dibuat.');
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

  console.log(`Berhasil menyisipkan ${entriesToInsert.length} istilah ke dalam glossary "Perfect World".`);
  console.log('Seeder selesai');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });