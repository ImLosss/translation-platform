'use client';

import Link from "next/link";
import EllipsisDropdown from "../client/ElipsisDropdown";
import { generateGlossaryAction } from "@/app/actions/translate/generateGlosaryAction";
import { useModal } from "../ui/ModalProvider";
import { useLoading } from "../ui/LoadingProvider";
import { useAlert } from "../ui/Alert";
import { useRouter } from "next/navigation";

interface ButtonGenerateGlosaryProps {
  jobId: number;
  jobStatus: string;
}

export default function ButtonGenerateGlosary({ jobId, jobStatus }: ButtonGenerateGlosaryProps) {
  const { showModal } = useModal();
  const { showLoading, updateMessage, hideLoading } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleGenerateGlossary = () => {
    showModal({
      title: "Generate Glossary",
      message: "Are you sure you want to generate a glossary for this translation job?\n\nThis action will consume balance and insert/create glossary entries based on the translation data.",
      buttons: [
        {
          label: "Cancel",
          variant: "outline",
          onClick: () => { }
        },
        {
          label: "Generate",
          variant: "primary",
          onClick: async () => {
            showLoading("Generating glossary...");
            const timer = setTimeout(() => {
              updateMessage("This is taking longer than expected. Please wait...");
            }, 15000);

            try {
              // pemanngilan action untuk generate glossary
              const response = await generateGlossaryAction(jobId);
              const dataToPass = {
                jobId: jobId,
                recommendations: response.recommendations
              };
              sessionStorage.setItem('tempGlossary', JSON.stringify(dataToPass));

              router.push('translate/generate-glosary');
            } catch (error: any) {
              showAlert(`Failed to generate glossary: ${error.message}`, 'warning');
            } finally {
              clearTimeout(timer);
              hideLoading();
            }
          },
        }
      ],
    });
  };

  return (
        <button
          type="button"
          className={`dropdown-item ${jobStatus !== "COMPLETED" ? "disabled" : ""}`}
          disabled={jobStatus !== "COMPLETED"}
          onClick={handleGenerateGlossary}
        >
          <i className="fas fa-book"></i> Generate Glosary
        </button>
  );
}