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
        { "mandarin": "结丹", "replace": "Core Formation" },
        { "mandarin": "元婴", "replace": "Nascent Soul" },
        { "mandarin": "化神", "replace": "Soul Formation" },
        { "mandarin": "婴变", "replace": "Soul Transformation" },
        { "mandarin": "问鼎", "replace": "Ascendant" },
        { "mandarin": "阴虚", "replace": "Illusory Yin" },
        { "mandarin": "阳实", "replace": "Corporeal Yang" },
        { "mandarin": "窥涅", "replace": "Nirvana Scryer" },
        { "mandarin": "净涅", "replace": "Nirvana Cleanser" },
        { "mandarin": "碎涅", "replace": "Nirvana Shatterer" },
        { "mandarin": "天人五衰", "replace": "Heaven's Blight" },
        { "mandarin": "空涅", "replace": "Nirvana Void" },
        { "mandarin": "空灵", "replace": "Spirit Void" },
        { "mandarin": "空玄", "replace": "Arcane Void" },
        { "mandarin": "空劫", "replace": "Void Tribulation" },
        { "mandarin": "半步踏天境", "replace": "Half-step Heaven Trampling" },
        { "mandarin": "第四步", "replace": "Heaven Trampling" },
        { "mandarin": "上仙", "replace": "Immortal Agung", "detail": "setara Ascendat - Illusory Yin" },
        { "mandarin": "天仙", "replace": "Immortal Langit", "detail": "setara Corporeal Yang - Nirvana Scryer" },
        { "mandarin": "仙王", "replace": "Immortal King", "detail": "setara Corporeal Nirvana Cleanser" },
        { "mandarin": "仙君", "replace": "Immortal Lord", "detail": "setara Corporeal Nirvana Shatterer - Heavens Blight" },
        { "mandarin": "仙帝", "replace": "Immortal Emperor", "detail": "setara Kultivator Langkah Ketiga" }
    ],
    "REPLACE_AND_LEARN": [
        { "mandarin": "雪域国", "translate_to": "Negara Domain Salju", "detail": "nama negara" },
        { "mandarin": "雪域", "translate_to": "Domain Salju", "detail": "nama wilayah/negara" },
        { "mandarin": "皇族", "translate_to": "keluarga Kerajaan", "detail": "istilah bangsawan/kerajaan" },
        { "mandarin": "修士", "translate_to": "Kultivator", "detail": "praktisi kultivasi" },
        { "mandarin": "凡人", "translate_to": "orang biasa", "detail": "manusia biasa, bukan kultivator" },
        { "mandarin": "奴隶", "translate_to": "Budak", "detail": "istilah status sosial" },
        { "mandarin": "冰雕", "translate_to": "Patung Es", "detail": "artefak/magic item" },
        { "mandarin": "阵法", "translate_to": "formasi", "detail": "formasi sihir/array" },
        { "mandarin": "功法", "translate_to": "teknik/keterampilan", "detail": "teknik kultivasi" },
        { "mandarin": "大长老", "translate_to": "Tetua Agung", "detail": "jabatan senior sekte" },
        { "mandarin": "四派", "translate_to": "Empat Faksi", "detail": "nama kelompok/aliansi" },
        { "mandarin": "朱雀国", "translate_to": "Negara Vermillion", "detail": "nama negara" },
        { "mandarin": "灵岳国", "translate_to": "Negara Lingyue", "detail": "nama negara" },
        { "mandarin": "修真国", "translate_to": "negara kultivasi", "detail": "negara khusus kultivator" },
        { "mandarin": "城主", "translate_to": "Penguasa Kota", "detail": "jabatan pemimpin kota" },
        { "mandarin": "师兄", "translate_to": "Senior", "detail": "panggilan kakak seperguruan laki-laki" },
        { "mandarin": "师父", "translate_to": "Guru", "detail": "panggilan guru" },
        { "mandarin": "师尊", "translate_to": "Guru Agung", "detail": "panggilan guru (lebih hormat)" },
        { "mandarin": "弟子", "translate_to": "Murid", "detail": "panggilan murid" },
        { "mandarin": "冰胚", "translate_to": "Embrio Es", "detail": "artefak/material kultivasi" },
        { "mandarin": "雪仙冰胚", "translate_to": "Embrio Es Salju Abadi", "detail": "artefak/material kultivasi" },
        { "mandarin": "雪经脉", "translate_to": "meridian salju", "detail": "jalur energi khusus" },
        { "mandarin": "冰清诀", "translate_to": "Teknik Es Murni", "detail": "nama teknik kultivasi" },
        { "mandarin": "大师兄", "translate_to": "Kakak Senior", "detail": "panggilan senior tertua" },
        { "mandarin": "傀儡", "translate_to": "boneka hidup", "detail": "prajurit/artefak otomatis" },
        { "mandarin": "黑魂派", "translate_to": "Sekte Jiwa Hitam", "detail": "nama sekte" },
        { "mandarin": "巨灵门", "translate_to": "Sekte Giant Spirit", "detail": "nama sekte" },
        { "mandarin": "玄渊派", "translate_to": "Sekte Xuanyuan", "detail": "nama sekte" },
        { "mandarin": "少主", "translate_to": "Tuan Muda", "detail": "anak pemimpin sekte/klan" },
        { "mandarin": "前辈", "translate_to": "Senior", "detail": "panggilan hormat untuk yang lebih tua/berpengalaman" },
        { "mandarin": "晚辈", "translate_to": "Junior", "detail": "panggilan diri untuk yang lebih muda" },
        { "mandarin": "丹药", "translate_to": "pil", "detail": "obat kultivasi" },
        { "mandarin": "主子", "translate_to": "Tuan", "detail": "panggilan pelayan kepada majikan" },
        { "mandarin": "赵国", "translate_to": "Negara Zhao", "detail": "nama negara fiksi" },
        { "mandarin": "宗门", "translate_to": "Sekte", "detail": "organisasi kultivasi/klan besar" },
        { "mandarin": "仙界", "translate_to": "Dunia Abadi", "detail": "alam para immortal" },
        { "mandarin": "法宝", "translate_to": "harta pusaka", "detail": "senjata/magic item tingkat tinggi" },
        { "mandarin": "禁幡", "translate_to": "Bendera Terlarang", "detail": "nama artefak/spesifik item" },
        { "mandarin": "天逆珠", "translate_to": "Manik Penentang Langit", "detail": "nama artefak/spesifik item" },
        { "mandarin": "灵兽", "translate_to": "Binatang Roh", "detail": "hewan spiritual" },
        { "mandarin": "古神之地", "translate_to": "Tanah Dewa Kuno", "detail": "tempat/alam khusus" },
        { "mandarin": "古神", "translate_to": "Dewa Kuno", "detail": "istilah" },
        { "mandarin": "不好", "translate_to": "Gawat", "detail": "istilah" },
        { "mandarin": "金炎", "translate_to": "Jinyan", "detail": "istilah" },
        { "mandarin": "升仙果", "translate_to": "Buah Kenaikan Abadi", "detail": "istilah" },
        { "mandarin": "元力", "translate_to": "Energi Asal", "detail": "istilah" },
        { "mandarin": "雷仙殿", "translate_to": "Kuil Abadi Petir", "detail": "nama tempat" },
        { "mandarin": "关卡", "translate_to": "area inti", "detail": "bagian penting/ruang ujian" },
        { "mandarin": "天劫", "translate_to": "Petaka Langit", "detail": "bencana surgawi/tribulasi" },
        { "mandarin": "小成", "translate_to": "tingkat dasar", "detail": "tahapan kemajuan teknik/artefak" },
        { "mandarin": "中成", "translate_to": "tingkat menengah", "detail": "tahapan kemajuan teknik/artefak" },
        { "mandarin": "杀手锏", "translate_to": "senjata rahasia", "detail": "trik pamungkas" },
        { "mandarin": "混元驱兽圈", "translate_to": "Cincin Penjinak Binatang", "detail": "nama artefak/spesifik item" },
        { "mandarin": "妖兽", "translate_to": "Binatang Siluman", "detail": "hewan buas tingkat tinggi" },
        { "mandarin": "荒兽", "translate_to": "Binatang Primitif", "detail": "hewan purba/tingkat tinggi" },
        { "mandarin": "蛟龙", "translate_to": "Naga", "detail": "makhluk mitologi" },
        { "mandarin": "雷蛙", "translate_to": "Katak Petir", "detail": "nama monster/spesifik makhluk" },
        { "mandarin": "灵气", "translate_to": "kekuatan spiritual", "detail": "energi spiritual" },
        { "mandarin": "锁定", "translate_to": "kekangan", "detail": "status terikat/terkunci" },
        { "mandarin": "域外战场", "translate_to": "Medan Perang Ekstrateritorial", "detail": "nama tempat/arena pertempuran" },
        { "mandarin": "武文国", "translate_to": "Negara Wuwen", "detail": "nama negara fiksi" },
        { "mandarin": "使者", "translate_to": "Utusan", "detail": "jabatan/gelar" },
        { "mandarin": "游魂", "translate_to": "jiwa pengembara", "detail": "roh gentayangan" },
        { "mandarin": "道友", "translate_to": "rekan kultivator", "detail": "sapaan antar kultivator" },
        { "mandarin": "家族老祖宗", "translate_to": "Leluhur keluarga", "detail": "pendiri/leluhur keluarga" },
        { "mandarin": "魔头", "translate_to": "Monster", "detail": "iblis/penjahat besar" },
        { "mandarin": "法器", "translate_to": "artefak", "detail": "alat sihir tingkat tinggi" },
        { "mandarin": "元神", "translate_to": "Roh Primordial", "detail": "jiwa utama/kekuatan inti" },
        { "mandarin": "草帽", "translate_to": "topi", "detail": "topi jerami/topi sederhana" },
        { "mandarin": "离冥草帽", "translate_to": "Topi Jerami", "detail": "nama artefak/spesifik item" },
        { "mandarin": "古仙", "translate_to": "Immortal Kuno", "detail": "immortal zaman dahulu" },
        { "mandarin": "雨鼎", "translate_to": "Tungku Hujan", "detail": "nama artefak/spesifik item" },
        { "mandarin": "血魂丹", "translate_to": "Pil Jiwa Darah", "detail": "nama artefak/spesifik item" },
        { "mandarin": "仙兽", "translate_to": "Binatang Abadi", "detail": "hewan tingkat immortal" },
        { "mandarin": "仙兽之粮", "translate_to": "Makanan Binatang Abadi", "detail": "makanan khusus untuk binatang abadi" },
        { "mandarin": "仙人禁制", "translate_to": "larangan Immortal", "detail": "penghalang/larangan" },
        { "mandarin": "心禁", "translate_to": "larangan hati", "detail": "penghalang/larangan" },
        { "mandarin": "神识", "translate_to": "kesadaran ilahi", "detail": "istilah" },
        { "mandarin": "藏品阁", "translate_to": "Paviliun Koleksi", "detail": "nama tempat" },
        { "mandarin": "仙卫", "translate_to": "Pengawal Abadi", "detail": "istilah" },
        { "mandarin": "洞府", "translate_to": "kediaman (gua)", "detail": "istilah" },
        { "mandarin": "仙宝", "translate_to": "harta abadi", "detail": "artefak tingkat immortal" },
        { "mandarin": "仙玉", "translate_to": "Giok Abadi", "detail": "batu giok tingkat immortal" },
        { "mandarin": "仙剑", "translate_to": "Pedang Abadi", "detail": "pedang tingkat immortal" },
        { "mandarin": "仙器", "translate_to": "Artefak Abadi", "detail": "senjata/artefak tingkat immortal" },
        { "mandarin": "金色铁片", "translate_to": "potongan logam emas", "detail": "item/material khusus" },
        { "mandarin": "弥寻决", "translate_to": "Teknik Penerawangan", "detail": "nama teknik" },
        { "mandarin": "大罗剑宗", "translate_to": "Sekte Pedang Daluo", "detail": "nama sekte" },
        { "mandarin": "青色的葫芦", "translate_to": "Labu Hijau", "detail": "artefak/spesifik item" },
        { "mandarin": "洗灵葫", "translate_to": "Labu Pembersih Jiwa", "detail": "artefak/spesifik item" },
        { "mandarin": "洗灵之木", "translate_to": "Kayu Pembersih Jiwa", "detail": "material/artefak khusus" },
        { "mandarin": "仙界之气", "translate_to": "Energi dunia abadi", "detail": "energi spiritual tingkat immortal" },
        { "mandarin": "尸骸", "translate_to": "mayat", "detail": "jasad/tubuh mati" },
        { "mandarin": "道行", "translate_to": "kemampuan (kultivasi)", "detail": "tingkat pencapaian kultivasi" },
        { "mandarin": "法力", "translate_to": "kekuatan magis", "detail": "energi sihir/magis" },
        { "mandarin": "十息", "translate_to": "sepuluh napas", "detail": "satuan waktu dalam kultivasi" },
        { "mandarin": "八息", "translate_to": "delapan napas", "detail": "satuan waktu dalam kultivasi" },
        { "mandarin": "介散修", "translate_to": "kultivator pengembara", "detail": "kultivator tanpa sekte" },
        { "mandarin": "碎片", "translate_to": "pecahan", "detail": "bagian yang terpisah, biasanya dunia/alam" },
        { "mandarin": "仙人", "translate_to": "Immortal", "detail": "makhluk abadi tingkat tinggi" },
        { "mandarin": "造化", "translate_to": "takdir/nasib", "detail": "nasib, keberuntungan, kekuatan alam" },
        { "mandarin": "意境", "translate_to": "Konsepsi", "detail": "pencerahan/realm of intent, konsep pencerahan dalam kultivasi" },
        { "mandarin": "生死意境", "translate_to": "Konsepsi Kehidupan dan Kematian", "detail": "konsepsi" },
        { "mandarin": "仙力", "translate_to": "kekuatan abadi", "detail": "energi/tenaga tingkat immortal" },
        { "mandarin": "仙尊", "translate_to": "Venerable Immortal", "detail": "gelar immortal tingkat tinggi" },
        { "mandarin": "剑魂", "translate_to": "Jiwa Pedang", "detail": "roh/jiwa pedang, entitas spiritual" },
        { "mandarin": "仙指印", "translate_to": "Segel Abadi", "detail": "teknik segel tingkat immortal" },
        { "mandarin": "妻子", "translate_to": "istri", "detail": "pasangan perempuan" },
        { "mandarin": "雨之仙剑", "translate_to": "Pedang Abadi Hujan", "detail": "nama pedang abadi" },
        { "mandarin": "混元宗", "translate_to": "Sekte Primal Chaos", "detail": "nama sekte" },
        { "mandarin": "天魔门", "translate_to": "Sekte Heavenly Demon", "detail": "nama sekte" },
        { "mandarin": "天地六合派", "translate_to": "Sekte Six Path Nature", "detail": "nama sekte" },
        { "mandarin": "卖弄", "translate_to": "pamer", "detail": "memamerkan kemampuan" },
        { "mandarin": "五感", "translate_to": "lima indra", "detail": "istilah" },
        { "mandarin": "因果", "translate_to": "Karma", "detail": "istilah" },
        { "mandarin": "站住", "translate_to": "berhenti!", "detail": "istilah" },
        { "mandarin": "黑白图画", "translate_to": "gambar hitam dan putih", "detail": "lukisan/ilustrasi hitam putih" },
        { "mandarin": "轮回生死轴", "translate_to": "Poros Reinkarnasi Hidup dan Mati", "detail": "konsep siklus reinkarnasi" },
        { "mandarin": "高手", "translate_to": "master", "detail": "ahli, orang hebat" },
        { "mandarin": "叱虎", "translate_to": "Chihu", "detail": "nama orang" },
        { "mandarin": "朱雀星", "translate_to": "Planet Vermillion", "detail": "nama planet/tempat" },
        { "mandarin": "天运子", "translate_to": "Tian Yunzi", "detail": "nama orang" },
        { "mandarin": "曾牛", "translate_to": "Zeng Niu", "detail": "nama orang" },
        { "mandarin": "巨魔族", "translate_to": "Klan Iblis Raksasa", "detail": "nama klan/ras" },
        { "mandarin": "红蝶", "translate_to": "Hong Die", "detail": "nama orang" },
        { "mandarin": "天之骄女", "translate_to": "wanita jenius", "detail": "gelar perempuan berbakat" },
        { "mandarin": "天魂国", "translate_to": "Negara Tianhun", "detail": "nama negara fiksi" },
        { "mandarin": "朱雀圣山", "translate_to": "Gunung Suci Vermillion", "detail": "nama tempat" },
        { "mandarin": "天道", "translate_to": "Hukum Langit", "detail": "istilah" },
        { "mandarin": "逆天道", "translate_to": "Menentang Hukum Langit", "detail": "istilah" },
        { "mandarin": "天意", "translate_to": "Kehendak Langit", "detail": "istilah" },
        { "mandarin": "魂幡", "translate_to": "Bendera Jiwa", "detail": "istilah" },
        { "mandarin": "天兆旗", "translate_to": "Bendera Tianzhao", "detail": "istilah" },
        { "mandarin": "炼魂", "translate_to": "Soul Refining", "detail": "istilah" },
        { "mandarin": "抽魄", "translate_to": "Soul Extraction", "detail": "istilah" },
        { "mandarin": "锁神", "translate_to": "Soul Lock", "detail": "istilah" },
        { "mandarin": "生之烙印", "translate_to": "Jejak Kehidupan", "detail": "istilah" },
        { "mandarin": "死气 ", "translate_to": "Aura Kematian", "detail": "istilah" },
        { "mandarin": "杀戮之气 ", "translate_to": "Aura Pembantaian", "detail": "istilah" },
        { "mandarin": "遁天始祖", "translate_to": "Leluhur Duntian", "detail": "nama orang" },
        { "mandarin": "野人", "translate_to": "Manusia Liar", "detail": "istilah" },
        { "mandarin": "符傀", "translate_to": "Boneka Jimat", "detail": "istilah" },
        { "mandarin": "仙遗族", "translate_to": "Suku Peninggalan Abadi", "detail": "suku" },
        { "mandarin": "术咒师", "translate_to": "Master Kutukan", "detail": "julukan" },
        { "mandarin": "战咒师", "translate_to": "Master Kutukan Perang", "detail": "julukan" },
        { "mandarin": "符叶", "translate_to": "Simbol Daun", "detail": "istilah" },
        { "mandarin": "金符", "translate_to": "Simbol Emas", "detail": "istilah" },
        { "mandarin": "术法", "translate_to": "Teknik Sihir", "detail": "istilah" },
        { "mandarin": "朱雀子", "translate_to": "Ketua Vermillion", "detail": "jabatan/gelar" },
        { "mandarin": "修星之晶 ", "translate_to": "Kristal Bintang", "detail": "istilah" },
        { "mandarin": "修星之心 ", "translate_to": "Hati Kultivasi Bintang", "detail": "istilah" },
        { "mandarin": "拓森 ", "translate_to": "Tuo Sen", "detail": "nama orang" },
        { "mandarin": "云雀子 ", "translate_to": "Yunque Zi", "detail": "nama orang" },
        { "mandarin": "地魄门 ", "translate_to": "Sekte Earth Soul", "detail": "nama sekte" },
        { "mandarin": "天玉宗 ", "translate_to": "Sekte Heavenly Jade", "detail": "nama sekte" },
        { "mandarin": "水墨国 ", "translate_to": "Negara Shuimo", "detail": "nama negara" },
        { "mandarin": "牡丹国 ", "translate_to": "Negara Mudan", "detail": "nama negara" },
        { "mandarin": "秦国", "translate_to": "Negara Qin", "detail": "nama negara" },
        { "mandarin": "朱雀墓 ", "translate_to": "Makam Vermillion", "detail": "nama tempat" },
        { "mandarin": "潮汐深渊 ", "translate_to": "Jurang Pasang Surut", "detail": "nama tempat" },
        { "mandarin": "轮回树 ", "translate_to": "Pohon Reinkarnasi", "detail": "istilah" },
        { "mandarin": "炉鼎 ", "translate_to": "tungku", "detail": "istilah" },
        { "mandarin": "天运星 ", "translate_to": "Planet Tianyun", "detail": "nama planet" },
        { "mandarin": "弥勒宗 ", "translate_to": "Sekte Maitreya", "detail": "nama sekte" },
        { "mandarin": "万夫侯 ", "translate_to": "Marquis", "detail": "nama gelar" },
        { "mandarin": "雷吉 ", "translate_to": "Lei Ji", "detail": "nama orang" },
        { "mandarin": "孙云 ", "translate_to": "Sun Yun", "detail": "nama orang" },
        { "mandarin": "千幻无情 ", "translate_to": "Seribu Ilusi Tanpa Perasaan", "detail": "konsepsi/teknik" },
        { "mandarin": "星引 ", "translate_to": "Bintang Penunjuk", "detail": "istilah" },
        { "mandarin": "命魂 ", "translate_to": "Jiwa Takdir", "detail": "istilah" },
        { "mandarin": "灵山 ", "translate_to": "Gunung Spiritual", "detail": "nama tempat" },
        { "mandarin": "无限的欲望 ", "translate_to": "hasrat tak terbatas", "detail": "nama konsepsi" },
        { "mandarin": "乾风 ", "translate_to": "Qian Feng", "detail": "nama karakter" },
        { "mandarin": "仙印阁 ", "translate_to": "Paviliun Segel Abadi", "detail": "nama tempat" },
        { "mandarin": "金海外 ", "translate_to": "Luar Lautan Emas", "detail": "istilah" },
        { "mandarin": "玉简 ", "translate_to": "Slip Giok", "detail": "istilah" },
        { "mandarin": "古神血剑 ", "translate_to": "Pedang Darah Dewa Kuno", "detail": "nama senjata" },
        { "mandarin": "昆极鞭 ", "translate_to": "Cambuk Kunji", "detail": "nama senjata" },
        { "mandarin": "夺舍之法 ", "translate_to": "Teknik Pengambilan Tubuh", "detail": "nama senjata" },
        { "mandarin": "忆之传承 ", "translate_to": "Warisan Ingatan", "detail": "istilah" },
        { "mandarin": "炉鼎逆转之术 ", "translate_to": "Teknik Pembalikan Tungku", "detail": "istilah teknik" },
        { "mandarin": "青龙 ", "translate_to": "Naga Azure", "detail": "nama monster/spesifik makhluk" },
        { "mandarin": "天兽", "translate_to": "Binatang Langit", "detail": "makhluk tingkat tinggi, di atas Binatang Roh" },
        { "mandarin": "本尊", "translate_to": "Tubuh Asli", "detail": "istilah saat Klon Wang Lin memanggil tubuh asli" },
        { "mandarin": "交易星", "translate_to": "Planet Perdagangan", "detail": "nama planet" },
        { "mandarin": "黑墨星", "translate_to": "Planet Heimo", "detail": "nama planet" },
        { "mandarin": "魔焰", "translate_to": "Api Iblis", "detail": "istilah" },
        { "mandarin": "寂灭指", "translate_to": "Jari Pemusnah", "detail": "nama teknik" },
        { "mandarin": "化魔指", "translate_to": "Jari Transformasi Iblis", "detail": "nama teknik" },
        { "mandarin": "黄泉指", "translate_to": "Jari Alam Kematian", "detail": "nama teknik" },
        { "mandarin": "影遁", "translate_to": "Pelarian Bayangan", "detail": "nama teknik" },
        { "mandarin": "黄泉之河", "translate_to": "Sungai Alam Kematian", "detail": "nama tempat" },
        { "mandarin": "星罗盘", "translate_to": "Kompas Bintang", "detail": "artefak berbentuk piringan" },
        { "mandarin": "血罗盘", "translate_to": "Kompas Darah", "detail": "artefak berbentuk piringan" },
        { "mandarin": "墨雪液", "translate_to": "Cairan Moxue", "detail": "nama bahan" },
        { "mandarin": "七彩琉璃光", "translate_to": "Cahaya Tujuh Warna", "detail": "nama benda" },
        { "mandarin": "点仙笔", "translate_to": "Pena Pencerahan Immortal", "detail": "nama benda" },
        { "mandarin": "捆仙网", "translate_to": "Jaring Pengikat Immortal", "detail": "nama benda" },
        { "mandarin": "战妖鼓", "translate_to": "Genderang Perang Siluman", "detail": "nama benda" },
        { "mandarin": "帝剑", "translate_to": "Pedang Kaisar", "detail": "nama benda" },
        { "mandarin": "天运七子", "translate_to": "Tujuh Murid Tianyun", "detail": "gelar kehormatan tujuh murid jenius Sekte Tianyun" },
        { "mandarin": "紫宗", "translate_to": "Cabang Ungu", "detail": "Cabang Sekte Tianyun" },
        { "mandarin": "紫云阁", "translate_to": "Paviliun Awan Ungu", "detail": "nama tempat" },
        { "mandarin": "紫林阁", "translate_to": "Paviliun Hutan Ungu", "detail": "nama tempat" },
        { "mandarin": "洪牢", "translate_to": "Penjara Hong", "detail": "nama tempat" },
        { "mandarin": "废弃星球", "translate_to": "Planet Terlantar", "detail": "istilah ejekan" },
        { "mandarin": "执法长老", "translate_to": "Tetua Penegak Hukum", "detail": "istilah" },
        { "mandarin": "禁术", "translate_to": "Teknik Terlarang", "detail": "istilah" },
        { "mandarin": "梅花十八禁", "translate_to": "18 Larangan Plum Blossom", "detail": "istilah" },
        { "mandarin": "仙魔体", "translate_to": "Tubuh Abadi Iblis", "detail": "nama teknik" },
        { "mandarin": "定身术", "translate_to": "Teknik Pengunci Tubuh", "detail": "nama teknik" },
        { "mandarin": "斩罗诀", "translate_to": "Teknik Penebas Jaring", "detail": "nama teknik" },
        { "mandarin": "周晚", "translate_to": "Zhou Wan", "detail": "nama karakter" },
        { "mandarin": "白薇", "translate_to": "Bai Wei", "detail": "nama karakter" },
        { "mandarin": "金烨", "translate_to": "Jin Ye", "detail": "nama karakter" },
        { "mandarin": "陈涛", "translate_to": "Chen Tao", "detail": "nama karakter" },
        { "mandarin": "赤裂", "translate_to": "Chi Lie", "detail": "nama karakter" },
        { "mandarin": "赵欣梦", "translate_to": "Zhao Xinmeng", "detail": "nama karakter" },
        { "mandarin": "赵星煞", "translate_to": "Zhao Xingsha", "detail": "nama karakter" },
        { "mandarin": "封号", "translate_to": "Gelar", "detail": "istilah" },
        { "mandarin": "仙术", "translate_to": "Teknik Immortal", "detail": "istilah" },
        { "mandarin": "金仙", "translate_to": "Abadi Emas", "detail": "istilah" },
        { "mandarin": "卷", "translate_to": "Gulungan", "detail": "istilah" },
        { "mandarin": "封号之战", "translate_to": "Pertempuran Gelar", "detail": "istilah" },
        { "mandarin": "赤霄云芒", "translate_to": "Awan Langit Merah", "detail": "istilah" },
        { "mandarin": "龙潭", "translate_to": "Kolam Naga", "detail": "nama tempat" },
        { "mandarin": "罗天星域", "translate_to": "Domain Bintang Luotian", "detail": "nama tempat" },
        { "mandarin": "星域", "translate_to": "Domain Bintang", "detail": "istilah" },
        { "mandarin": "星", "translate_to": "Planet", "detail": "istilah" },
        { "mandarin": "东临星", "translate_to": "Planet Donglin", "detail": "nama planet" },
        { "mandarin": "向家", "translate_to": "Keluarga Xiang", "detail": "nama keluarga" },
        { "mandarin": "天威", "translate_to": "Wibawa Langit", "detail": "istilah" },
        { "mandarin": "挪移之术", "translate_to": "Teknik Teleportasi", "detail": "nama teknik" },
        { "mandarin": "地疮", "translate_to": "Korosi Bumi", "detail": "nama teknik" },
        { "mandarin": "天脓", "translate_to": "Pencemaran Langit", "detail": "nama teknik" },
        { "mandarin": "引仙术", "translate_to": "Teknik Pemanggilan Immortal", "detail": "nama teknik" },
        { "mandarin": "杀戮仙诀", "translate_to": "Teknik Pembantaian Immortal", "detail": "nama teknik" },
        { "mandarin": "呼风", "translate_to": "Pemanggil Angin", "detail": "nama teknik" },
        { "mandarin": "九转炼仙诀", "translate_to": "Teknik Pemurnian Sembilan Putaran", "detail": "nama teknik" },
        { "mandarin": "修仙", "translate_to": "Kultivasi Immortal", "detail": "istilah" },
        { "mandarin": "入魔果", "translate_to": "Buah Iblis", "detail": "istilah" },
        { "mandarin": "修真", "translate_to": "Kultivasi Kebenaran", "detail": "istilah" },
        { "mandarin": "妖影道", "translate_to": "Jalan Bayangan Siluman", "detail": "istilah kultivasi" },
        { "mandarin": "修道", "translate_to": "Kultivasi Dao", "detail": "istilah" },
        { "mandarin": "星狼貂", "translate_to": "Musang Bintang", "detail": "nama monster/spesifik makhluk" },
        { "mandarin": "剑尊凌天候", "translate_to": "Venerable Pedang Ling Tianhou", "detail": "nama karakter/gelar" },
        { "mandarin": "碎仙之地", "translate_to": "Tanah Penghancur Immortal", "detail": "istilah" },
        { "mandarin": "妖灵之门", "translate_to": "Gerbang Roh Siluman", "detail": "istilah" },
        { "mandarin": "妖灵之地", "translate_to": "Tanah Roh Siluman", "detail": "istilah" },
        { "mandarin": "耀金果", "translate_to": "Buah Emas Berkilau", "detail": "istilah" },
        { "mandarin": "血祖", "translate_to": "Leluhur Darah", "detail": "nama karakter" },
        { "mandarin": "十三", "translate_to": "Shisan", "detail": "nama karakter" },
        { "mandarin": "姚惜雪", "translate_to": "Yao Xixue", "detail": "nama karakter" },
        { "mandarin": "妖晶", "translate_to": "Kristal Siluman", "detail": "istilah" },
        { "mandarin": "朝仙台", "translate_to": "Altar Zhaoxian", "detail": "istilah" },
        { "mandarin": "三甲妖晶", "translate_to": "Kristal Siluman Tingkat Tiga", "detail": "istilah" },
        { "mandarin": "道心", "translate_to": "Hati Dao", "detail": "istilah" },
        { "mandarin": "始境", "translate_to": "Ranah Awal Mula", "detail": "istilah kultivasi" },
        { "mandarin": "极境", "translate_to": "Ranah Ekstrem", "detail": "istilah kultivasi" },
        { "mandarin": "妖灵试炼", "translate_to": "Ujian Roh Siluman", "detail": "istilah" },
        { "mandarin": "妖帝", "translate_to": "Kaisar Siluman", "detail": "gelar" },
        { "mandarin": "鬼真人", "translate_to": "Petapa Hantu", "detail": "gelar" },
        { "mandarin": "妖帅", "translate_to": "Panglima Siluman", "detail": "gelar/jabatan" },
        { "mandarin": "副帅", "translate_to": "Wakil Panglima", "detail": "gelar/jabatan" },
        { "mandarin": "帅", "translate_to": "Panglima", "detail": "gelar/jabatan" },
        { "mandarin": "参军", "translate_to": "Penasihat Militer", "detail": "gelar/jabatan" },
        { "mandarin": "妖将", "translate_to": "Jenderal Siluman", "detail": "gelar/jabatan" },
        { "mandarin": "将", "translate_to": "Jenderal", "detail": "gelar/jabatan" },
        { "mandarin": "统领", "translate_to": "Komandan", "detail": "gelar/jabatan" },
        { "mandarin": "副统领", "translate_to": "Wakil Komandan", "detail": "gelar/jabatan" },
        { "mandarin": "副将", "translate_to": "Wakil Jenderal", "detail": "gelar/jabatan" },
        { "mandarin": "统队", "translate_to": "Kapten Pasukan", "detail": "gelar/jabatan" },
        { "mandarin": "都统", "translate_to": "Penguasa Wilayah", "detail": "gelar/jabatan" },
        { "mandarin": "黑甲营", "translate_to": "Pasukan Zirah Hitam", "detail": "gelar/jabatan" },
        { "mandarin": "天妖郡", "translate_to": "Wilayah Siluman Langit", "detail": "nama tempat" },
        { "mandarin": "火妖郡", "translate_to": "Wilayah Siluman Api", "detail": "nama tempat" },
        { "mandarin": "水妖郡", "translate_to": "Wilayah Siluman Air", "detail": "nama tempat" },
        { "mandarin": "古妖城", "translate_to": "Kota Siluman Kuno", "detail": "nama tempat" },
        { "mandarin": "神通", "translate_to": "Teknik Ilahi", "detail": "istilah" },
        { "mandarin": "射神车", "translate_to": "Kereta Penembak Dewa", "detail": "istilah" },
        { "mandarin": "十崩拳意", "translate_to": "Konsepsi Sepuluh Pukulan Penghancur", "detail": "nama konsepsi" },
        { "mandarin": "第六崩 止轮", "translate_to": "Kehancuran Keenam, Roda Pengikat", "detail": "istilah teknik konsepsi" },
        { "mandarin": "摧岳", "translate_to": "Pemusnah Gunung", "detail": "istilah teknik konsepsi" },
        { "mandarin": "裂云", "translate_to": "Pembelah Awan", "detail": "istilah teknik konsepsi" },
        { "mandarin": "断潮", "translate_to": "Pemutus Gelombang", "detail": "istilah teknik konsepsi" },
        { "mandarin": "碎星", "translate_to": "Pemusnah Bintang", "detail": "istilah teknik konsepsi" },
        { "mandarin": "转魄", "translate_to": "Pusaran Jiwa", "detail": "istilah teknik konsepsi" },
        { "mandarin": "灭劫", "translate_to": "Pemusnah Tribulasi", "detail": "istilah teknik konsepsi" },
        { "mandarin": "妖海百浪", "translate_to": "Seratus Ombak Laut Siluman", "detail": "istilah teknik" },
        { "mandarin": "十万甲妖力", "translate_to": "Seratus Ribu Tingkat Kekuatan Siluman", "detail": "istilah" },
        { "mandarin": "天 地 玄 黄", "translate_to": "Langit, Bumi, Hitam, Kuning", "detail": "wilayah bagian dalam Kota Siluman Langit" },
        { "mandarin": "宇 宙 洪 荒", "translate_to": "Semesta, Kosmik, Agung, Purba", "detail": "wilayah bagian luar Kota Siluman Langit" }
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

  // 3. Buat atau cek Glossary "Renegade Immortal"
  let glossary = await prisma.glossary.findFirst({
    where: { name: 'Renegade Immortal' },
  });

  if (!glossary) {
    glossary = await prisma.glossary.create({
      data: {
        name: 'Renegade Immortal',
        sourceLanguage: 'zh',
        targetLanguage: 'id',
        userId: adminUser.id,
      },
    });
    console.log('Glossary "Renegade Immortal" dibuat.');
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

  console.log(`Berhasil menyisipkan ${entriesToInsert.length} istilah ke dalam glossary "Renegade Immortal".`);
  console.log('Seeder selesai');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });