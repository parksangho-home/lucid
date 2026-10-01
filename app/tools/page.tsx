import { PageIntro } from "@/components/ui/PageIntro";
import { ToolGrid } from "@/components/tools/ToolGrid";
export const metadata = { title: "TOOLS" };
export default function ToolsPage() {
  return (
    <div className="container inner-page">
      <PageIntro
        label="UTILITIES / EVERYDAY EXPLORATION"
        title="SMALL TOOLS, BIG HELP"
        description="직접 만들고 일상에서 사용하는 작은 웹 도구들. 현재 준비 중이며, 완성된 도구부터 하나씩 공개합니다."
      />
      <ToolGrid />
    </div>
  );
}
