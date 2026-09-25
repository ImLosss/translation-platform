'use client';

import Link from "next/link";
import EllipsisDropdown from "../client/ElipsisDropdown";
import { generateGlossaryAction } from "@/app/actions/translate/generateGlosaryAction";
import { useModal } from "../ui/ModalProvider";
import { useLoading } from "../ui/LoadingProvider";
import { useAlert } from "../ui/Alert";
import { useRouter } from "next/navigation";
import { deleteGlosaryAction } from "@/app/actions/glosary/deleteGlosaryAction";
import { useLanguage } from "../client/LanguageProvider";
import { interpolate } from "@/app/lib/i18n/format";

interface ButtonDeleteGlosaryProps {
  glossaryId: number;
}

export default function DeleteGlossaryButton({ glossaryId }: ButtonDeleteGlosaryProps) {
  const { showModal } = useModal();
  const { showLoading, updateMessage, hideLoading } = useLoading();
  const { showAlert } = useAlert();
  const { t } = useLanguage();
  const router = useRouter();

  const handleDeleteGlossary = () => {
    showModal({
      title: t.glossary.deleteTitle,
      message: t.glossary.deleteMessage,
      buttons: [
        {
          label: t.common.cancel,
          variant: "outline",
          onClick: () => { }
        },
        {
          label: t.glossary.deleteConfirm,
          variant: "primary",
          onClick: async () => {
            showLoading(t.glossary.deleting);
            const timer = setTimeout(() => {
              updateMessage(t.glossary.deleteSlow);
            }, 15000);

            try {
              // pemanngilan action untuk delete glossary
              const response = await deleteGlosaryAction(glossaryId);

              if(!response.success) {
                showAlert(interpolate(t.glossary.alertDeleteFailed, { message: response.message }), 'info');
                return;
              }

              showAlert(response.message, 'success');
              router.refresh();
            } catch (error: any) {
              showAlert(interpolate(t.glossary.alertDeleteFailed, { message: error.message }), 'warning');
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
          <i className="fas fa-trash"></i> {t.glossary.deleteButton}
        </button>
  );
}