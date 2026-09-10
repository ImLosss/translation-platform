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
    { "mandarin": "三魂七魄", "translate_to": "tiga roh jiwa dan tujuh jiwa", "detail": "istilah jiwa/roh dalam kepercayaan Tiongkok" },
    { "mandarin": "还魂异术", "translate_to": "Sihir Ajaib Membangkitkan Jiwa", "detail": "teknik/sihir khusus" },
    { "mandarin": "十万大山", "translate_to": "Gunung Shiwan", "detail": "nama tempat/pegunungan" },
    { "mandarin": "黑巫族", "translate_to": "Suku Penyihir Hitam", "detail": "nama suku/klan" },
    { "mandarin": "小白", "translate_to": "Xiao Bai", "detail": "nama karakter/rubah putih" },
    { "mandarin": "小灰", "translate_to": "Xiao Hui", "detail": "nama karakter/kera" },
    { "mandarin": "三眼灵猴", "translate_to": "Kera Roh Bermata Tiga", "detail": "nama spesies/monster" },
    { "mandarin": "焚香谷", "translate_to": "Lembah Fenxiang", "detail": "nama tempat/sekte" },
    { "mandarin": "公子", "translate_to": "Tuan Muda", "detail": "istilah" },
    { "mandarin": "姑娘", "translate_to": "Nona", "detail": "istilah" },
    { "mandarin": "碧瑶", "translate_to": "Bi Yao", "detail": "nama karakter" },
    { "mandarin": "青云", "translate_to": "Qingyun", "detail": "nama sekte/tempat" },
    { "mandarin": "圣教", "translate_to": "Aliran Suci", "detail": "nama sekte/organisasi" },
    { "mandarin": "鬼王宗主", "translate_to": "Sekte Raja Setan", "detail": "nama sekte/organisasi" },
    { "mandarin": "狐岐山", "translate_to": "Gunung Huqi", "detail": "nama tempat/gunung" },
    { "mandarin": "金瓶儿", "translate_to": "Jin Ping'er", "detail": "nama karakter" },
    { "mandarin": "天书", "translate_to": "Kitab Langit", "detail": "nama kitab/artefak" },
    { "mandarin": "青云道法", "translate_to": "teknik bela diri Qingyun", "detail": "teknik bela diri/sekte" },
    { "mandarin": "雪琪", "translate_to": "Xueqi", "detail": "nama karakter" },
    { "mandarin": "师姐", "translate_to": "Kakak seperguruan", "detail": "panggilan senior perempuan" },
    { "mandarin": "兽神", "translate_to": "Dewa Binatang", "detail": "panggilan/gelar" },
    { "mandarin": "掌门", "translate_to": "Ketua Sekte", "detail": "jabatan pemimpin sekte" },
    { "mandarin": "南疆", "translate_to": "Perbatasan Selatan", "detail": "nama wilayah" },
    { "mandarin": "谷主", "translate_to": "Pemimpin Lembah", "detail": "jabatan pemimpin lembah/sekte" },
    { "mandarin": "云易岚", "translate_to": "Yun Yilan", "detail": "nama karakter" },
    { "mandarin": "中土", "translate_to": "Zhongtu", "detail": "nama wilayah/istilah geografi" },
    { "mandarin": "天音寺", "translate_to": "Kuil Tianyin", "detail": "nama kuil/tempat" },
    { "mandarin": "普泓大师", "translate_to": "Biksu Puhong", "detail": "nama biksu/karakter" },
    { "mandarin": "席商", "translate_to": "Aliran Iblis", "detail": "nama sekte/ajaran sesat" },
    { "mandarin": "师伯", "translate_to": "Paman Guru", "detail": "panggilan senior guru" },
    { "mandarin": "妙公子", "translate_to": "Nona Cantik", "detail": "istilah" },
    { "mandarin": "镇魔古洞", "translate_to": "Gua Kuno Penekan Iblis", "detail": "nama tempat" },
    { "mandarin": "不好", "translate_to": "Gawat", "detail": "istilah" },
    { "mandarin": "白虎", "translate_to": "Baihu", "detail": "nama karakter/roh pelindung" },
    { "mandarin": "鬼厉", "translate_to": "Gui Li", "detail": "nama karakter" },
    { "mandarin": "万毒门", "translate_to": "Sekte Ribuan Racun", "detail": "nama sekte" },
    { "mandarin": "合欢派", "translate_to": "Sekte Hehuan", "detail": "nama sekte" },
    { "mandarin": "天帝冥石", "translate_to": "Batu Kematian Raja Langit", "detail": "nama artefak/benda penting" },
    { "mandarin": "黑火", "translate_to": "Api Hitam", "detail": "istilah kekuatan/teknik" },
    { "mandarin": "天地灵脉", "translate_to": "nadi spiritual langit dan bumi", "detail": "jalur energi spiritual alam" },
    { "mandarin": "老神仙", "translate_to": "Dewa Tua", "detail": "panggilan untuk sosok sakti/tua" },
    { "mandarin": "妖物", "translate_to": "siluman", "detail": "makhluk iblis/monster" },
    { "mandarin": "劫数", "translate_to": "malapetaka", "detail": "bencana besar/istilah nasib buruk" },
    { "mandarin": "要道", "translate_to": "jalan penting", "detail": "jalur utama/strategis" },
    { "mandarin": "妖人", "translate_to": "siluman", "detail": "orang siluman/iblis" },
    { "mandarin": "妖女", "translate_to": "Wanita Siluman", "detail": "istilah" },
    { "mandarin": "魔教", "translate_to": "Aliran Iblis", "detail": "nama sekte/ajaran sesat" },
    { "mandarin": "正道", "translate_to": "Sekte Keadilan", "detail": "nama sekte/ajaran benar" },
    { "mandarin": "扣押", "translate_to": "menahan", "detail": "istilah hukum/menahan seseorang" },
    { "mandarin": "审讯", "translate_to": "interogasi", "detail": "istilah hukum/menanyai tersangka" },
    { "mandarin": "引火烧身", "translate_to": "mencelakai diri sendiri", "detail": "idiom/istilah peringatan" },
    { "mandarin": "邪物", "translate_to": "benda terjahat", "detail": "artefak/objek jahat" },
    { "mandarin": "青云门", "translate_to": "Sekte Qingyun", "detail": "nama sekte" },
    { "mandarin": "通天峰", "translate_to": "Puncak Tongtian", "detail": "nama tempat/puncak" },
    { "mandarin": "空桑山", "translate_to": "Gunung Kongshan", "detail": "nama tempat/gunung" },
    { "mandarin": "余擎", "translate_to": "Yu Qing", "detail": "nama karakter" },
    { "mandarin": "流波山", "translate_to": "Gunung Liubo", "detail": "nama tempat/gunung" },
    { "mandarin": "天琊剑", "translate_to": "Pedang Tianya", "detail": "nama pedang/artefak" },
    { "mandarin": "天不老", "translate_to": "Langit tidak tua", "detail": "idiom/puisi" },
    { "mandarin": "情难绝", "translate_to": "sulit untuk memutuskan hubungan", "detail": "idiom/puisi" },
    { "mandarin": "痴情人", "translate_to": "orang yang setia dengan hubungan", "detail": "idiom/puisi" },
    { "mandarin": "狐妖", "translate_to": "Siluman Rubah", "detail": "spesies/klan monster" },
    { "mandarin": "人狐之恋", "translate_to": "kisah cinta antara manusia dan rubah", "detail": "istilah legenda/puisi" },
    { "mandarin": "玄火坛", "translate_to": "Altar Api Hitam", "detail": "nama tempat/altar" },
    { "mandarin": "地火灵力", "translate_to": "kekuatan spiritual api bumi", "detail": "energi spiritual/istilah kultivasi" },
    { "mandarin": "血公子", "translate_to": "Tuan Muda Darah", "detail": "nama julukan/karakter" },
    { "mandarin": "结阵", "translate_to": "Bentuk formasi", "detail": "istilah pertarungan/kultivasi" },
    { "mandarin": "合", "translate_to": "Bersatu", "detail": "istilah pertarungan/kultivasi" },
    { "mandarin": "天水寨", "translate_to": "Desa Tianshui", "detail": "nama tempat/desa" },
    { "mandarin": "金族人", "translate_to": "Klan Emas", "detail": "nama klan/etnis" },
    { "mandarin": "七里峒", "translate_to": "Gua Qili", "detail": "nama tempat/gua" },
    { "mandarin": "燃血焚天", "translate_to": "Darah membara membakar langit", "detail": "nama jurus/teknik" },
    { "mandarin": "好剑术", "translate_to": "Teknik pedang yang bagus", "detail": "pujian teknik" },
    { "mandarin": "阿弥陀佛", "translate_to": "Amitabha", "detail": "istilah" },
    { "mandarin": "孽障", "translate_to": "Iblis", "detail": "istilah makhluk jahat" },
    { "mandarin": "绝世美人", "translate_to": "Paras tiada tara", "detail": "istilah kecantikan luar biasa" },
    { "mandarin": "九尾妖狐", "translate_to": "Siluman rubah berekor sembilan", "detail": "spesies monster legendaris" },
    { "mandarin": "幻术", "translate_to": "Sihir Ilusi", "detail": "jenis sihir/teknik ilusi" },
    { "mandarin": "大梵般若", "translate_to": "Mahabrahma Prajna", "detail": "mantra Buddha/istilah agama" },
    { "mandarin": "玄虚", "translate_to": "Misterius", "detail": "istilah sifat/keadaan" },
    { "mandarin": "玉尺", "translate_to": "Mistar Giok", "detail": "nama senjata/artefak" },
    { "mandarin": "大巫师", "translate_to": "Penyihir Agung", "detail": "jabatan pemimpin suku/klan" },
    { "mandarin": "性命", "translate_to": "Nyawa", "detail": "istilah" },
    { "mandarin": "熏神染骨", "translate_to": "Mencoreng para Dewa, menodai tulang", "detail": "idiom/puisi" },
    { "mandarin": "苍生", "translate_to": "Makhluk hidup", "detail": "istilah umum untuk semua makhluk" },
    { "mandarin": "死猴子", "translate_to": "Kera jelek", "detail": "panggilan ejekan" },
    { "mandarin": "上官师叔", "translate_to": "Paman Guru Shangguan", "detail": "panggilan senior keluarga Shangguan" },
    { "mandarin": "谷", "translate_to": "Lembah", "detail": "istilah tempat/sekte" },
    { "mandarin": "微末琐事", "translate_to": "Hal sepele", "detail": "istilah masalah kecil" },
    { "mandarin": "老夫", "translate_to": "Aku", "detail": "kata ganti diri orang tua" },
    { "mandarin": "登山拜访", "translate_to": "Berkunjung ke gunung", "detail": "istilah kunjungan formal" },
    { "mandarin": "玄火鉴", "translate_to": "Cermin Api Hitam", "detail": "nama artefak" },
    { "mandarin": "至宝", "translate_to": "Pusaka berharga", "detail": "istilah artefak penting" },
    { "mandarin": "圣器", "translate_to": "Artefak suci", "detail": "istilah artefak penting" },
    { "mandarin": "魔王", "translate_to": "Raja Iblis", "detail": "nama makhluk jahat" },
    { "mandarin": "危机", "translate_to": "Krisis", "detail": "istilah bahaya besar" },
    { "mandarin": "生灵", "translate_to": "Kehidupan", "detail": "istilah makhluk hidup" },
    { "mandarin": "灾厄", "translate_to": "Bencana", "detail": "istilah musibah besar" },
    { "mandarin": "族人", "translate_to": "Anggota klan", "detail": "istilah keluarga/klan" },
    { "mandarin": "罹难", "translate_to": "Dalam bencana", "detail": "istilah terkena musibah" },
    { "mandarin": "山雨欲来", "translate_to": "Mara bahaya akan datang", "detail": "idiom/puisi" },
    { "mandarin": "乘风而起", "translate_to": "Bangkit mengarungi badai", "detail": "idiom/puisi" },
    { "mandarin": "长老", "translate_to": "Tetua", "detail": "jabatan" },
    { "mandarin": "真人", "translate_to": "Ketua", "detail": "jabatan" },
    { "mandarin": "老七", "translate_to": "Murid Ketujuh", "detail": "istilah" },
    { "mandarin": "大竹峰一脉", "translate_to": "aliran Puncak Dazhu", "detail": "istilah" },
    { "mandarin": "小竹峰", "translate_to": "Puncak Xiaozhu", "detail": "nama tempat" },
    { "mandarin": "不易", "translate_to": "Buyi", "detail": "nama karakter" },
    { "mandarin": "落神关", "translate_to": "Gerbang Luoshen", "detail": "istilah" },
    { "mandarin": "戾气", "translate_to": "aura jahat", "detail": "istilah" },
    { "mandarin": "兽妖", "translate_to": "siluman monster", "detail": "istilah" },
    { "mandarin": "兽潮", "translate_to": "gelombang monster", "detail": "istilah" },
    { "mandarin": "毒蛇谷", "translate_to": "Lembah Racun Ular", "detail": "istilah" },
    { "mandarin": "秦无炎", "translate_to": "Qin Wuyan", "detail": "nama karakter" },
    { "mandarin": "噬魂", "translate_to": "Pemakan Jiwa", "detail": "istilah" },
    { "mandarin": "噬血珠", "translate_to": "Mutiara Penghisap Darah", "detail": "istilah" },
    { "mandarin": "合欢铃", "translate_to": "Lonceng Hehuan", "detail": "istilah" },
    { "mandarin": "八凶玄火法阵", "translate_to": "Formasi Api Hitam Delapan Bencana", "detail": "istilah" },
    { "mandarin": "方丈", "translate_to": "Kepala Kuil", "detail": "jabatan" },
    { "mandarin": "诛仙古剑", "translate_to": "Pedang Kuno Zhuxian", "detail": "nama senjata/artefak" },
    { "mandarin": "道长", "translate_to": "Daochang", "detail": "nama karakter" },
    { "mandarin": "鬼道一脉", "translate_to": "Aliran Ilmu Hantu", "detail": "istilah" },
    { "mandarin": "幻月洞府", "translate_to": "Gua Bulan Ilusi", "detail": "nama tempat" },
    { "mandarin": "后辈", "translate_to": "junior", "detail": "istilah" },
    { "mandarin": "后玄水凝殇辈", "translate_to": "Tangisan Es Misterius", "detail": "nama teknik" },
    { "mandarin": "青云禁制", "translate_to": "Larangan Qingyun", "detail": "istilah teknik" },
    { "mandarin": "太极玄清道", "translate_to": "Metode Taiji Xuanqing", "detail": "istilah teknik" },
    { "mandarin": "斩龙剑", "translate_to": "Pedang Penebas Naga", "detail": "istilah senjata" },
    { "mandarin": "道友", "translate_to": "Rekan Dao", "detail": "istilah" },
    { "mandarin": "墨雪", "translate_to": "Mo Xue", "detail": "nama pedang" },
    { "mandarin": "八凶玄火阵", "translate_to": "Formasi Api Hitam Delapan Bencana", "detail": "istilah" },
    { "mandarin": "伏魔大阵", "translate_to": "Formasi Besar Penakluk Iblis", "detail": "istilah" },
    { "mandarin": "无字玉璧", "translate_to": "Giok Tanpa Aksara", "detail": "istilah" },
    { "mandarin": "张施主", "translate_to": "Penderma Zhang", "detail": "istilah" },
    { "mandarin": "万业城", "translate_to": "Kota Segala Dosa", "detail": "istilah" },
    { "mandarin": "伏龙鼎", "translate_to": "Kuali Penakluk Naga", "detail": "istilah" },
    { "mandarin": "聚火盆", "translate_to": "Wadah Pengumpul Api", "detail": "nama benda" },
    { "mandarin": "师弟", "translate_to": "Adik Seperguruan", "detail": "panggilan junior seperguruan" },
    { "mandarin": "烛龙", "translate_to": "Naga Lilin", "detail": "nama makhluk" }
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
  //   if (typeof item.details === 'string') {
  //     mainDetail = item.details;
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

  // 3. Buat atau cek Glossary "Jade Dynasty"
  let glossary = await prisma.glossary.findFirst({
    where: { name: 'Jade Dynasty' },
  });

  if (!glossary) {
    glossary = await prisma.glossary.create({
      data: {
        name: 'Jade Dynasty',
        sourceLanguage: 'zh',
        targetLanguage: 'id',
        userId: adminUser.id,
      },
    });
    console.log('Glossary "Jade Dynasty" dibuat.');
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

  console.log(`Berhasil menyisipkan ${entriesToInsert.length} istilah ke dalam glossary "Jade Dynasty".`);
  console.log('Seeder selesai');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });