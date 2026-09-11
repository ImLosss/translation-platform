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
        { "mandarin": "凝气", "replace": "Qi Condensation" },
        { "mandarin": "筑基", "replace": "Foundation Establishment" },
        { "mandarin": "金丹", "replace": "Golden Core", "detail": "Tingkatan: 1 hingga 8 Istana Langit" },
        { "mandarin": "元婴", "replace": "Nascent Soul", "detail": "Tingkatan: 1 hingga 5 Petaka" },
        { "mandarin": "灵藏", "replace": "Spirit Treasury" },
        { "mandarin": "归墟", "replace": "Void Returning" },
        { "mandarin": "蕴神", "replace": "Spirit Accumulation" },
        { "mandarin": "幻真", "replace": "True Illusory" },
        { "mandarin": "不灭", "replace": "Indestructible" },
        { "mandarin": "幻真不灭", "replace": "True Illusory Indestructible" },
        { "mandarin": "大帝/准仙", "replace": "Great Emperor/Quasi-Immortal" },
        { "mandarin": "夏仙/下仙", "replace": "Summer Immortal/Lower Immortal" },
        { "mandarin": "仙主/上仙", "replace": "Immortal Lord/Upper Immortal" },
        { "mandarin": "仙尊", "replace": "Immortal Venerable" },
        { "mandarin": "希夷", "replace": "Xiyi/Formless" }
    ],
    "REPLACE_AND_LEARN": [
        { "mandarin": "大长老", "translate_to": "Tetua Agung", "detail": "jabatan" },
        { "mandarin": "长老", "translate_to": "Tetua", "detail": "jabatan" },
        { "mandarin": "混沌蚊", "translate_to": "Nyamuk Kekacauan", "detail": "nama makhluk" },
        { "mandarin": "噬灵藤", "translate_to": "Rotan Pelahap Roh", "detail": "nama makhluk" },
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
        { "mandarin": "筑基塔", "translate_to": "Menara Foundation Establishment", "detail": "nama tempat" },
        { "mandarin": "命灯", "translate_to": "Lentera Kehidupan", "detail": "nama benda" },
        { "mandarin": "灵息灯", "translate_to": "Lentera Energi Spiritual", "detail": "nama benda" },
        { "mandarin": "乾坤司南盘", "translate_to": "Kompas Qiankun", "detail": "nama benda" },
        { "mandarin": "强者", "translate_to": "Ahli Kuat", "detail": "istilah" },
        { "mandarin": "灵石", "translate_to": "Batu Spiritual", "detail": "istilah" },
        { "mandarin": "凝气大圆满", "translate_to": "Qi Condensation Tahap Puncak", "detail": "istilah kultivasi" },
        { "mandarin": "师父", "translate_to": "Guru", "detail": "panggilan guru" },
        { "mandarin": "师尊", "translate_to": "Guru Agung", "detail": "panggilan guru (lebih hormat)" },
        { "mandarin": "魂力", "translate_to": "Energi Roh", "detail": "istilah energi/kultivasi" },
        { "mandarin": "魂技", "translate_to": "Teknik Roh", "detail": "nama teknik/jurus" },
        { "mandarin": "禁海龙鲸", "translate_to": "Paus Naga Laut Terlarang", "detail": "nama teknik/jurus" },
        { "mandarin": "化海经的功法", "translate_to": "Teknik Kitab Transformasi Laut", "detail": "nama teknik" },
        { "mandarin": "煞火吞魂经", "translate_to": "Kitab Api Jahat Penelan Jiwa", "detail": "nama teknik" },
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
        { "mandarin": "玄耀态", "translate_to": "Kondisi Xuanyao", "detail": "istilah" },
        { "mandarin": "不好", "translate_to": "Gawat", "detail": "istilah" },
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
        { "mandarin": "副司长", "translate_to": "Wakil Kepala Divisi", "detail": "jabatan" },
        { "mandarin": "司长", "translate_to": "Kepala Divisi", "detail": "jabatan" },
        { "mandarin": "队长", "translate_to": "Kapten Tim", "detail": "jabatan" },
        { "mandarin": "公子", "translate_to": "Tuan Muda", "detail": "istilah" },
        { "mandarin": "命火", "translate_to": "Api Kehidupan", "detail": "istilah" },
        { "mandarin": "序列", "translate_to": "Urutan", "detail": "urutan dalam pewaris ketua puncak" },
        { "mandarin": "圣女", "translate_to": "Gadis Suci", "detail": "gelar/julukan" },
        { "mandarin": "仙子", "translate_to": "Peri", "detail": "julukan" },
        { "mandarin": "三弟", "translate_to": "Adik ketiga", "detail": "panggilan" },
        { "mandarin": "神通", "translate_to": "Teknik Ilahi", "detail": "istilah" },
        { "mandarin": "神力", "translate_to": "Kekuatan Ilahi", "detail": "istilah" },
        { "mandarin": "法力", "translate_to": "Kekuatan Magis", "detail": "istilah" },
        { "mandarin": "法舟", "translate_to": "Perahu Sakti", "detail": "istilah" },
        { "mandarin": "法船", "translate_to": "Kapal Sakti", "detail": "istilah" },
        { "mandarin": "法舰", "translate_to": "Armada Sakti", "detail": "istilah" },
        { "mandarin": "法舶", "translate_to": "Bahtera Sakti", "detail": "istilah" },
        { "mandarin": "异质", "translate_to": "zat asing", "detail": "istilah" },
        { "mandarin": "贡献点", "translate_to": "Poin Kontribusi", "detail": "istilah" },
        { "mandarin": "七峰城", "translate_to": "Kota Puncak Ke-7", "detail": "nama tempat" },
        { "mandarin": "妖神", "translate_to": "Dewa Siluman", "detail": "gelar/panggilan" },
        { "mandarin": "魔神", "translate_to": "Dewa Iblis", "detail": "gelar/panggilan" },
        { "mandarin": "雷队", "translate_to": "Kapten Lei", "detail": "gelar/panggilan" },
        { "mandarin": "七爷", "translate_to": "Tuan Ketujuh", "detail": "gelar/panggilan" },
        { "mandarin": "副峰主", "translate_to": "Wakil Ketua Puncak", "detail": "gelar/panggilan" },
        { "mandarin": "峰主", "translate_to": "Ketua Puncak", "detail": "gelar/panggilan" },
        { "mandarin": "老祖", "translate_to": "Leluhur", "detail": "gelar/panggilan" },
        { "mandarin": "金刚宗", "translate_to": "Sekte Vajra", "detail": "nama sekte" },
        { "mandarin": "七血瞳", "translate_to": "Sekte Tujuh Pupil Darah", "detail": "nama sekte" },
        { "mandarin": "天命花", "translate_to": "Bunga Takdir", "detail": "nama benda" },
        { "mandarin": "禁区", "translate_to": "Zona Terlarang", "detail": "istilah" },
        { "mandarin": "法窍", "translate_to": "Titik Magis", "detail": "istilah" },
        { "mandarin": "窍", "translate_to": "Titik Energi", "detail": "istilah" },
        { "mandarin": "连命符", "translate_to": "Jimat Penghubung Nyawa", "detail": "istilah" }, 
        { "mandarin": "无序传送符", "translate_to": "Jimat Teleportasi Acak", "detail": "istilah" }, 
        { "mandarin": "太阳銮驾", "translate_to": "Kereta Matahari", "detail": "istilah" }, 
        { "mandarin": "法体", "translate_to": "Tubuh Dharma", "detail": "istilah" },
        { "mandarin": "人鱼族", "translate_to": "Suku Duyung", "detail": "nama suku" },
        { "mandarin": "百音成阴", "translate_to": "Suara Seratus Kegelapan", "detail": "istilah" },
        { "mandarin": "运输司", "translate_to": "Divisi Transportasi", "detail": "istilah" },
        { "mandarin": "引水司", "translate_to": "Divisi Navigasi Pelabuhan", "detail": "istilah" },
        { "mandarin": "捕凶司", "translate_to": "Divisi Penangkap Pembunuh", "detail": "istilah" }
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
    if (typeof item.detail === 'string') {
      mainDetail = item.detail;
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

  // 3. Buat atau cek Glossary "Beyond Time Gaze"
  let glossary = await prisma.glossary.findFirst({
    where: { name: 'Beyond Time Gaze' },
  });

  if (!glossary) {
    glossary = await prisma.glossary.create({
      data: {
        name: 'Beyond Time Gaze',
        sourceLanguage: 'zh',
        targetLanguage: 'id',
        userId: adminUser.id,
      },
    });
    console.log('Glossary "Beyond Time Gaze" dibuat.');
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

  console.log(`Berhasil menyisipkan ${entriesToInsert.length} istilah ke dalam glossary "Beyond Time Gaze".`);
  console.log('Seeder selesai');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });