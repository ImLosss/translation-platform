import TableData from "@/app/components/translate/TableData";
import TipCard from "@/app/components/ui/TipCard";

export default function TranslatePage() {
  return (
    <>
      <TipCard 
        title="Pro Tip: Enhance Future Translations" 
        icon="lightbulb"
      >
        Improve translation consistency for your upcoming projects. Once a translation status is <strong>COMPLETED</strong>, open the action menu (<i className="fas fa-ellipsis-v" style={{ margin: "0 5px" }}></i>) and select <strong>Generate Glossary</strong>. This will use the selected translation as a reference to automatically create or update your glossary.
      </TipCard>

      <TableData />
    </>
  );
}