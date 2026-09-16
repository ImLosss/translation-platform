'use client';

import Link from "next/link";
import EllipsisDropdown from "../client/ElipsisDropdown";
import { generateGlossaryAction } from "@/app/actions/translate/generateGlosaryAction";
import { useModal } from "../ui/ModalProvider";
import { useLoading } from "../ui/LoadingProvider";
import { useAlert } from "../ui/Alert";
import { useRouter } from "next/navigation";
import { deleteGlosaryAction } from "@/app/actions/glosary/deleteGlosaryAction";
import { duplicateGlosaryAction } from "@/app/actions/glosary/duplicateGlosaryAction";

interface ButtonDuplicateGlosaryProps {
  glossaryId: number;
}

export default function DuplicateGlossaryButton({ glossaryId }: ButtonDuplicateGlosaryProps) {
  const { showModal } = useModal();
  const { showLoading, updateMessage, hideLoading } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleDuplicateGlossary = () => {
    showModal({
      title: "Duplicate Glossary",
      message: "Are you sure you want to duplicate this glossary?\n\nThis action will create a new glossary with the same content.",
      buttons: [
        {
          label: "Cancel",
          variant: "outline",
          onClick: () => { }
        },
        {
          label: "Duplicate",
          variant: "primary",
          onClick: async () => {
            showLoading("Duplicating glossary...");

            try {
              const response = await duplicateGlosaryAction(glossaryId);

              if(!response.success) {
                showAlert(`Failed to duplicate glossary: ${response.message}`, 'info');
                return;
              }

              showAlert(response.message, 'success');
              router.refresh();
            } catch (error: any) {
              showAlert(`Failed to duplicate glossary: ${error.message}`, 'warning');
            } finally {
              hideLoading();
            }
          },
        }
      ],
    });
  };

  return (
        <button className="dropdown-item" type="button" onClick={handleDuplicateGlossary}>
          <i className="fas fa-copy"></i> Duplicate Glosary
        </button>
  );
}