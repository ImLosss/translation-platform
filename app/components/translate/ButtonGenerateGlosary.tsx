'use client';

import { useRouter } from "next/navigation";
import { useModal } from "../ui/ModalProvider";
import { useLoading } from "../ui/LoadingProvider";
import { useAlert } from "../ui/Alert";
import { generateGlossaryAction, checkGlossaryAction } from "@/app/actions/translate/generateGlosaryAction";

interface ButtonGenerateGlosaryProps {
  jobId: number;
  jobStatus: string;
}

export default function ButtonGenerateGlosary({ jobId, jobStatus }: ButtonGenerateGlosaryProps) {
  const { showModal } = useModal();
  const { showLoading, updateMessage, hideLoading } = useLoading();
  const { showAlert } = useAlert();
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
    showLoading("Generating glossary in background... Please wait.");
    
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
            showAlert(`Failed: ${recs.message}`, 'error');
            return;
          }
          
          // Jika data array rekomendasi sudah terisi (artinya sukses)
          if (Array.isArray(recs) && recs.length > 0) {
            clearInterval(interval);
            hideLoading();
            showAlert("Glossary successfully generated!", 'success');
            saveAndRedirect(res.data);
            return;
          }
        }
        
        // Ubah teks loading sesekali agar user tahu sistem tidak freeze
        if (attempts === 6) updateMessage("Analyzing terms with LLM...");
        if (attempts === 15) updateMessage("Almost there, still processing...");

        // Timeout fallback
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          hideLoading();
          showAlert("Process is taking too long. Please check again later.", 'warning');
        }

      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); // Polling setiap 5 detik
  };

  // Fungsi yang men-trigger proses pembuatan baru
  const handleTriggerGenerate = async () => {
    showLoading("Making request...");
    try {
      const response = await generateGlossaryAction(jobId);
      if (!response.success) {
        hideLoading();
        showAlert(`Failed to start job: ${response.message}`, 'error');
        return;
      }
      // Mulai polling karena respons awal hanya konfirmasi background job jalan
      startPolling();
    } catch (error: any) {
      hideLoading();
      showAlert(`Error: ${error.message}`, 'error');
    }
  };

  // Fungsi utama saat tombol Generate diklik
  const handleInitialClick = async () => {
    showLoading("Checking existing data...");
    
    try {
      // 1. Cek dulu apakah rekomendasi sudah ada di database
      const checkRes = await checkGlossaryAction(jobId);
      hideLoading();

      const existingRecs = checkRes.data?.recommendations;
      const isExistAndValid = Array.isArray(existingRecs) && existingRecs.length > 0;

      if (isExistAndValid) {
        // 2. Jika SUDAH ADA, tampilkan modal dengan 3 Tombol
        showModal({
          title: "Glossary Found",
          message: "Glossary recommendations already exist for this translation job. What would you like to do?",
          buttons: [
            {
              label: "Cancel",
              variant: "outline",
              onClick: () => {}
            },
            {
              label: "Regenerate",
              variant: "danger", 
              onClick: () => {
                handleTriggerGenerate();
              }
            },
            {
              label: "View Existing",
              variant: "primary",
              onClick: () => saveAndRedirect(checkRes.data)
            }
          ],
        });
      } else {
        // 3. Jika BELUM ADA, tampilkan modal default (2 tombol)
        showModal({
          title: "Generate Glossary",
          message: "Are you sure you want to generate a glossary for this translation job?\n\nThis action will consume balance.",
          buttons: [
            {
              label: "Cancel",
              variant: "outline",
              onClick: () => { }
            },
            {
              label: "Generate",
              variant: "primary",
              onClick: handleTriggerGenerate,
            }
          ],
        });
      }
    } catch (error: any) {
      hideLoading();
      showAlert("Failed to check status", "error");
    }
  };

  return (
    <button
      type="button"
      className={`dropdown-item ${jobStatus !== "COMPLETED" ? "disabled" : ""}`}
      disabled={jobStatus !== "COMPLETED"}
      onClick={handleInitialClick}
    >
      <i className="fas fa-book"></i> Generate Glosary
    </button>
  );
}