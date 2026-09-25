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
};

export const dictionaries: Record<Locale, Dictionary> = { id, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.id;
}
