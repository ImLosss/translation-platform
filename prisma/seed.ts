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
        { "mandarin": "轮海秘境,", "replace": "Ranah Wheel and Sea", "details": [
            { "mandarin": "苦海", "replace": "Bitter Sea" },
            { "mandarin": "命泉", "replace": "Life Spring" },
            { "mandarin": "神桥", "replace": "Divine Bridge" },
            { "mandarin": "彼岸", "replace": "Paramita" }
        ] },
        { "mandarin": "道宫秘境", "replace": "Ranah Dao Palace", "details": "terdiri dari 5 tahap yang masing-masing menguatkan lima organ (hati, jantung, limpa, paru-paru, ginjal)" },
        { "mandarin": "四极秘境", "replace": "Ranah Four Pole", "details": "terdiri dari 4 tahap" },
        { "mandarin": "化龙秘境", "replace": "Ranah Dragon Transformation", "details": "terdiri dari 9 tahap" },
        { "mandarin": "化龙秘境", "replace": "Ranah Immortal Platform", "details": [
            { "mandarin": "半步大能", "replace": "Semi-Supreme" },
            { "mandarin": "大能", "replace": "Supreme Being" },
            { "mandarin": "王者", "replace": "Sovereign", "gelar": "God King" },
            { "mandarin": "圣人", "replace": "Saint" },
            { "mandarin": "圣人王", "replace": "Saint King" },
            { "mandarin": "大圣", "replace": "Great Saint" }
        ] },
        { "mandarin": "准帝", "replace": "Quasi Emperor", "details": "terdiri dari 9 tahap untuk mencapai Pseudo-Great Emperor" },
        { "mandarin": "大帝", "replace": "Great Emperor", "gelar": "Heavenly Emperor" },
        { "mandarin": "仙道领域", "replace": "Ranah Immortal Dao", "details": [
            { "mandarin": "真仙", "replace": "True Immortal" },
            { "mandarin": "红尘仙", "replace": "Red Dust Immortal" },
            { "mandarin": "仙王", "replace": "Immortal King" },
            { "mandarin": "准仙帝", "replace": "Quasi Immortal Emperor" },
            { "mandarin": "仙帝", "replace": "Immortal Emperor" }
        ] }
    ],
    "REPLACE_AND_LEARN": [
        { "mandarin": "大长老", "translate_to": "Tetua Agung", "detail": "jabatan" },
        { "mandarin": "长老", "translate_to": "Tetua", "detail": "jabatan" },
        { "mandarin": "伊轻舞", "translate_to": "Yi Qingwu", "detail": "nama karakter" },
        { "mandarin": "混沌蚊", "translate_to": "Nyamuk Kekacauan", "detail": "nama makhluk" },
        { "mandarin": "虚空", "translate_to": "Kehampaan", "detail": "istilah/tempat" },
        { "mandarin": "仙气", "translate_to": "Energi Abadi", "detail": "istilah" },
        { "mandarin": "天劫", "translate_to": "Petaka Langit", "detail": "istilah" },
        { "mandarin": "雷劫", "translate_to": "Petaka Petir", "detail": "istilah" },
        { "mandarin": "天谴", "translate_to": "Hukuman Langit", "detail": "istilah" },
        { "mandarin": "元神", "translate_to": "Roh Primordial", "detail": "istilah" },
        { "mandarin": "隐患", "translate_to": "Bahaya Tersembunyi", "detail": "istilah" },
        { "mandarin": "修士", "translate_to": "Kultivator", "detail": "praktisi kultivasi" },
        { "mandarin": "凡人", "translate_to": "orang biasa", "detail": "manusia biasa, bukan kultivator" },
        { "mandarin": "宗门", "translate_to": "Sekte", "detail": "organisasi kultivasi/klan besar" },
        { "mandarin": "法宝", "translate_to": "harta pusaka", "detail": "senjata/item tingkat tinggi" },
        { "mandarin": "灵兽", "translate_to": "Binatang Roh", "detail": "hewan spiritual" },
        { "mandarin": "修炼", "translate_to": "pelatihan", "detail": "istilah" },
        { "mandarin": "传承", "translate_to": "warisan", "detail": "istilah" },
        { "mandarin": "天才", "translate_to": "Jenius", "detail": "istilah" },
        { "mandarin": "强者", "translate_to": "Ahli Kuat", "detail": "istilah" },
        { "mandarin": "圣体", "translate_to": "Tubuh Suci", "detail": "istilah" },
        { "mandarin": "七禁领域", "translate_to": "Domain Tujuh Larangan", "detail": "istilah" },
        { "mandarin": "广寒阙", "translate_to": "Istana Guanghan", "detail": "istilah" },
        { "mandarin": "圣兵", "translate_to": "Senjata Suci", "detail": "istilah" },
        { "mandarin": "人欲道", "translate_to": "Jalan Hasrat Manusia", "detail": "istilah kultivasi" },
        { "mandarin": "师父", "translate_to": "Guru", "detail": "panggilan guru" },
        { "mandarin": "师尊", "translate_to": "Guru Agung", "detail": "panggilan guru (lebih hormat)" },
        { "mandarin": "魂力", "translate_to": "Energi Roh", "detail": "istilah energi/kultivasi" },
        { "mandarin": "魂技", "translate_to": "Teknik Roh", "detail": "nama teknik/jurus" },
        { "mandarin": "灵血", "translate_to": "Darah Spiritual", "detail": "istilah kultivasi/energi" },
        { "mandarin": "灵体", "translate_to": "Tubuh Spiritual", "detail": "istilah kultivasi/jenis tubuh" },
        { "mandarin": "元气", "translate_to": "Vitalitas", "detail": "energi kehidupan/kultivasi" },
        { "mandarin": "神通", "translate_to": "Kekuatan Ilahi", "detail": "istilah kekuatan dewa" },
        { "mandarin": "剑法", "translate_to": "Teknik Pedang", "detail": "istilah seni bela diri" },
        { "mandarin": "修魔", "translate_to": "Kultivasi Iblis", "detail": "jenis kultivasi terlarang" },
        { "mandarin": "阵法", "translate_to": "Formasi", "detail": "array atau sihir pertahanan" },
        { "mandarin": "师兄", "translate_to": "Senior", "detail": "istilah" },
        { "mandarin": "前辈", "translate_to": "Senior", "detail": "panggilan" },
        { "mandarin": "晚辈", "translate_to": "Junior", "detail": "istilah" },
        { "mandarin": "师姐", "translate_to": "Kakak Seperguruan", "detail": "panggilan senior perempuan" },
        { "mandarin": "师弟", "translate_to": "Adik Seperguruan", "detail": "panggilan junior" },
        { "mandarin": "掌门", "translate_to": "Ketua Sekte", "detail": "jabatan pemimpin sekte" },
        { "mandarin": "妖人", "translate_to": "Siluman", "detail": "orang siluman/iblis" },
        { "mandarin": "妖物", "translate_to": "Siluman", "detail": "makhluk iblis/monster" },
        { "mandarin": "天书", "translate_to": "Kitab Langit", "detail": "buku kuno suci" },
        { "mandarin": "灵魂", "translate_to": "Jiwa", "detail": "istilah umum roh" },
        { "mandarin": "考核", "translate_to": "Ujian", "detail": "tahapan/seleksi sekte" },
        { "mandarin": "炼药师", "translate_to": "Alkemis", "detail": "profesi pembuat pil" },
        { "mandarin": "丹药", "translate_to": "Pil", "detail": "istilah" },
        { "mandarin": "心魔", "translate_to": "Iblis Batin", "detail": "hambatan psikologis" },
        { "mandarin": "灵气", "translate_to": "Energi Spiritual", "detail": "energi kultivasi umum" },
        { "mandarin": "少宗主", "translate_to": "Pemimpin Muda", "detail": "jabatan" },
        { "mandarin": "公子", "translate_to": "Tuan Muda", "detail": "istilah" },
        { "mandarin": "圣女", "translate_to": "Gadis Suci", "detail": "gelar/julukan" },
        { "mandarin": "仙子", "translate_to": "Peri", "detail": "julukan" },
        { "mandarin": "三弟", "translate_to": "Adik ketiga", "detail": "panggilan" },
        { "mandarin": "神通", "translate_to": "Teknik Ilahi", "detail": "istilah" },
        { "mandarin": "神力", "translate_to": "Kekuatan Ilahi", "detail": "istilah" },
        { "mandarin": "法力", "translate_to": "Kekuatan Magis", "detail": "istilah" },
        { "mandarin": "山人", "translate_to": "Petapa", "detail": "istilah" },
        { "mandarin": "不好", "translate_to": "Gawat", "detail": "istilah" },
        { "mandarin": "修罗", "translate_to": "Asura", "detail": "istilah" },
        { "mandarin": "妖神", "translate_to": "Dewa Siluman", "detail": "gelar/panggilan" },
        { "mandarin": "魔神", "translate_to": "Dewa Iblis", "detail": "gelar/panggilan" },
        { "mandarin": "神蚕道人", "translate_to": "Petapa Shencan", "detail": "gelar/panggilan" },
        { "mandarin": "太阳圣皇", "translate_to": "Kaisar Suci Taiyang", "detail": "gelar/panggilan" },
        { "mandarin": "正德道人", "translate_to": "Petapa Zhengde", "detail": "gelar/panggilan" },
        { "mandarin": "太古一族", "translate_to": "Ras Kuno", "detail": "nama ras" },
        { "mandarin": "金乌一族", "translate_to": "Klan Jinwu", "detail": "nama klan" },
        { "mandarin": "星域", "translate_to": "Domain Bintang", "detail": "istilah" },
        { "mandarin": "星", "translate_to": "Planet", "detail": "istilah" },
        { "mandarin": "帝文", "translate_to": "Aksara Kaisar", "detail": "istilah" },
        { "mandarin": "人王殿", "translate_to": "Istana Raja Manusia", "detail": "istilah" },
        { "mandarin": "羽化仙崖", "translate_to": "Tebing Abadi Yuhua", "detail": "nama tempat" },
        { "mandarin": "长生观", "translate_to": "Kuil Changsheng", "detail": "istilah" },
        { "mandarin": "蛮族", "translate_to": "Suku Barbar", "detail": "nama suku/klan" },
        { "mandarin": "圣主", "translate_to": "Penguasa Suci", "detail": "istilah" },
        { "mandarin": "五域", "translate_to": "Lima Wilayah", "detail": "istilah" },
        { "mandarin": "北原", "translate_to": "Wilayah Utara", "detail": "nama tempat" },
        { "mandarin": "南岭", "translate_to": "Wilayah Selatan", "detail": "nama tempat" },
        { "mandarin": "天机阁", "translate_to": "Paviliun Tianji", "detail": "nama tempat" },
        { "mandarin": "神灵谷", "translate_to": "Lembah Shenling", "detail": "nama tempat" },
        { "mandarin": "落霞山", "translate_to": "Gunung Luoxia", "detail": "nama tempat" },
        { "mandarin": "太阴神子", "translate_to": "Putra Suci Taiyin", "detail": "gelar/panggilan" },
        { "mandarin": "宫主", "translate_to": "Pemimpin Istana", "detail": "gelar/panggilan" },
        { "mandarin": "老祖", "translate_to": "Leluhur", "detail": "gelar/panggilan" },
        { "mandarin": "不死天皇", "translate_to": "Kaisar Langit Abadi", "detail": "gelar/panggilan" },
        { "mandarin": "蛮王", "translate_to": "Raja Barbar", "detail": "gelar/panggilan" },
        { "mandarin": "是天皇子", "translate_to": "Putra Kaisar Langit", "detail": "gelar/panggilan" },
        { "mandarin": "圣皇子", "translate_to": "Putra Kaisar Suci", "detail": "gelar/panggilan" },
        { "mandarin": "神女炉", "translate_to": "Tungku Dewi", "detail": "nama benda" },
        { "mandarin": "皆字秘", "translate_to": "Aksara Rahasia 'semua'", "detail": "istilah" },
        { "mandarin": "行字秘", "translate_to": "Aksara Rahasia 'bergerak'", "detail": "istilah" },
        { "mandarin": "斗字秘", "translate_to": "Aksara Rahasia 'bertarung'", "detail": "istilah" },
        { "mandarin": "道德经", "translate_to": "Kitab Dao dan Kebajikan", "detail": "istilah" },
        { "mandarin": "六道轮回拳", "translate_to": "Tinju Enam Jalan Reinkarnasi", "detail": "nama teknik" }
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

  // 3. Buat atau cek Glossary "Shrouding the Heavens"
  let glossary = await prisma.glossary.findFirst({
    where: { name: 'Shrouding the Heavens' },
  });

  if (!glossary) {
    glossary = await prisma.glossary.create({
      data: {
        name: 'Shrouding the Heavens',
        sourceLanguage: 'zh',
        targetLanguage: 'id',
        userId: adminUser.id,
      },
    });
    console.log('Glossary "Shrouding the Heavens" dibuat.');
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

  console.log(`Berhasil menyisipkan ${entriesToInsert.length} istilah ke dalam glossary "Shrouding the Heavens".`);
  console.log('Seeder selesai');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });