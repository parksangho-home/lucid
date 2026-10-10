import { NoteDetail } from "../../../components/dashboard/detail";
export const metadata = {title: "학습 글 읽기"};
export default async function NotePage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  return <NoteDetail key={id} id={id} />;
}
