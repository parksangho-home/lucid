import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { safeMarkdownUrl } from "../../lib/dashboard/domain.ts";
export function NoteMarkdown({body}: {body: string}) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={safeMarkdownUrl}
    components={{
      // Remote images are not fetched: pasted content cannot send tracking requests.
      img: ({alt}) => <span>[이미지: {alt || "첨부 이미지"}]</span>,
      a: ({href, children}) => href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span>,
    }}>{body}</ReactMarkdown>;
}
