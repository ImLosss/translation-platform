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
    { "mandarin": "斗之气", "replace": "Dou Zhi Qi" },
    { "mandarin": "斗者", "replace": "Dou Zhe" },
    { "mandarin": "斗师", "replace": "Dou Shi" },
    { "mandarin": "大斗师", "replace": "Da Dou Shi" },
    { "mandarin": "斗灵", "replace": "Dou Ling" },
    { "mandarin": "斗王", "replace": "Dou Wang" },
    { "mandarin": "斗皇", "replace": "Dou Huang" },
    { "mandarin": "斗宗", "replace": "Dou Zong" },
    { "mandarin": "斗尊", "replace": "Dou Zun" },
    { "mandarin": "半圣", "replace": "Ban Sheng" },
    { "mandarin": "斗圣", "replace": "Dou Sheng" },
    { "mandarin": "斗帝", "replace": "Dou Di" }
  ],
  "REPLACE_AND_LEARN": [
    { "mandarin": "陀舍古帝", "translate_to": "Api Kaisar Kuno", "detail": "Api Surgawi" },
    { "mandarin": "虚无吞炎", "translate_to": "Api Pelahap Kehampaan", "detail": "Api Surgawi" },
    { "mandarin": "净莲妖火", "translate_to": "Api Iblis Teratai Murni", "detail": "Api Surgawi" },
    { "mandarin": "金帝焚天炎", "translate_to": "Api Kaisar Emas Pembakar Langit", "detail": "Api Surgawi" },
    { "mandarin": "生灵之焱", "translate_to": "Api Roh Hidup", "detail": "Api Surgawi" },
    { "mandarin": "八荒破灭焱", "translate_to": "Api Penghancur Delapan Tanah", "detail": "Api Surgawi" },
    { "mandarin": "九幽金祖火", "translate_to": "Api Naga Emas Kuno", "detail": "Api Surgawi" },
    { "mandarin": "红莲业火", "translate_to": "Api Karma Teratai Merah", "detail": "Api Surgawi" },
    { "mandarin": "三千焱炎火", "translate_to": "Api Tiga Ribu", "detail": "Api Surgawi" },
    { "mandarin": "九幽风炎", "translate_to": "Api Angin Sembilan Kegelapan", "detail": "Api Surgawi" },
    { "mandarin": "骨灵冷火", "translate_to": "Api Tulang Dingin", "detail": "Api Surgawi" },
    { "mandarin": "九龙雷罡火", "translate_to": "Api Petir Sembilan Naga", "detail": "Api Surgawi" },
    { "mandarin": "龟灵地火", "translate_to": "Api Bumi Kura-Kura", "detail": "Api Surgawi" },
    { "mandarin": "陨落心炎", "translate_to": "Api Hati Jatuh", "detail": "Api Surgawi" },
    { "mandarin": "海心焰", "translate_to": "Api Hati Laut", "detail": "Api Surgawi" },
    { "mandarin": "火云水焱", "translate_to": "Api Awan Air", "detail": "Api Surgawi" },
    { "mandarin": "火山石焰", "translate_to": "Api Batu Gunung Vulkanik", "detail": "Api Surgawi" },
    { "mandarin": "风雷怒焱", "translate_to": "Api Naga Amarah Angin", "detail": "Api Surgawi" },
    { "mandarin": "青莲地心火", "translate_to": "Api Inti Teratai Hijau", "detail": "Api Surgawi" },
    { "mandarin": "龙凤焱", "translate_to": "Api Naga Phoenix", "detail": "Api Surgawi" },
    { "mandarin": "六道轮回炎", "translate_to": "Api Enam Sisi Reinkarnasi", "detail": "Api Surgawi" },
    { "mandarin": "万兽灵火", "translate_to": "Api Sepuluh Ribu Makhluk", "detail": "Api Surgawi" },
    { "mandarin": "玄黄炎", "translate_to": "Api Kuning Xuan", "detail": "Api Surgawi" },
    { "mandarin": "叶家", "translate_to": "Keluarga Ye", "detail": "nama keluarga/klan" },
    { "mandarin": "考核", "translate_to": "Ujian", "detail": "istilah" },
    { "mandarin": "五大家族", "translate_to": "lima keluarga besar", "detail": "istilah/nama kelompok" },
    { "mandarin": "丹域", "translate_to": "Wilayah Pil", "detail": "nama tempat" },
    { "mandarin": "叶长老", "translate_to": "Tetua Ye", "detail": "nama karakter/jabatan" },
    { "mandarin": "太上长老凤凰", "translate_to": "Tetua Tertinggi Fenghuang", "detail": "nama karakter/jabatan" },
    { "mandarin": "萧萧", "translate_to": "Xiao Xiao", "detail": "nama karakter" },
    { "mandarin": "妖啸天", "translate_to": "Yao Xiaotian", "detail": "nama karakter" },
    { "mandarin": "火云老祖", "translate_to": "Leluhur Huoyun", "detail": "nama karakter" },
    { "mandarin": "青仙子", "translate_to": "Peri Qing", "detail": "nama karakter" },
    { "mandarin": "萧炎", "translate_to": "Xiao Yan", "detail": "nama karakter utama" },
    { "mandarin": "丹家", "translate_to": "Keluarga Dan", "detail": "nama keluarga/klan" },
    { "mandarin": "白家", "translate_to": "Keluarga Bai", "detail": "nama keluarga/klan" },
    { "mandarin": "邱家", "translate_to": "Keluarga Qiu", "detail": "nama keluarga/klan" },
    { "mandarin": "曹家", "translate_to": "Keluarga Cao", "detail": "nama keluarga/klan" },
    { "mandarin": "曹颖", "translate_to": "Cao Ying", "detail": "nama karakter" },
    { "mandarin": "丹轩", "translate_to": "Dan Xuan", "detail": "nama karakter" },
    { "mandarin": "白鹰", "translate_to": "Bai Ying", "detail": "nama karakter" },
    { "mandarin": "林大长老", "translate_to": "Tetua Agung Lin", "detail": "nama karakter" },
    { "mandarin": "邱机", "translate_to": "Qiu Ji", "detail": "nama karakter" },
    { "mandarin": "曹休", "translate_to": "Cao Xiu", "detail": "nama karakter" },
    { "mandarin": "盛长老", "translate_to": "Tetua Sheng", "detail": "nama karakter/jabatan" },
    { "mandarin": "妖暝族长", "translate_to": "Ketua Yao Ming", "detail": "nama karakter/jabatan" },
    { "mandarin": "魂技", "translate_to": "keterampilan jiwa", "detail": "istilah/teknik" },
    { "mandarin": "炼药师", "translate_to": "Alkemis", "detail": "profesi" },
    { "mandarin": "灵魂", "translate_to": "jiwa", "detail": "istilah" },
    { "mandarin": "魂手印", "translate_to": "Segel Tapak Jiwa", "detail": "nama teknik" },
    { "mandarin": "丹塔", "translate_to": "Pagoda Pil", "detail": "nama tempat" },
    { "mandarin": "小丹塔", "translate_to": "Pagoda Pil Kecil", "detail": "nama tempat" },
    { "mandarin": "魂钢", "translate_to": "baja jiwa", "detail": "istilah/bahan" },
    { "mandarin": "测魂石", "translate_to": "Batu Penguji Jiwa", "detail": "nama benda/alat" },
    { "mandarin": "测魂珠", "translate_to": "manik penguji jiwa", "detail": "nama benda/alat" },
    { "mandarin": "魂障壁", "translate_to": "penghalang Jiwa", "detail": "istilah/teknik" },
    { "mandarin": "天才", "translate_to": "Jenius", "detail": "istilah" },
    { "mandarin": "掌舵人", "translate_to": "Pemimpin", "detail": "jabatan" },
    { "mandarin": "传承", "translate_to": "warisan", "detail": "istilah" },
    { "mandarin": "攻击性", "translate_to": "serangan", "detail": "istilah" },
    { "mandarin": "修炼", "translate_to": "pelatihan", "detail": "istilah" },
    { "mandarin": "丹会", "translate_to": "Konferensi Pil", "detail": "nama acara/kompetisi" },
    { "mandarin": "灵魂幻境", "translate_to": "Dunia Ilusi Jiwa", "detail": "nama tempat/ujian" },
    { "mandarin": "心魔", "translate_to": "iblis batin", "detail": "istilah" },
    { "mandarin": "丹界", "translate_to": "Dunia Pil", "detail": "nama tempat/ujian" },
    { "mandarin": "天才地宝", "translate_to": "harta dan bahan langka", "detail": "istilah" },
    { "mandarin": "药材", "translate_to": "bahan obat", "detail": "istilah/bahan" },
    { "mandarin": "辰闲", "translate_to": "Chen Xian", "detail": "nama karakter" },
    { "mandarin": "凶兽", "translate_to": "monster", "detail": "istilah/makhluk" },
    { "mandarin": "少宗主", "translate_to": "Tuan Muda", "detail": "jabatan" },
    { "mandarin": "八极崩", "translate_to": "Octane Blast", "detail": "nama teknik" },
    { "mandarin": "天火三玄变", "translate_to": "Skyfire Three Mysterious Change", "detail": "nama teknik" },
    { "mandarin": "青莲变", "translate_to": "Green Lotus Change", "detail": "nama teknik" },
    { "mandarin": "玄火刀", "translate_to": "Pedang Api Xuan", "detail": "nama teknik/senjata" },
    { "mandarin": "万药山脉", "translate_to": "Pegunungan Wanyao", "detail": "nama tempat" },
    { "mandarin": "经脉", "translate_to": "meridian", "detail": "istilah anatomi/energi" },
    { "mandarin": "丹灵浆", "translate_to": "Cairan Spiritual Pil", "detail": "nama benda/obat" },
    { "mandarin": "地心魂髓", "translate_to": "Esensi Jiwa Hati Bumi", "detail": "nama benda/obat" },
    { "mandarin": "魔兽", "translate_to": "monster", "detail": "istilah/makhluk" },
    { "mandarin": "玄水虎蛟", "translate_to": "Naga Harimau Air", "detail": "nama monster" },
    { "mandarin": "水云果", "translate_to": "Buah Awan Air", "detail": "nama benda/buah" },
    { "mandarin": "醉浆", "translate_to": "cairan pemabuk", "detail": "istilah/bahan" },
    { "mandarin": "魂殿", "translate_to": "Aula Jiwa", "detail": "nama organisasi" },
    { "mandarin": "天罡殿", "translate_to": "Aula Langit", "detail": "istilah" },
    { "mandarin": "地煞殿", "translate_to": "Aula Bumi", "detail": "istilah" },
    { "mandarin": "人殿", "translate_to": "Aula Manusia", "detail": "istilah" },
    { "mandarin": "药典", "translate_to": "Upacara Yao", "detail": "istilah" },
    { "mandarin": "灵魂屏障", "translate_to": "Penghalang Jiwa", "detail": "istilah/teknik" },
    { "mandarin": "琉璃变", "translate_to": "Glazed Change", "detail": "nama teknik" },
    { "mandarin": "焚炎谷", "translate_to": "Burning Flame Valley", "detail": "nama tempat" },
    { "mandarin": "焰分噬浪尺", "translate_to": "Flame Splitting Tsunami", "detail": "nama teknik" },
    { "mandarin": "开山印", "translate_to": "Open Mountain Seal", "detail": "nama teknik" },
    { "mandarin": "翻海印", "translate_to": "Sea Flipping Seal", "detail": "nama teknik" },
    { "mandarin": "地妖傀", "translate_to": "Boneka Siluman Bumi", "detail": "istilah/nama benda" },
    { "mandarin": "慕骨", "translate_to": "Mu Gu", "detail": "nama karakter" },
    { "mandarin": "熊战", "translate_to": "Xiong Zhan", "detail": "nama karakter" },
    { "mandarin": "紫研", "translate_to": "Zi Yan", "detail": "nama karakter" },
    { "mandarin": "远古龙熊", "translate_to": "Beruang Naga Kuno", "detail": "istilah/makhluk" },
    { "mandarin": "天妖凰族", "translate_to": "Klan Phoenix Surgawi", "detail": "nama klan/suku" },
    { "mandarin": "地冥蟒族", "translate_to": "Klan Piton Sembilan Neraka", "detail": "nama klan/suku" },
    { "mandarin": "天妖凰", "translate_to": "Phoenix Surgawi", "detail": "nama klan/suku" },
    { "mandarin": "腾龙花心", "translate_to": "Heart of Dragon Vine Blossom", "detail": "nama benda/bahan obat" },
    { "mandarin": "黄泉血晶", "translate_to": "Kristal Darah Mata Air Neraka", "detail": "nama benda/bahan obat" },
    { "mandarin": "赤炎果", "translate_to": "Crimson Flame Fruit", "detail": "nama benda/bahan obat" },
    { "mandarin": "硫焱灵涎", "translate_to": "Sulfur Flame Spiritual Nectar", "detail": "nama benda/bahan obat" },
    { "mandarin": "天麻翡石精", "translate_to": "Esensi Giok Ginseng Langit", "detail": "nama benda/bahan obat" },
    { "mandarin": "屠龙剑", "translate_to": "Pedang Pembantai Naga", "detail": "nama benda" },
    { "mandarin": "魂之极", "translate_to": "Jiwa Tertinggi", "detail": "istilah/teknik" },
    { "mandarin": "闭守天灵", "translate_to": "Penutupan Spiritual Langit", "detail": "istilah/teknik" },
    { "mandarin": "纳灵锻魂", "translate_to": "Penempaan Jiwa", "detail": "istilah/teknik" },
    { "mandarin": "师叔", "translate_to": "paman seperguruan", "detail": "istilah/hubungan" },
    { "mandarin": "药尘", "translate_to": "Yao Chen", "detail": "nama karakter" },
    { "mandarin": "独门功法", "translate_to": "teknik rahasia", "detail": "istilah/teknik" },
    { "mandarin": "升灵", "translate_to": "meningkatkan jiwa", "detail": "istilah/aksi" },
    { "mandarin": "三色丹雷", "translate_to": "Petir Pil Tiga Warna", "detail": "istilah" },
    { "mandarin": "五色丹雷", "translate_to": "Petir Pil Lima Warna", "detail": "istilah" },
    { "mandarin": "黑魔雷", "translate_to": "Petir Hitam Iblis", "detail": "istilah" },
    { "mandarin": "远古种族", "translate_to": "Klan Kuno", "detail": "istilah" },
    { "mandarin": "八品丹药", "translate_to": "Pil Kelas 8", "detail": "nama benda/obat" },
    { "mandarin": "九阴黄泉丹", "translate_to": "Pil Sembilan Yin Mata Air Neraka", "detail": "nama benda/obat" },
    { "mandarin": "三千焱炎火", "translate_to": "Three Thousand Burning Flame", "detail": "Api Surgawi" },
    { "mandarin": "丘陵", "translate_to": "Qiu Ling", "detail": "nama karakter" },
    { "mandarin": "星域", "translate_to": "Wilayah Bintang", "detail": "nama tempat" },
    { "mandarin": "圣丹城", "translate_to": "Kota Suci Pil", "detail": "nama tempat" },
    { "mandarin": "异火", "translate_to": "Api Surgawi", "detail": "istilah" },
    { "mandarin": "封印", "translate_to": "segel", "detail": "istilah/aksi" },
    { "mandarin": "太虚古龙族", "translate_to": "Klan Naga Kuno", "detail": "nama klan/ras" },
    { "mandarin": "东龙岛", "translate_to": "Pulau Naga Timur", "detail": "nama tempat" },
    { "mandarin": "西龙岛", "translate_to": "Pulau Naga Barat", "detail": "nama tempat" },
    { "mandarin": "南龙岛", "translate_to": "Pulau Naga Selatan", "detail": "nama tempat" },
    { "mandarin": "北龙岛", "translate_to": "Pulau Naga Utara", "detail": "nama tempat" },
    { "mandarin": "加玛帝国", "translate_to": "Kerajaan Jiama", "detail": "nama tempat" },
    { "mandarin": "萧鼎", "translate_to": "Xiao Ding", "detail": "nama karakter" },
    { "mandarin": "亡魂山脉", "translate_to": "Pegunungan Arwah", "detail": "nama tempat" },
    { "mandarin": "中州", "translate_to": "Dataran Tengah", "detail": "nama tempat" },
    { "mandarin": "风", "translate_to": "Feng", "detail": "nama karakter" },
    { "mandarin": "铁剑", "translate_to": "Tie Jian", "detail": "nama karakter" },
    { "mandarin": "天火", "translate_to": "Tianhuo", "detail": "nama karakter" },
    { "mandarin": "黄泉妖圣", "translate_to": "Santo Huang Quan", "detail": "nama karakter" },
    { "mandarin": "小医仙", "translate_to": "Xiao Yixian", "detail": "nama karakter" },
    { "mandarin": "侯老怪", "translate_to": "Pak Tua Hou", "detail": "nama karakter" },
    { "mandarin": "湮天印", "translate_to": "Sky Burying Seal", "detail": "nama teknik" },
    { "mandarin": "愧仙", "translate_to": "Boneka Dou Zun", "detail": "istilah/nama benda" },
    { "mandarin": "噬石魔蚁", "translate_to": "Semut Pemakan Batu", "detail": "nama monster" },
    { "mandarin": "噬石蚁后", "translate_to": "Ratu Semut Pemakan Batu", "detail": "nama monster" },
    { "mandarin": "阵法", "translate_to": "Formasi...", "detail": "istilah/teknik" },
    { "mandarin": "毁灭火体", "translate_to": "Tubuh Api Pemusnah", "detail": "istilah/teknik" },
    { "mandarin": "宗", "translate_to": "Sekte", "detail": "istilah" },
    { "mandarin": "花宗", "translate_to": "Sekte Bunga", "detail": "nama sekte/kelompok" },
    { "mandarin": "玄冥宗", "translate_to": "Sekte Xuanming", "detail": "nama sekte/kelompok" },
    { "mandarin": "族", "translate_to": "Klan", "detail": "istilah" },
    { "mandarin": "魂族", "translate_to": "Klan Hun", "detail": "nama klan" },
    { "mandarin": "古族", "translate_to": "Klan Gu", "detail": "nama klan" },
    { "mandarin": "药族", "translate_to": "Klan Yao", "detail": "nama klan" },
    { "mandarin": "炎族", "translate_to": "Klan Yan", "detail": "nama klan" },
    { "mandarin": "石族", "translate_to": "Klan Shi", "detail": "nama klan" },
    { "mandarin": "灵族", "translate_to": "Klan Ling", "detail": "nama klan" },
    { "mandarin": "雷族", "translate_to": "Klan Lei", "detail": "nama klan" },
    { "mandarin": "萧族", "translate_to": "Klan Xiao", "detail": "nama klan" },
    { "mandarin": "大长老", "translate_to": "Tetua Agung", "detail": "jabatan" },
    { "mandarin": "妖花邪君", "translate_to": "Yaohua Liangjun", "detail": "nama karakter" },
    { "mandarin": "魂灭生", "translate_to": "Hun Miesheng", "detail": "nama karakter" },
    { "mandarin": "天墓", "translate_to": "Makam Langit", "detail": "nama tempat" },
    { "mandarin": "毁灭火莲", "translate_to": "Api Teratai Pemusnah", "detail": "nama teknik" },
    { "mandarin": "天阶功法", "translate_to": "Teknik Tingkat Langit", "detail": "istilah/tingkatan" },
    { "mandarin": "焚诀", "translate_to": "Teknik Pembakaran", "detail": "nama teknik" },
    { "mandarin": "三长老", "translate_to": "Tetua Ketiga", "detail": "jabatan" },
    { "mandarin": "院长", "translate_to": "Kepsek", "detail": "jabatan" },
    { "mandarin": "血脉", "translate_to": "Garis Darah", "detail": "istilah" },
    { "mandarin": "灵魂分身", "translate_to": "Avatar Jiwa", "detail": "istilah" },
    { "mandarin": "宝丹", "translate_to": "Pil Harta", "detail": "tingkatan alkemis" },
    { "mandarin": "玄丹", "translate_to": "Pil Misteri", "detail": "tingkatan alkemis" },
    { "mandarin": "金丹", "translate_to": "Pil Emas", "detail": "tingkatan alkemis" },
    { "mandarin": "银", "translate_to": "Perak", "detail": "tingkatan" },
    { "mandarin": "金", "translate_to": "Emas", "detail": "tingkatan" },
    { "mandarin": "紫金", "translate_to": "Ungu-emas", "detail": "tingkatan" },
    { "mandarin": "彩金", "translate_to": "Emas-pelangi", "detail": "istilah" },
    { "mandarin": "古帝玉托瑟", "translate_to": "Giok Kaisar Kuno Tuose", "detail": "nama benda" },
    { "mandarin": "邙天尺", "translate_to": "Mang Tian Chi", "detail": "nama karakter" },
    { "mandarin": "能量体", "translate_to": "tubuh energi", "detail": "istilah" },
    { "mandarin": "能量核", "translate_to": "inti energi", "detail": "istilah" },
    { "mandarin": "覆地印", "translate_to": "Overturning Land Seal", "detail": "nama teknik" },
    { "mandarin": "佛怒轮回", "translate_to": "Samsara Amarah Buddha", "detail": "nama teknik" },
    { "mandarin": "远古噬虫", "translate_to": "Serangga Penelan Kuno", "detail": "nama monster" },
    { "mandarin": "青阳都统", "translate_to": "Panglima Qingyang", "detail": "nama monster" },
    { "mandarin": "炎盟", "translate_to": "Aliansi Yan", "detail": "nama aliansi" },
    { "mandarin": "天府联盟", "translate_to": "Aliansi Istana Langit", "detail": "nama aliansi" },
    { "mandarin": "狮冥宗", "translate_to": "Sekte Shiming", "detail": "nama sekte" },
    { "mandarin": "玄黄天涧", "translate_to": "Lembah Xuanhuang", "detail": "nama tempat" },
    { "mandarin": "玄黄要塞", "translate_to": "Benteng Xuanhuang", "detail": "nama tempat" },
    { "mandarin": "九幽黄泉", "translate_to": "Mata Air Sembilan Neraka", "detail": "nama tempat" },
    { "mandarin": "九幽冥杖", "translate_to": "Tongkat Sembilan Neraka", "detail": "nama benda" },
    { "mandarin": "冰河谷", "translate_to": "Lembah Es", "detail": "nama tempat/kelompok" },
    { "mandarin": "风雷阁", "translate_to": "Paviliun Angin Petir", "detail": "nama tempat/kelompok" },
    { "mandarin": "防御大阵", "translate_to": "Formasi Pertahanan", "detail": "istilah" },
    { "mandarin": "蚍蜉撼树", "translate_to": "Usaha sia-sia", "detail": "idiom" },
    { "mandarin": "海波东", "translate_to": "Hai Bo Dong", "detail": "nama karakter" },
    { "mandarin": "尊者", "translate_to": "Zunzhe", "detail": "gelar" },
    { "mandarin": "九天尊", "translate_to": "Tianzun Ke-sembilan", "detail": "istilah/gelar" },
    { "mandarin": "天尊", "translate_to": "Tianzun", "detail": "jabatan" },
    { "mandarin": "盟主", "translate_to": "Ketua Aliansi", "detail": "jabatan" },
    { "mandarin": "丹堂", "translate_to": "Aula Pill", "detail": "istilah" },
    { "mandarin": "大师", "translate_to": "Master", "detail": "gelar untuk master alkemis" },
    { "mandarin": "宗师", "translate_to": "Grandmaster", "detail": "gelar untuk alkemis tingkat tinggi" },
    { "mandarin": "八品宗师境界", "translate_to": "Tingkat Grandmaster Kelas 8", "detail": "tingkatan kelas alkemis" },
    { "mandarin": "空间虫洞", "translate_to": "Terowongan Ruang", "detail": "istilah" },
    { "mandarin": "半只脚踏入斗帝级别", "translate_to": "Setengah Langkah Tingkat Dou Di", "detail": "istilah kultivasi" },
    { "mandarin": "天境大圆满", "translate_to": "Tingkat Langit Puncak", "detail": "istilah kultivasi jiwa" },
    { "mandarin": "少阁主", "translate_to": "Tuan Muda Paviliun", "detail": "jabatan" },
    { "mandarin": "交易会", "translate_to": "Ajang Dagang", "detail": "istilah" },
    { "mandarin": "空间交易会", "translate_to": "Pohon Bodhi Kuno", "detail": "istilah" },
    { "mandarin": "净莲妖圣", "translate_to": "Saint Iblis Teratai Murni", "detail": "julukan" },
    { "mandarin": "菩提子", "translate_to": "Biji Bodhi", "detail": "istilah" },
    { "mandarin": "三转斗尊巅峰", "translate_to": "Puncak Dou Zun Tiga Putaran", "detail": "istilah kultivasi" },
    { "mandarin": "金刚琉璃体", "translate_to": "Tubuh Vajra Giok", "detail": "nama teknik" },
    { "mandarin": "黄泉指", "translate_to": "Jari Huang Quan", "detail": "nama teknik" },
    { "mandarin": "黄泉掌", "translate_to": "Telapak Huang Quan", "detail": "nama teknik" },
    { "mandarin": "黄泉天怒", "translate_to": "Amarah Langit Huang Quan", "detail": "nama teknik" },
    { "mandarin": "九丈九尺", "translate_to": "33 meter", "detail": "ukuran panjang dalam meter" },
    { "mandarin": "莽荒古域", "translate_to": "Wilayah Kuno Manghuang", "detail": "nama tempat" },
    { "mandarin": "斗气大陆", "translate_to": "Benua Douqi", "detail": "nama tempat" },
    { "mandarin": "空间玉简", "translate_to": "Giok Pesan Ruang", "detail": "nama benda/alat" },
    { "mandarin": "厄难毒体", "translate_to": "Tubuh Racun", "detail": "istilah" },
    { "mandarin": "菩提心", "translate_to": "Hati Bodhi", "detail": "istilah" },
    { "mandarin": "天冥宗", "translate_to": "Sekte Tianming", "detail": "nama sekte" },
    { "mandarin": "碧蛇三花瞳", "translate_to": "Pupil Tiga Bunga Ular Hijau", "detail": "istilah" },
    { "mandarin": "古域台", "translate_to": "Altar Wilayah Kuno", "detail": "istilah" },
    { "mandarin": "远古天魔蟒", "translate_to": "Ular Iblis Langit Kuno", "detail": "istilah" },
    { "mandarin": "血池", "translate_to": "Kolam Darah", "detail": "istilah" },
    { "mandarin": "兽潮", "translate_to": "Gelombang Monster", "detail": "istilah" },
    { "mandarin": "梦魇天雾", "translate_to": "Kabut Mimpi", "detail": "istilah" },
    { "mandarin": "族纹", "translate_to": "Tanda Klan", "detail": "istilah" },
    { "mandarin": "灭魂掌", "translate_to": "Telapak Pemusnah Jiwa", "detail": "nama teknik" },
    { "mandarin": "风之极 陨杀", "translate_to": "Angin Ekstrem, Serangan Pemusnah", "detail": "nama teknik" },
    { "mandarin": "佛怒火莲", "translate_to": "Teratai Api Amarah Buddha", "detail": "nama teknik" },
    { "mandarin": "大天造化掌", "translate_to": "Telapak Penciptaan Langit Agung", "detail": "nama teknik" },
    { "mandarin": "六合游身尺", "translate_to": "Roda Enam Arah", "detail": "nama teknik" },
    { "mandarin": "星陨阁", "translate_to": "Paviliun Bintang Jatuh", "detail": "istilah" },
    { "mandarin": "灵魂空间", "translate_to": "Ruang Jiwa", "detail": "istilah" },
    { "mandarin": "长老院", "translate_to": "Dewan Tetua", "detail": "istilah" },
    { "mandarin": "不好", "translate_to": "Gawat", "detail": "istilah" },
    { "mandarin": "本源", "translate_to": "Esensi", "detail": "istilah" },
    { "mandarin": "七彩吞天蟒", "translate_to": "Python Penelan Langit 7 Warna", "detail": "nama makhluk" },
    { "mandarin": "远古天蛇", "translate_to": "Ular Langit Kuno", "detail": "nama makhluk" },
    { "mandarin": "炎魔清玄丹", "translate_to": "Pil Pemurni Iblis Api", "detail": "nama pil" },
    { "mandarin": "菩提大还丹", "translate_to": "Pil Agung Bodhi", "detail": "nama pil" },
    { "mandarin": "凝物蕴丹", "translate_to": "Pembentukan Inti Pil saat Pemadatan", "detail": "istilah" },
    { "mandarin": "冥河盟", "translate_to": "Aliansi Sungai Kegelapan", "detail": "nama aliansi" }
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

  // 3. Buat atau cek Glossary "ARMJI"
  let glossary = await prisma.glossary.findFirst({
    where: { name: 'ARMJI' },
  });

  if (!glossary) {
    glossary = await prisma.glossary.create({
      data: {
        name: 'ARMJI',
        sourceLanguage: 'zh',
        targetLanguage: 'id',
        userId: adminUser.id,
      },
    });
    console.log('Glossary "ARMJI" dibuat.');
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

  console.log(`Berhasil menyisipkan ${entriesToInsert.length} istilah ke dalam glossary "ARMJI".`);
  console.log('Seeder selesai');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });