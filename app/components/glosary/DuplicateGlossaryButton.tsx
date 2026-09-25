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
import { useLanguage } from "../client/LanguageProvider";
import { interpolate } from "@/app/lib/i18n/format";

interface ButtonDuplicateGlosaryProps {
  glossaryId: number;
}

export default function DuplicateGlossaryButton({ glossaryId }: ButtonDuplicateGlosaryProps) {
  const { showModal } = useModal();
  const { showLoading, updateMessage, hideLoading } = useLoading();
  const { showAlert } = useAlert();
  const { t } = useLanguage();
  const router = useRouter();

  const handleDuplicateGlossary = () => {
    showModal({
      title: t.glossary.duplicateTitle,
      message: t.glossary.duplicateMessage,
      buttons: [
        {
          label: t.common.cancel,
          variant: "outline",
          onClick: () => { }
        },
        {
          label: t.glossary.duplicateConfirm,
          variant: "primary",
          onClick: async () => {
            showLoading(t.glossary.duplicating);

            try {
              const response = await duplicateGlosaryAction(glossaryId);

              if(!response.success) {
                showAlert(interpolate(t.glossary.alertDuplicateFailed, { message: response.message }), 'info');
                return;
              }

              showAlert(response.message, 'success');
              router.refresh();
            } catch (error: any) {
              showAlert(interpolate(t.glossary.alertDuplicateFailed, { message: error.message }), 'warning');
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
          <i className="fas fa-copy"></i> {t.glossary.duplicateButton}
        </button>
  );
}