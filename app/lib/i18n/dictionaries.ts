import type { Locale } from './locales';

/**
 * Kamus terjemahan statis (bukan terjemahan otomatis).
 * Semua teks ditulis manual agar tidak membebani sistem (tanpa API call).
 *
 * Cara menambah halaman baru:
 * 1. Tambahkan namespace baru (mis. `topup`) di kedua objek di bawah.
 * 2. Gunakan `useTranslation()` lalu `t.billing.title` di komponen.
 */
export interface Dictionary {
  common: {
    loading: string;
    save: string;
    cancel: string;
    close: string;
    language: string;
  };
  billing: {
    title: string;
    subtitle: string;
    topUpBalance: string;
    transactionHistory: string;
    table: {
      transactionId: string;
      date: string;
      amount: string;
      status: string;
    };
    status: {
      success: string;
      pending: string;
      failed: string;
    };
    empty: string;
  };
  topup: {
    title: string;
    amountLabel: string;
    customAmountPlaceholder: string;
    methodLabel: string;
    qrisDesc: string;
    creditCardDesc: string;
    notesTitle: string;
    note1: string;
    note2: string;
    note3: string;
    contactTitle: string;
    topupAmount: string;
    feeNotIncluded: string;
    payNow: string;
    processing: string;
    scanTitle: string;
    orderId: string;
    expiresIn: string;
    totalPayment: string;
    scanInstruction: string;
    waitingPayment: string;
    cancel: string;
    goToHistory: string;
    alertMinAmount: string;
    alertPaymentSuccess: string;
    alertTransactionCancelled: string;
    alertQrisExpired: string;
    alertSnapNotReady: string;
    alertCcSuccess: string;
    alertCcPending: string;
    alertCcError: string;
    alertCcClosed: string;
    alertQrisCreated: string;
    alertPaymentError: string;
  };
  translate: {
    list: {
      tipTitle: string;
      tipBody1: string;
      tipBodyCompleted: string;
      tipBody2: string;
      tipBody3: string;
      tipBodyGenerate: string;
      tipBody4: string;
      recentJobs: string;
      newTranslate: string;
      jobName: string;
      source: string;
      target: string;
      glossary: string;
      model: string;
      totalTokens: string;
      totalCost: string;
        
      status: string;
      date: string;
      actions: string;
      loading: string;
      empty: string;
      no: string;
      page: string;
      from: string;
      total: string;
      prev: string;
      next: string;
      view: string;
      downloadSource: string;
    };
    create: {
      title: string;
      reset: string;
      jobName: string;
      jobNamePlaceholder: string;
      sourceLanguage: string;
      targetLanguage: string;
      selectSource: string;
      selectTarget: string;
      llmModel: string;
      selectModel: string;
      batchSize: string;
      glossaryOptional: string;
      selectGlossary: string;
      noGlossaryAvailable: string;
      noMatchingGlossary: string;
      glossaryUnavailable: string;
      subtitleSourceMethod: string;
      uploadPasteSrt: string;
      extractFromVideo: string;
      driveUrl: string;
      optional: string;
      driveUrlHint: string;
      driveUrlHintPublic: string;
      subtitleContent: string;
      dropzoneText: string;
      pasteSrtPlaceholder: string;
      submitJob: string;
      alertUnsupportedFormat: string;
      alertFileTooLarge: string;
      alertFileUploaded: string;
      alertValidation: string;
      alertCreateFailed: string;
      alertCreateSuccess: string;
    };
    editor: {
      title: string;
      reset: string;
      saveExport: string;
      driveUrlPublic: string;
      driveUrlPlaceholder: string;
      hidePreview: string;
      showPreview: string;
      source: string;
      translation: string;
      startTime: string;
      endTime: string;
      seekVideo: string;
      openPreviewFirst: string;
      addLine: string;
      deleteLine: string;
      saveChanges: string;
      saving: string;
      previewDragMe: string;
      translated: string;
      alertReset: string;
      alertNewLine: string;
      alertAtLeastOne: string;
      alertDeleted: string;
      alertNoChanges: string;
      alertSaved: string;
      alertVideoFailed: string;
    };
    glossary: {
      loadingData: string;
      back: string;
      confirmBack: string;
      editorTitle: string;
      reset: string;
      createNew: string;
      glossaryName: string;
      glossaryNamePlaceholder: string;
      sourceLanguage: string;
      targetLanguage: string;
      appendingTo: string;
      entries: string;
      sourceTerm: string;
      targetTranslation: string;
      detailContext: string;
      optional: string;
      aiSuggested: string;
      duplicate: string;
      sourcePlaceholder: string;
      targetPlaceholder: string;
      detailPlaceholder: string;
      addEntry: string;
      deleteEntry: string;
      confirmSave: string;
      savingGlossary: string;
      confirmSaveShort: string;
      alertNoRecommendation: string;
      alertInvalidFormat: string;
      alertDuplicate: string;
      alertNoChanges: string;
      alertSaveFailed: string;
      alertSaveError: string;
      alertReverted: string;
    };
    generate: {
      button: string;
      loadingGenerating: string;
      loadingAnalyzing: string;
      loadingAlmost: string;
      loadingRequest: string;
      loadingChecking: string;
      successGenerated: string;
      failedPrefix: string;
      timeout: string;
      failedStart: string;
      errorPrefix: string;
      failedCheck: string;
      modalFoundTitle: string;
      modalFoundMessage: string;
      modalSubmittedMessage: string;
      modalGenerateTitle: string;
      modalGenerateMessage: string;
      regenerate: string;
      viewExisting: string;
      generate: string;
    };
    dropzone: {
      title: string;
      dragDrop: string;
      browseFiles: string;
      supported: string;
      lastUploaded: string;
      alertUnsupported: string;
      alertTooLarge: string;
      alertUploaded: string;
    };
  };
  glossary: {
    tipTitle: string;
    tipBody: string;
    listTitle: string;
    newGlossary: string;
    table: {
      name: string;
      source: string;
      target: string;
      createdAt: string;
      actions: string;
    };
    loading: string;
    empty: string;
    failedLoad: string;
    view: string;
    edit: string;
    downloadCsv: string;
    createTitle: string;
    editTitle: string;
    reset: string;
    name: string;
    namePlaceholder: string;
    sourceLanguage: string;
    targetLanguage: string;
    selectSource: string;
    selectTarget: string;
    submit: string;
    saveChanges: string;
    alertRequired: string;
    alertCreateFailed: string;
    alertCreateSuccess: string;
    alertUpdateFailed: string;
    alertUpdateSuccess: string;
    editorTitle: string;
    resetToLastSave: string;
    sourceTerm: string;
    targetTranslation: string;
    detailContext: string;
    optional: string;
    sourcePlaceholder: string;
    targetPlaceholder: string;
    detailPlaceholder: string;
    addEntry: string;
    deleteEntry: string;
    duplicate: string;
    saving: string;
    alertConfirmReset: string;
    alertReverted: string;
    alertNewEntry: string;
    alertAtLeastOne: string;
    alertDeleted: string;
    alertEmptyRequired: string;
    alertDuplicate: string;
    alertNoChanges: string;
    alertSaved: string;
    alertSaveError: string;
    deleteButton: string;
    deleteTitle: string;
    deleteMessage: string;
    deleteConfirm: string;
    deleting: string;
    deleteSlow: string;
    alertDeleteFailed: string;
    duplicateButton: string;
    duplicateTitle: string;
    duplicateMessage: string;
    duplicateConfirm: string;
    duplicating: string;
    alertDuplicateFailed: string;
  };
}

const id: Dictionary = {
  common: {
    loading: 'Memuat...',
    save: 'Simpan',
    cancel: 'Batal',
    close: 'Tutup',
    language: 'Bahasa',
  },
  billing: {
    title: 'Tagihan & Riwayat',
    subtitle: 'Kelola invoice dan pantau transaksi terbaru Anda.',
    topUpBalance: 'Isi Saldo',
    transactionHistory: 'Riwayat Transaksi',
    table: {
      transactionId: 'ID Transaksi',
      date: 'Tanggal',
      amount: 'Jumlah',
      status: 'Status',
    },
    status: {
      success: 'Berhasil',
      pending: 'Menunggu',
      failed: 'Gagal',
    },
    empty: 'Belum ada transaksi.',
  },
  topup: {
    title: 'Isi Saldo',
    amountLabel: '1. Masukkan Jumlah (IDR)',
    customAmountPlaceholder: 'Jumlah kustom (Min. 10.000)',
    methodLabel: '2. Pilih Metode Pembayaran',
    qrisDesc: 'Gopay, OVO, Dana, ShopeePay',
    creditCardDesc: 'Visa, Mastercard, JCB',
    notesTitle: 'Catatan Pembayaran',
    note1: 'Total pembayaran akhir akan mencakup <strong>Biaya Platform</strong> sesuai penyedia pembayaran yang Anda pilih.',
    note2: 'Pembayaran Kartu Kredit diamankan dengan 3D Secure (OTP).',
    note3: 'Setelah pembayaran berhasil, saldo tidak dapat dikembalikan.',
    contactTitle: 'Butuh bantuan? Hubungi kami:',
    topupAmount: 'Jumlah Isi Saldo',
    feeNotIncluded: '*belum termasuk biaya',
    payNow: 'Bayar Sekarang',
    processing: 'Memproses...',
    scanTitle: 'Scan QRIS untuk Membayar',
    orderId: 'Order ID',
    expiresIn: 'Kadaluarsa dalam:',
    totalPayment: 'Total Pembayaran',
    scanInstruction: 'Buka aplikasi <strong>Gopay, OVO, DANA, ShopeePay</strong>, atau m-Banking Anda,<br/> lalu scan kode QR di atas.',
    waitingPayment: 'Menunggu pembayaran Anda terkonfirmasi...',
    cancel: 'Batalkan',
    goToHistory: 'Ke Halaman Riwayat',
    alertMinAmount: 'Jumlah top-up minimum adalah IDR 10.000',
    alertPaymentSuccess: 'Pembayaran berhasil! Saldo telah ditambahkan.',
    alertTransactionCancelled: 'Transaksi dibatalkan atau kedaluwarsa.',
    alertQrisExpired: 'Waktu pembayaran QRIS telah habis.',
    alertSnapNotReady: 'Sistem pembayaran belum siap. Silakan muat ulang halaman.',
    alertCcSuccess: 'Pembayaran Kartu Kredit berhasil!',
    alertCcPending: 'Menunggu konfirmasi Bank. Saldo akan masuk setelah terverifikasi.',
    alertCcError: 'Pembayaran gagal diproses oleh Bank.',
    alertCcClosed: 'Anda menutup popup sebelum pembayaran selesai.',
    alertQrisCreated: 'QRIS berhasil dibuat! Silakan scan.',
    alertPaymentError: 'Terjadi kesalahan saat memproses pembayaran.',
  },
  translate: {
    list: {
      tipTitle: 'Pro Tip: Tingkatkan Terjemahan Berikutnya',
      tipBody1: 'Tingkatkan konsistensi terjemahan untuk proyek Anda berikutnya. Setelah status terjemahan ',
      tipBodyCompleted: 'SELESAI',
      tipBody2: ', buka menu aksi (',
      tipBody3: ') dan pilih ',
      tipBodyGenerate: 'Buat Glosarium',
      tipBody4: '. Ini akan menggunakan terjemahan terpilih sebagai referensi untuk membuat atau memperbarui glosarium Anda secara otomatis.',
      recentJobs: 'Job Terjemahan Terbaru',
      newTranslate: 'Terjemahan Baru',
      jobName: 'Nama Job',
      source: 'Sumber',
      target: 'Target',
      glossary: 'Glosarium',
      model: 'Model',
      totalTokens: 'Total Token',
      totalCost: 'Total Biaya',
      status: 'Status',
      date: 'Tanggal',
      actions: 'Aksi',
      loading: 'Memuat job terjemahan...',
      empty: 'Tidak ada job terjemahan.',
      no: 'Tidak',
      page: 'Halaman',
      from: 'dari',
      total: 'Total',
      prev: 'Sebelumnya',
      next: 'Berikutnya',
      view: 'Lihat',
      downloadSource: 'Unduh Sumber',
    },
    create: {
      title: 'Job Terjemahan Baru',
      reset: 'Reset',
      jobName: 'Nama Job',
      jobNamePlaceholder: 'mis. Episode 12 - Subtitle',
      sourceLanguage: 'Bahasa Sumber',
      targetLanguage: 'Bahasa Target',
      selectSource: 'Pilih bahasa sumber',
      selectTarget: 'Pilih bahasa target',
      llmModel: 'Model LLM',
      selectModel: 'Pilih Model LLM',
      batchSize: 'Ukuran Batch',
      glossaryOptional: 'Glosarium (Opsional)',
      selectGlossary: 'Pilih Glosarium...',
      noGlossaryAvailable: '-- Glosarium Tidak Tersedia --',
      noMatchingGlossary: '-- Tidak Ada Glosarium yang Cocok --',
      glossaryUnavailable: 'Glosarium tidak tersedia',
      subtitleSourceMethod: 'Metode Sumber Subtitle',
      uploadPasteSrt: 'Unggah / Tempel SRT',
      extractFromVideo: 'Ekstrak dari Video',
      driveUrl: 'URL Video Google Drive',
      optional: '(Opsional)',
      driveUrlHint: 'Pastikan akses tautan video Google Drive diatur ke ',
      driveUrlHintPublic: '"Siapa saja yang memiliki link" (Publik)',
      subtitleContent: 'Konten Subtitle (SRT)',
      dropzoneText: 'Tarik & lepas file .srt Anda di sini, atau klik untuk memilih',
      pasteSrtPlaceholder: 'Atau tempel konten SRT di sini...',
      submitJob: 'Kirim Job',
      alertUnsupportedFormat: 'Format file tidak didukung. Harap unggah file .srt.',
      alertFileTooLarge: 'Ukuran file terlalu besar. Maksimal 10MB.',
      alertFileUploaded: 'File "{name}" berhasil diunggah',
      alertValidation: 'Harap isi Nama Job, Source, dan Target Language',
      alertCreateFailed: 'Gagal membuat job.',
      alertCreateSuccess: 'Job terbuat sukses!',
    },
    editor: {
      title: 'Pratinjau Subtitle (SRT)',
      reset: 'Reset',
      saveExport: 'Simpan & Ekspor',
      driveUrlPublic: 'URL Video Google Drive (PUBLIK)',
      driveUrlPlaceholder: 'https://drive.google.com/file/d/ID_VIDEO/view',
      hidePreview: 'Sembunyikan Preview',
      showPreview: 'Tampilkan Preview',
      source: 'Sumber',
      translation: 'Terjemahan',
      startTime: 'Waktu Mulai',
      endTime: 'Waktu Selesai',
      seekVideo: 'Lompat video ke timestamp ini',
      openPreviewFirst: 'Buka Preview terlebih dahulu',
      addLine: 'Tambah Baris',
      deleteLine: 'Hapus Baris',
      saveChanges: 'Simpan Perubahan',
      saving: 'Menyimpan...',
      previewDragMe: '🎥 Preview (geser saya)',
      translated: 'Terjemahan',
      alertReset: 'Berhasil dikembalikan ke kondisi tersimpan terakhir.',
      alertNewLine: 'Baris subtitle baru ditambahkan.',
      alertAtLeastOne: 'Minimal satu baris subtitle diperlukan.',
      alertDeleted: 'Baris subtitle dihapus.',
      alertNoChanges: 'Tidak ada perubahan untuk disimpan.',
      alertSaved: 'Tersimpan.',
      alertVideoFailed: 'Gagal memuat pratinjau video. Periksa URL atau pengaturan berbagi Google Drive.',
    },
    glossary: {
      loadingData: 'Memuat data rekomendasi...',
      back: 'Kembali',
      confirmBack: 'Batal menyimpan glosarium dan kembali ke daftar?',
      editorTitle: 'Editor Glosarium (Job #{id})',
      reset: 'Reset',
      createNew: 'Buat Glosarium Baru',
      glossaryName: 'Nama Glosarium',
      glossaryNamePlaceholder: 'mis. Anime Subtitle DB',
      sourceLanguage: 'Bahasa Sumber',
      targetLanguage: 'Bahasa Target',
      appendingTo: 'Menambahkan ke Glosarium:',
      entries: 'Entri Glosarium',
      sourceTerm: 'Istilah Sumber',
      targetTranslation: 'Terjemahan Target',
      detailContext: 'Detail / Konteks',
      optional: '(Opsional)',
      aiSuggested: 'Saran AI',
      duplicate: 'Duplikat',
      sourcePlaceholder: 'Kata/frasa sumber',
      targetPlaceholder: 'Kata/frasa target',
      detailPlaceholder: 'Konteks tambahan...',
      addEntry: 'Tambah entri di bawah',
      deleteEntry: 'Hapus entri',
      confirmSave: 'Konfirmasi & Simpan Glosarium',
      savingGlossary: 'Menyimpan Glosarium...',
      confirmSaveShort: 'Konfirmasi & Simpan',
      alertNoRecommendation: 'Tidak ada data rekomendasi yang tersedia.',
      alertInvalidFormat: 'Format data rekomendasi tidak valid.',
      alertDuplicate: 'Terdapat Istilah Sumber yang duplikat. Harap perbaiki sebelum menyimpan!',
      alertNoChanges: 'Tidak ada perubahan untuk disimpan.',
      alertSaveFailed: 'Gagal menyimpan glosarium: {message}',
      alertSaveError: 'Gagal menyimpan glosarium',
      alertReverted: 'Dikembalikan ke kondisi tersimpan terakhir.',
    },
    generate: {
      button: 'Buat Glosarium',
      loadingGenerating: 'Membuat glosarium di latar belakang... Mohon tunggu.',
      loadingAnalyzing: 'Menganalisis istilah dengan LLM...',
      loadingAlmost: 'Hampir selesai, masih diproses...',
      loadingRequest: 'Membuat permintaan...',
      loadingChecking: 'Memeriksa data yang ada...',
      successGenerated: 'Glosarium berhasil dibuat!',
      failedPrefix: 'Gagal: {message}',
      timeout: 'Proses memakan waktu terlalu lama. Silakan periksa lagi nanti.',
      failedStart: 'Gagal memulai job: {message}',
      errorPrefix: 'Error: {message}',
      failedCheck: 'Gagal memeriksa status',
      modalFoundTitle: 'Glosarium Ditemukan',
      modalFoundMessage: 'Rekomendasi glosarium sudah ada untuk job terjemahan {name}. Apa yang ingin Anda lakukan?',
      modalSubmittedMessage: 'Anda sudah mengirimkan glosarium untuk job terjemahan {name}. Apakah Anda ingin membuatnya ulang?\n\nTindakan ini akan mengurangi saldo.',
      modalGenerateTitle: 'Buat Glosarium',
      modalGenerateMessage: 'Apakah Anda yakin ingin membuat glosarium untuk job terjemahan {name}?\n\nTindakan ini akan mengurangi saldo.',
      regenerate: 'Buat Ulang',
      viewExisting: 'Lihat yang Ada',
      generate: 'Buat',
    },
    dropzone: {
      title: 'Unggah File Subtitle',
      dragDrop: 'Tarik & lepas file .srt atau .ass Anda di sini, atau',
      browseFiles: 'Pilih File',
      supported: 'Didukung: SRT, ASS, TXT (maks 10MB)',
      lastUploaded: 'Terakhir diunggah:',
      alertUnsupported: 'Format file tidak didukung. Harap unggah .srt, .ass, atau .txt.',
      alertTooLarge: 'File terlalu besar. Maks 10MB.',
      alertUploaded: 'File "{name}" berhasil diunggah! ({size} KB)',
    },
  },
  glossary: {
    tipTitle: 'Kuasai Terminologi Anda',
    tipBody: 'Glosarium berfungsi sebagai kamus khusus Anda, memastikan nama merek dan istilah tertentu selalu diterjemahkan persis seperti yang Anda inginkan. Saat memulai terjemahan baru, cukup pilih glosarium tersimpan untuk menerapkan aturan Anda secara instan.',
    listTitle: 'Daftar Glosarium',
    newGlossary: 'Glosarium Baru',
    table: {
      name: 'Nama',
      source: 'Sumber',
      target: 'Target',
      createdAt: 'Dibuat Pada',
      actions: 'Aksi',
    },
    loading: 'Memuat data glosarium...',
    empty: 'Tidak ada glosarium ditemukan.',
    failedLoad: 'Gagal memuat data glosarium.',
    view: 'Lihat',
    edit: 'Edit',
    downloadCsv: 'Unduh CSV',
    createTitle: 'Glosarium Baru',
    editTitle: 'Edit Glosarium',
    reset: 'Reset',
    name: 'Nama Glosarium',
    namePlaceholder: 'mis. Universal',
    sourceLanguage: 'Bahasa Sumber',
    targetLanguage: 'Bahasa Target',
    selectSource: 'Pilih bahasa sumber',
    selectTarget: 'Pilih bahasa target',
    submit: 'Kirim',
    saveChanges: 'Simpan Perubahan',
    alertRequired: 'Harap isi semua field wajib',
    alertCreateFailed: 'Gagal membuat glosarium.',
    alertCreateSuccess: 'Glosarium berhasil dibuat!',
    alertUpdateFailed: 'Gagal memperbarui glosarium.',
    alertUpdateSuccess: 'Glosarium berhasil diperbarui!',
    editorTitle: 'Editor Glosarium - {name} ({source} → {target})',
    resetToLastSave: 'Reset ke Simpanan Terakhir',
    sourceTerm: 'Istilah Sumber',
    targetTranslation: 'Terjemahan Target',
    detailContext: 'Detail / Konteks',
    optional: '(Opsional)',
    sourcePlaceholder: 'Kata/Frasa Asli',
    targetPlaceholder: 'Terjemahan',
    detailPlaceholder: 'Catatan tambahan...',
    addEntry: 'Tambahkan entri di bawah ini',
    deleteEntry: 'Hapus entri ini',
    duplicate: 'Duplikat',
    saving: 'Menyimpan...',
    alertConfirmReset: 'Apakah Anda yakin ingin mengembalikan ke kondisi tersimpan terakhir? Semua perubahan yang belum disimpan akan hilang.',
    alertReverted: 'Dikembalikan ke kondisi tersimpan terakhir.',
    alertNewEntry: 'Entri glosarium baru ditambahkan.',
    alertAtLeastOne: 'Minimal satu entri glosarium diperlukan.',
    alertDeleted: 'Entri glosarium dihapus.',
    alertEmptyRequired: 'Sumber dan Target tidak boleh kosong!',
    alertDuplicate: 'Terdapat Istilah Sumber yang duplikat. Harap perbaiki sebelum menyimpan!',
    alertNoChanges: 'Tidak ada perubahan untuk disimpan.',
    alertSaved: 'Entri glosarium berhasil disimpan.',
    alertSaveError: 'Terjadi kesalahan saat menyimpan.',
    deleteButton: 'Hapus Glosarium',
    deleteTitle: 'Hapus Glosarium',
    deleteMessage: 'Apakah Anda yakin ingin menghapus glosarium ini?\n\nTindakan ini tidak dapat dibatalkan.',
    deleteConfirm: 'Hapus',
    deleting: 'Menghapus glosarium...',
    deleteSlow: 'Proses memakan waktu lebih lama dari biasanya. Mohon tunggu...',
    alertDeleteFailed: 'Gagal menghapus glosarium: {message}',
    duplicateButton: 'Duplikat Glosarium',
    duplicateTitle: 'Duplikat Glosarium',
    duplicateMessage: 'Apakah Anda yakin ingin menduplikasi glosarium ini?\n\nTindakan ini akan membuat glosarium baru dengan konten yang sama.',
    duplicateConfirm: 'Duplikat',
    duplicating: 'Menduplikasi glosarium...',
    alertDuplicateFailed: 'Gagal menduplikasi glosarium: {message}',
  },
};

