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
        { "mandarin": "UNKNOWN", "replace": "Foundation Establishment" },
        { "mandarin": "UNKNOWN2", "replace": "Marrow Cleansing" },
        { "mandarin": "UNKNOWN3", "replace": "Mortal Shedding" },
        { "mandarin": "UNKNOWN4", "replace": "Seamless", "detail": [{ "mandarin": "凝丹境", "replace": "Pemadatan Inti" }] },
        { "mandarin": "云境", "replace": "Core Cloud" },
        { "mandarin": "UNKNOWN5", "replace": "Tingkat Penentangan/Indestructible" },
        { "mandarin": "大日境", "replace": "Great Solar" },
        { "mandarin": "暗星境", "replace": "Darkstar/Tingkat Marquis" },
        { "mandarin": "无间境/封王", "replace": "Incessant/Tingkat Regis" },
        { "mandarin": "UNKNOWN6", "replace": "Chaos Hole/Tingkat Supremasi" },
        { "mandarin": "UNKNOWN7", "replace": "Imperial Lord" },
        { "mandarin": "UNKNOWN8", "replace": "Tribulation Eminance" }
    ],
    "REPLACE_AND_LEARN": [
        { "mandarin": "大长老", "translate_to": "Tetua Agung", "detail": "jabatan" },
        { "mandarin": "长老", "translate_to": "Tetua", "detail": "jabatan" },
        { "mandarin": "混沌蚊", "translate_to": "Nyamuk Kekacauan", "detail": "nama makhluk" },
        { "mandarin": "虚空", "translate_to": "Kehampaan", "detail": "istilah/tempat" },
        { "mandarin": "仙气", "translate_to": "Energi Abadi", "detail": "istilah" },
        { "mandarin": "天劫", "translate_to": "Petaka Langit", "detail": "istilah" },
        { "mandarin": "雷劫", "translate_to": "Petaka Petir", "detail": "istilah" },
        { "mandarin": "天谴", "translate_to": "Hukuman Langit", "detail": "istilah" },
        { "mandarin": "元神", "translate_to": "Roh Asal", "detail": "istilah" },
        { "mandarin": "隐患", "translate_to": "Bahaya Tersembunyi", "detail": "istilah" },
        { "mandarin": "修士", "translate_to": "Kultivator", "detail": "praktisi kultivasi" },
        { "mandarin": "凡人", "translate_to": "orang biasa", "detail": "manusia biasa, bukan kultivator" },
        { "mandarin": "宗门", "translate_to": "Sekte", "detail": "organisasi kultivasi/klan besar" },
        { "mandarin": "法宝", "translate_to": "harta pusaka", "detail": "senjata/item tingkat tinggi" },
        { "mandarin": "灵兽", "translate_to": "Binatang Roh", "detail": "hewan spiritual" },
        { "mandarin": "荒阶", "translate_to": "Tingkat Kaisar", "detail": "tingkat senjata ilahi" },
        { "mandarin": "玄阶", "translate_to": "Tingkat Misteri", "detail": "tingkat senjata ilahi" },
        { "mandarin": "地阶", "translate_to": "Tingkat Bumi", "detail": "tingkat senjata ilahi" },
        { "mandarin": "天阶", "translate_to": "Tingkat Langit", "detail": "tingkat senjata ilahi" },
        { "mandarin": "神兵", "translate_to": "Senjata Ilahi", "detail": "istilah" },
        { "mandarin": "修炼", "translate_to": "pelatihan", "detail": "istilah" },
        { "mandarin": "传承", "translate_to": "warisan", "detail": "istilah" },
        { "mandarin": "天才", "translate_to": "Jenius", "detail": "istilah" },
        { "mandarin": "强者", "translate_to": "Ahli Kuat", "detail": "istilah" },
        { "mandarin": "雷泽", "translate_to": "Rawa Petir", "detail": "istilah" },
        { "mandarin": "副帅", "translate_to": "Wakil Panglima", "detail": "gelar/jabatan" },
        { "mandarin": "妖帅", "translate_to": "Panglima Siluman", "detail": "gelar/jabatan" },
        { "mandarin": "帅", "translate_to": "Panglima", "detail": "gelar/jabatan" },
        { "mandarin": "副将", "translate_to": "Wakil Jenderal", "detail": "gelar/jabatan" },
        { "mandarin": "将", "translate_to": "Jenderal", "detail": "gelar/jabatan" },
        { "mandarin": "副统领", "translate_to": "Wakil Komandan", "detail": "gelar/jabatan" },
        { "mandarin": "统领", "translate_to": "Komandan", "detail": "gelar/jabatan" },
        { "mandarin": "统队", "translate_to": "Kapten Pasukan", "detail": "gelar/jabatan" },
        { "mandarin": "师父", "translate_to": "Guru", "detail": "panggilan guru" },
        { "mandarin": "师尊", "translate_to": "Guru Agung", "detail": "panggilan guru (lebih hormat)" },
        { "mandarin": "魂力", "translate_to": "Energi Roh", "detail": "istilah energi/kultivasi" },
        { "mandarin": "心意刀", "translate_to": "Pedang Kehendak Hati", "detail": "istilah" },
        { "mandarin": "龙脉", "translate_to": "Nadi Naga", "detail": "istilah" },
        { "mandarin": "九天应元", "translate_to": "Penguasa Sembilan Langit", "detail": "istilah" },
        { "mandarin": "神尊", "translate_to": "Dewa", "detail": "istilah kultivasi" },
        { "mandarin": "魂技", "translate_to": "Teknik Roh", "detail": "nama teknik/jurus" },
        { "mandarin": "剑光分化", "translate_to": "Pemisahan Cahaya Pedang", "detail": "nama teknik/jurus" },
        { "mandarin": "心刀式", "translate_to": "Jurus Pedang Hati", "detail": "nama teknik/jurus" },
        { "mandarin": "落叶刀", "translate_to": "Pedang Daun Gugur", "detail": "nama teknik/jurus" },
        { "mandarin": "追风刀", "translate_to": "Pedang Mengejar Angin", "detail": "nama teknik/jurus" },
        { "mandarin": "三秋叶", "translate_to": "Tiga Daun Musim Gugur", "detail": "nama teknik/jurus" },
        { "mandarin": "拔刀式", "translate_to": "Jurus Cabut Pedang", "detail": "nama teknik/jurus" },
        { "mandarin": "灵血", "translate_to": "Darah Spiritual", "detail": "istilah kultivasi/energi" },
        { "mandarin": "灵体", "translate_to": "Tubuh Spiritual", "detail": "istilah kultivasi/jenis tubuh" },
        { "mandarin": "元气", "translate_to": "Vitalitas", "detail": "energi kehidupan/kultivasi" },
        { "mandarin": "神通", "translate_to": "Kekuatan Ilahi", "detail": "istilah kekuatan dewa" },
        { "mandarin": "剑法", "translate_to": "Teknik Pedang", "detail": "istilah seni bela diri" },
        { "mandarin": "修魔", "translate_to": "Kultivasi Iblis", "detail": "jenis kultivasi terlarang" },
        { "mandarin": "阵法", "translate_to": "Formasi", "detail": "array atau sihir pertahanan" },
        { "mandarin": "师兄", "translate_to": "Senior", "detail": "istilah" },
        { "mandarin": "元意之瞳", "translate_to": "Mata Primordial", "detail": "istilah" },
        { "mandarin": "分身", "translate_to": "Klon", "detail": "istilah" },
        { "mandarin": "玉阳洞天", "translate_to": "Alam Rahasia Yuyang", "detail": "istilah" },
        { "mandarin": "前辈", "translate_to": "Senior", "detail": "panggilan" },
        { "mandarin": "晚辈", "translate_to": "Junior", "detail": "istilah" },
        { "mandarin": "魂之境", "translate_to": "Alam Jiwa", "detail": "istilah" },
        { "mandarin": "两界岛", "translate_to": "Pulau Dua Alam", "detail": "istilah" },
        { "mandarin": "东宁府", "translate_to": "Prefektur Dongning", "detail": "nama tempat" },
        { "mandarin": "南阳港", "translate_to": "Pelabuhan Nanyang", "detail": "nama tempat" },
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
        { "mandarin": "秦五尊者", "translate_to": "Venerable Qinwu", "detail": "gelar/julukan" },
        { "mandarin": "圣女", "translate_to": "Gadis Suci", "detail": "gelar/julukan" },
        { "mandarin": "邪花侯", "translate_to": "Marquis Xiehua", "detail": "gelar/julukan" },
        { "mandarin": "天下巡走", "translate_to": "Pengembara Dunia", "detail": "gelar/julukan" },
        { "mandarin": "仙子", "translate_to": "Peri", "detail": "julukan" },
        { "mandarin": "三弟", "translate_to": "Adik ketiga", "detail": "panggilan" },
        { "mandarin": "神通", "translate_to": "Teknik Ilahi", "detail": "istilah" },
        { "mandarin": "神力", "translate_to": "Kekuatan Ilahi", "detail": "istilah" },
        { "mandarin": "法力", "translate_to": "Kekuatan Magis", "detail": "istilah" },
        { "mandarin": "山人", "translate_to": "Petapa", "detail": "istilah" },
        { "mandarin": "不好", "translate_to": "Gawat", "detail": "istilah" },
        { "mandarin": "修罗", "translate_to": "Asura", "detail": "istilah" },
        { "mandarin": "十字神尊相", "translate_to": "Fase Dewa Salib", "detail": "istilah" },
        { "mandarin": "魔尊", "translate_to": "Penguasa Iblis", "detail": "istilah" },
        { "mandarin": "七色煞", "translate_to": "Tujuh Warna Mematikan", "detail": "istilah" },
        { "mandarin": "妖神", "translate_to": "Dewa Siluman", "detail": "gelar/panggilan" },
        { "mandarin": "魔神", "translate_to": "Dewa Iblis", "detail": "gelar/panggilan" },
        { "mandarin": "雷声普化天尊", "translate_to": "Tianzun Manifestasi Petir Langit", "detail": "gelar/panggilan" }
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

  // 3. Buat atau cek Glossary "Azure Legacy"
  let glossary = await prisma.glossary.findFirst({
    where: { name: 'Azure Legacy' },
  });

  if (!glossary) {
    glossary = await prisma.glossary.create({
      data: {
        name: 'Azure Legacy',
        sourceLanguage: 'zh',
        targetLanguage: 'id',
        userId: adminUser.id,
      },
    });
    console.log('Glossary "Azure Legacy" dibuat.');
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

  console.log(`Berhasil menyisipkan ${entriesToInsert.length} istilah ke dalam glossary "Azure Legacy".`);
  console.log('Seeder selesai');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });