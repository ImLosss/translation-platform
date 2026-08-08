'use client';

import Link from "next/link";
import EllipsisDropdown from "../client/ElipsisDropdown";
import { generateGlossaryAction } from "@/app/actions/translate/generateGlosaryAction";
import { useModal } from "../ui/ModalProvider";
import { useLoading } from "../ui/LoadingProvider";

interface ButtonGenerateGlosaryProps {
  jobId: number;
  jobStatus: string;
}

export default function ButtonGenerateGlosary({ jobId, jobStatus }: ButtonGenerateGlosaryProps) {
  const { showModal } = useModal();
  const { showLoading, updateMessage, hideLoading } = useLoading();

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

            } catch (error) {

            } finally {
              // clearTimeout(timer);
              // hideLoading();
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
          <i className="fas fa-file-alt"></i> Generate Glosary
        </button>
  );
}