const en: Dictionary = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    language: 'Language',
  },
  billing: {
    title: 'Billing & History',
    subtitle: 'Manage your invoices and track your recent transactions.',
    topUpBalance: 'Top Up Balance',
    transactionHistory: 'Transaction History',
    table: {
      transactionId: 'Transaction ID',
      date: 'Date',
      amount: 'Amount',
      status: 'Status',
    },
    status: {
      success: 'Success',
      pending: 'Pending',
      failed: 'Failed',
    },
    empty: 'No transactions found.',
  },
  topup: {
    title: 'Top Up Balance',
    amountLabel: '1. Enter Amount (IDR)',
    customAmountPlaceholder: 'Custom amount (Min. 10,000)',
    methodLabel: '2. Select Payment Method',
    qrisDesc: 'Gopay, OVO, Dana, ShopeePay',
    creditCardDesc: 'Visa, Mastercard, JCB',
    notesTitle: 'Payment Notes',
    note1: 'Final payment tag will include a <strong>Platform Fee</strong> based on your selected payment provider.',
    note2: 'Credit Card payments are secured with 3D Secure (OTP).',
    note3: 'Once the payment is successful, the balance is non-refundable.',
    contactTitle: 'Need help? Contact us:',
    topupAmount: 'Top-up Amount',
    feeNotIncluded: '*fee not included',
    payNow: 'Pay Now',
    processing: 'Processing...',
    scanTitle: 'Scan QRIS to Pay',
    orderId: 'Order ID',
    expiresIn: 'Expires in:',
    totalPayment: 'Total Payment',
    scanInstruction: 'Open your <strong>Gopay, OVO, DANA, ShopeePay</strong> app, or m-Banking,<br/> then scan the QR code above.',
    waitingPayment: 'Waiting for your payment to be confirmed...',
    cancel: 'Cancel',
    goToHistory: 'Go to History Page',
    alertMinAmount: 'Minimum top-up amount is IDR 10,000',
    alertPaymentSuccess: 'Payment successful! Balance has been added.',
    alertTransactionCancelled: 'Transaction cancelled or expired.',
    alertQrisExpired: 'QRIS payment time has expired.',
    alertSnapNotReady: 'Payment system is not ready. Please reload the page.',
    alertCcSuccess: 'Credit Card payment successful!',
    alertCcPending: 'Waiting for Bank confirmation. Balance will be added once verified.',
    alertCcError: 'Payment failed to process by the Bank.',
    alertCcClosed: 'You closed the popup before payment completed.',
    alertQrisCreated: 'QRIS created successfully! Please scan.',
    alertPaymentError: 'An error occurred while processing the payment.',
  },
  translate: {
    list: {
      tipTitle: 'Pro Tip: Enhance Future Translations',
      tipBody1: 'Improve translation consistency for your upcoming projects. Once a translation status is ',
      tipBodyCompleted: 'COMPLETED',
      tipBody2: ', open the action menu (',
      tipBody3: ') and select ',
      tipBodyGenerate: 'Generate Glossary',
      tipBody4: '. This will use the selected translation as a reference to automatically create or update your glossary.',
      recentJobs: 'Recent Translation Jobs',
      newTranslate: 'New Translate',
      jobName: 'Job Name',
      source: 'Source',
      target: 'Target',
      glossary: 'Glossary',
      model: 'Model',
      totalTokens: 'Total Tokens',
      totalCost: 'Total Cost',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
      loading: 'Loading translation jobs...',
      empty: 'No translation jobs found.',
      no: 'No',
      page: 'Page',
      from: 'from',
      total: 'Total',
      prev: 'Prev',
      next: 'Next',
      view: 'View',
      downloadSource: 'Download Source',
    },
    create: {
      title: 'New Translation Job',
      reset: 'Reset',
      jobName: 'Job Name',
      jobNamePlaceholder: 'e.g. Episode 12 - Subtitle',
      sourceLanguage: 'Source Language',
      targetLanguage: 'Target Language',
      selectSource: 'Select source language',
      selectTarget: 'Select target language',
      llmModel: 'LLM Model',
      selectModel: 'Select LLM Model',
      batchSize: 'Batch Processing Size',
      glossaryOptional: 'Glossary (Optional)',
      selectGlossary: 'Select Glosary...',
      noGlossaryAvailable: '-- No Glossary Available --',
      noMatchingGlossary: '-- No matching Glossary --',
      glossaryUnavailable: 'Glossary not available',
      subtitleSourceMethod: 'Subtitle Source Method',
      uploadPasteSrt: 'Upload / Paste SRT',
      extractFromVideo: 'Extract from Video',
      driveUrl: 'Google Drive Video URL',
      optional: '(Optional)',
      driveUrlHint: 'Ensure the Google Drive video link access is set to ',
      driveUrlHintPublic: '"Anyone with the link" (Public)',
      subtitleContent: 'Subtitle Content (SRT)',
      dropzoneText: 'Drag & drop your .srt file here, or click to browse',
      pasteSrtPlaceholder: 'Or paste SRT content here...',
      submitJob: 'Submit Job',
      alertUnsupportedFormat: 'Unsupported file format. Please upload an .srt file.',
      alertFileTooLarge: 'File size too large. Maximum 10MB.',
      alertFileUploaded: 'File "{name}" uploaded successfully',
      alertValidation: 'Please fill in Job Name, Source, and Target Language',
      alertCreateFailed: 'Failed to create job.',
      alertCreateSuccess: 'Job created successfully!',
    },
    editor: {
      title: 'Subtitle Preview (SRT)',
      reset: 'Reset',
      saveExport: 'Save & Export',
      driveUrlPublic: 'Google Drive Video URL (PUBLIC)',
      driveUrlPlaceholder: 'https://drive.google.com/file/d/VIDEO_ID/view',
      hidePreview: 'Hide Preview',
      showPreview: 'Show Preview',
      source: 'Source',
      translation: 'Translation',
      startTime: 'Start Time',
      endTime: 'End Time',
      seekVideo: 'Seek video to this timestamp',
      openPreviewFirst: 'Open Preview first',
      addLine: 'Add Line',
      deleteLine: 'Delete Line',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      previewDragMe: '🎥 Preview (drag me)',
      translated: 'Translated',
      alertReset: 'Successfully reset to last saved state.',
      alertNewLine: 'New subtitle line added.',
      alertAtLeastOne: 'At least one subtitle line is required.',
      alertDeleted: 'Subtitle line deleted.',
      alertNoChanges: 'No changes to save.',
      alertSaved: 'Saved.',
      alertVideoFailed: 'Failed to load video preview. Check the URL or Google Drive sharing settings.',
    },
    glossary: {
      loadingData: 'Loading recommendation data...',
      back: 'Back',
      confirmBack: 'Cancel saving glossary and return to the list?',
      editorTitle: 'Glossary Editor (Job #{id})',
      reset: 'Reset',
      createNew: 'Create New Glossary',
      glossaryName: 'Glossary Name',
      glossaryNamePlaceholder: 'e.g. Anime Subtitle DB',
      sourceLanguage: 'Source Language',
      targetLanguage: 'Target Language',
      appendingTo: 'Appending to Glossary:',
      entries: 'Glossary Entries',
      sourceTerm: 'Source Term',
      targetTranslation: 'Target Translation',
      detailContext: 'Detail / Context',
      optional: '(Optional)',
      aiSuggested: 'AI Suggested',
      duplicate: 'Duplicate',
      sourcePlaceholder: 'Source word/phrase',
      targetPlaceholder: 'Target word/phrase',
      detailPlaceholder: 'Additional context...',
      addEntry: 'Add entry below',
      deleteEntry: 'Delete entry',
      confirmSave: 'Confirm & Save Glossary',
      savingGlossary: 'Saving Glossary...',
      confirmSaveShort: 'Confirm & Save',
      alertNoRecommendation: 'No recommendation data available.',
      alertInvalidFormat: 'Invalid recommendation data format.',
      alertDuplicate: 'There are duplicate Source Terms. Please fix them before saving!',
      alertNoChanges: 'No changes to save.',
      alertSaveFailed: 'Failed to save glossary: {message}',
      alertSaveError: 'Failed to save glossary',
      alertReverted: 'Reverted to last saved state.',
    },
    generate: {
      button: 'Generate Glosary',
      loadingGenerating: 'Generating glossary in background... Please wait.',
      loadingAnalyzing: 'Analyzing terms with LLM...',
      loadingAlmost: 'Almost there, still processing...',
      loadingRequest: 'Making request...',
      loadingChecking: 'Checking existing data...',
      successGenerated: 'Glossary successfully generated!',
      failedPrefix: 'Failed: {message}',
      timeout: 'Process is taking too long. Please check again later.',
      failedStart: 'Failed to start job: {message}',
      errorPrefix: 'Error: {message}',
      failedCheck: 'Failed to check status',
      modalFoundTitle: 'Glossary Found',
      modalFoundMessage: 'Glossary recommendations already exist for this translation job {name}. What would you like to do?',
      modalSubmittedMessage: 'You have already submitted a glossary for this translation job {name}. Would you like to regenerate it?\n\nThis action will consume balance.',
      modalGenerateTitle: 'Generate Glossary',
      modalGenerateMessage: 'Are you sure you want to generate a glossary for this translation job {name}?\n\nThis action will consume balance.',
      regenerate: 'Regenerate',
      viewExisting: 'View Existing',
      generate: 'Generate',
    },
    dropzone: {
      title: 'Upload Subtitle File',
      dragDrop: 'Drag & drop your .srt or .ass file here, or',
      browseFiles: 'Browse Files',
      supported: 'Supported: SRT, ASS, TXT (max 10MB)',
      lastUploaded: 'Last uploaded:',
      alertUnsupported: 'Unsupported file format. Please upload .srt, .ass, or .txt.',
      alertTooLarge: 'File too large. Max 10MB.',
      alertUploaded: 'File "{name}" uploaded successfully! ({size} KB)',
    },
  },
  glossary: {
    tipTitle: 'Master Your Terminology',
    tipBody: 'A glossary acts as your custom dictionary, ensuring brand names and specific terms are always translated exactly the way you want. When starting a new translation, simply choose a saved glossary to apply your rules instantly.',
    listTitle: 'List Glosaries',
    newGlossary: 'New Glosary',
    table: {
      name: 'Name',
      source: 'Source',
      target: 'Target',
      createdAt: 'Created At',
      actions: 'Actions',
    },
    loading: 'Loading glossary data...',
    empty: 'No Glosary found.',
    failedLoad: 'Failed to load glosary data.',
    view: 'View',
    edit: 'Edit',
    downloadCsv: 'Download CSV',
    createTitle: 'New Glosary',
    editTitle: 'Edit Glosary',
    reset: 'Reset',
    name: 'Glosary Name',
    namePlaceholder: 'e.g. Universal',
    sourceLanguage: 'Source Language',
    targetLanguage: 'Target Language',
    selectSource: 'Select source language',
    selectTarget: 'Select target language',
    submit: 'Submit',
    saveChanges: 'Save Changes',
    alertRequired: 'Please fill in all required fields',
    alertCreateFailed: 'Error creating glosary.',
    alertCreateSuccess: 'Glosary created successfully!',
    alertUpdateFailed: 'Error updating glosary.',
    alertUpdateSuccess: 'Glosary updated successfully!',
    editorTitle: 'Glosarium Editor - {name} ({source} → {target})',
    resetToLastSave: 'Reset to Last Save',
    sourceTerm: 'Source Term',
    targetTranslation: 'Target Translation',
    detailContext: 'Detail / Context',
    optional: '(Optional)',
    sourcePlaceholder: 'Original Word/Phrase',
    targetPlaceholder: 'Translation',
    detailPlaceholder: 'Additional notes...',
    addEntry: 'Add entry below',
    deleteEntry: 'Delete this entry',
    duplicate: 'Duplicate',
    saving: 'Saving...',
    alertConfirmReset: 'Are you sure you want to revert to the last saved state? All unsaved changes will be lost.',
    alertReverted: 'Reverted to last saved state.',
    alertNewEntry: 'New glosary entry added.',
    alertAtLeastOne: 'At least one glosary entry is required.',
    alertDeleted: 'Glosary entry deleted.',
    alertEmptyRequired: 'Source and Target cannot be empty!',
    alertDuplicate: 'There are duplicate Source Terms. Please fix them before saving!',
    alertNoChanges: 'No changes to save.',
    alertSaved: 'Glosary entries saved successfully.',
    alertSaveError: 'An error occurred while saving.',
    deleteButton: 'Delete Glosary',
    deleteTitle: 'Delete Glossary',
    deleteMessage: 'Are you sure you want to delete this glossary?\n\nThis action cannot be undone.',
    deleteConfirm: 'Delete',
    deleting: 'Deleting glossary...',
    deleteSlow: 'This is taking longer than expected. Please wait...',
    alertDeleteFailed: 'Failed to delete glossary: {message}',
    duplicateButton: 'Duplicate Glosary',
    duplicateTitle: 'Duplicate Glossary',
    duplicateMessage: 'Are you sure you want to duplicate this glossary?\n\nThis action will create a new glossary with the same content.',
    duplicateConfirm: 'Duplicate',
    duplicating: 'Duplicating glossary...',
    alertDuplicateFailed: 'Failed to duplicate glossary: {message}',
  },
};

export const dictionaries: Record<Locale, Dictionary> = { id, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.id;
}
