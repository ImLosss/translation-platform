'use client';

import { useRouter } from "next/navigation";
import { useModal } from "../ui/ModalProvider";
import { useLoading } from "../ui/LoadingProvider";
import { useAlert } from "../ui/Alert";
import { generateGlossaryAction, checkGlossaryAction } from "@/app/actions/translate/generateGlosaryAction";
import { useLanguage } from "../client/LanguageProvider";
import { interpolate } from "@/app/lib/i18n/format";

interface ButtonGenerateGlosaryProps {
  jobId: number;
  jobStatus: string;
  jobName: string;
}

export default function ButtonGenerateGlosary({ jobId, jobStatus, jobName }: ButtonGenerateGlosaryProps) {
  const { showModal } = useModal();
  const { showLoading, updateMessage, hideLoading } = useLoading();
  const { showAlert } = useAlert();
  const { t } = useLanguage();
  const router = useRouter();

  // Fungsi helper untuk menyimpan ke session & redirect
  const saveAndRedirect = (data: any) => {
    const dataToPass = {
      translationId: jobId,
      glosary: data.glossary,
      sourceLang: data.sourceLang,
      targetLang: data.targetLang,
      recommendations: data.recommendations
    };
    sessionStorage.setItem('tempGlossary', JSON.stringify(dataToPass));
    router.push('/translate/generate-glosary');
  };

  // Fungsi untuk memulai Polling ke Backend
  const startPolling = () => {
    showLoading(t.translate.generate.loadingGenerating);
    
    let attempts = 0;
    const maxAttempts = 36; // Misal maks 36 kali cek (3 menit jika interval 5 detik)
    
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await checkGlossaryAction(jobId);
        
        if (res.success && res.data?.recommendations) {
          const recs = res.data.recommendations;
          
          // Jika proses di backend ternyata error (disimpan sebagai JSON error)
          if (recs.error) {
            clearInterval(interval);
            hideLoading();
            showAlert(interpolate(t.translate.generate.failedPrefix, { message: recs.message }), 'error');
            return;
          }
          
          // Jika data array rekomendasi sudah terisi (artinya sukses)
          if (Array.isArray(recs) && recs.length > 0) {
            clearInterval(interval);
            hideLoading();
            showAlert(t.translate.generate.successGenerated, 'success');
            saveAndRedirect(res.data);
            return;
          }
        }
        
        // Ubah teks loading sesekali agar user tahu sistem tidak freeze
        if (attempts === 6) updateMessage(t.translate.generate.loadingAnalyzing);
        if (attempts === 15) updateMessage(t.translate.generate.loadingAlmost);

        // Timeout fallback
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          hideLoading();
          showAlert(t.translate.generate.timeout, 'warning');
        }

      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); // Polling setiap 5 detik
  };

  // Fungsi yang men-trigger proses pembuatan baru
  const handleTriggerGenerate = async () => {
    showLoading(t.translate.generate.loadingRequest);
    try {
      const response = await generateGlossaryAction(jobId);
      if (!response.success) {
        hideLoading();
        showAlert(interpolate(t.translate.generate.failedStart, { message: response.message }), 'error');
        return;
      }
      // Mulai polling karena respons awal hanya konfirmasi background job jalan
      startPolling();
    } catch (error: any) {
      hideLoading();
      showAlert(interpolate(t.translate.generate.errorPrefix, { message: error.message }), 'error');
    }
  };

  // Fungsi utama saat tombol Generate diklik
  const handleInitialClick = async () => {
    showLoading(t.translate.generate.loadingChecking);
    
    try {
      // 1. Cek dulu apakah rekomendasi sudah ada di database
      const checkRes = await checkGlossaryAction(jobId);
      hideLoading();

      const existingRecs = checkRes.data?.recommendations;
      const isExistAndValid = Array.isArray(existingRecs) && existingRecs.length > 0;
      const isExistAndSubmitted = Array.isArray(existingRecs) && existingRecs.length === 0;

      if (isExistAndValid) {
        // 2. Jika SUDAH ADA, tampilkan modal dengan 3 Tombol
        showModal({
          title: t.translate.generate.modalFoundTitle,
          message: interpolate(t.translate.generate.modalFoundMessage, { name: jobName }),
          buttons: [
            {
              label: t.common.cancel,
              variant: "outline",
              onClick: () => {}
            },
            {
              label: t.translate.generate.regenerate,
              variant: "danger", 
              onClick: () => {
                handleTriggerGenerate();
              }
            },
            {
              label: t.translate.generate.viewExisting,
              variant: "primary",
              onClick: () => saveAndRedirect(checkRes.data)
            }
          ],
        });
      } else if (isExistAndSubmitted) {
        showModal({
          title: t.translate.generate.modalGenerateTitle,
          message: interpolate(t.translate.generate.modalSubmittedMessage, { name: jobName }),
          buttons: [
            {
              label: t.common.cancel,
              variant: "outline",
              onClick: () => { }
            },
            {
              label: t.translate.generate.generate,
              variant: "primary",
              onClick: handleTriggerGenerate,
            }
          ],
        });
      } else {
        // 3. Jika BELUM ADA, tampilkan modal default (2 tombol)
        showModal({
          title: t.translate.generate.modalGenerateTitle,
          message: interpolate(t.translate.generate.modalGenerateMessage, { name: jobName }),
          buttons: [
            {
              label: t.common.cancel,
              variant: "outline",
              onClick: () => { }
            },
            {
              label: t.translate.generate.generate,
              variant: "primary",
              onClick: handleTriggerGenerate,
            }
          ],
        });
      }
    } catch (error: any) {
      hideLoading();
      showAlert(t.translate.generate.failedCheck, "error");
    }
  };

  return (
    <button
      type="button"
      className={`dropdown-item ${jobStatus !== "COMPLETED" ? "disabled" : ""}`}
      disabled={jobStatus !== "COMPLETED"}
      onClick={handleInitialClick}
    >
      <i className="fas fa-book"></i> {t.translate.generate.button}
    </button>
  );
}