'use client';

import Link from "next/link";
import EllipsisDropdown from "../client/ElipsisDropdown";
import { generateGlossaryAction } from "@/app/actions/translate/generateGlosaryAction";
import { useModal } from "../ui/ModalProvider";
import { useLoading } from "../ui/LoadingProvider";
import { useAlert } from "../ui/Alert";
import { useRouter } from "next/navigation";
import { deleteGlosaryAction } from "@/app/actions/glosary/deleteGlosaryAction";

interface ButtonDeleteGlosaryProps {
  glossaryId: number;
}

export default function DeleteGlossaryButton({ glossaryId }: ButtonDeleteGlosaryProps) {
  const { showModal } = useModal();
  const { showLoading, updateMessage, hideLoading } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleDeleteGlossary = () => {
    showModal({
      title: "Delete Glossary",
      message: "Are you sure you want to delete this glossary?\n\nThis action cannot be undone.",
      buttons: [
        {
          label: "Cancel",
          variant: "outline",
          onClick: () => { }
        },
        {
          label: "Delete",
          variant: "primary",
          onClick: async () => {
            showLoading("Deleting glossary...");
            const timer = setTimeout(() => {
              updateMessage("This is taking longer than expected. Please wait...");
            }, 15000);

            try {
              // pemanngilan action untuk delete glossary
              const response = await deleteGlosaryAction(glossaryId);

              if(!response.success) {
                showAlert(`Failed to delete glossary: ${response.message}`, 'info');
                return;
              }

              showAlert(response.message, 'success');
              router.refresh();
            } catch (error: any) {
              showAlert(`Failed to delete glossary: ${error.message}`, 'warning');
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
        <button className="dropdown-item" type="button" onClick={handleDeleteGlossary}>
          <i className="fas fa-trash"></i> Delete Glosary
        </button>
  );
}