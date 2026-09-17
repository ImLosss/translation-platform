import TableData from "@/app/components/glosary/TableData";
import TipCard from "@/app/components/ui/TipCard";

export default function AdminPage() {
  return (
    <>
      <TipCard 
        title="Master Your Terminology" 
        icon="info"
      >
        A glossary acts as your custom dictionary, ensuring brand names and specific terms are always translated exactly the way you want. When starting a new translation, simply choose a saved glossary to apply your rules instantly.
      </TipCard>
      <TableData />
    </>
  );
}