import { PageIntro } from "@/components/ui/PageIntro";
import { NotesPlaceholder } from "@/components/notes/NotesPlaceholder";
export const metadata = { title: "NOTES" };
export default function NotesPage() {
  return (
    <div className="container inner-page">
      <PageIntro
        label="LOGBOOK / LEARNING IN PUBLIC"
        title="NOTES & DISCOVERIES"
        description="AI, 개발, 생산성과 안전. 새로운 것을 배우고 직접 실험하며 쌓아가는 기록입니다."
      />
      <NotesPlaceholder />
    </div>
  );
}
