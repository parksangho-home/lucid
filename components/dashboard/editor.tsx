"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { StudyNote } from "../../lib/dashboard/domain.ts";
import { useNoteRequest } from "./client";
import { NoteMarkdown } from "./markdown";
import styles from "./dashboard.module.css";
export function NoteEditor({note, onSaved, onCancel}: {note?: StudyNote; onSaved?: (note: StudyNote) => void; onCancel?: () => void}) {
  const router = useRouter();
  const request = useNoteRequest();
  const pending = useRef<AbortController | null>(null);
  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const [category, setCategory] = useState(note?.category ?? "기타");
  const [bookmarked, setBookmarked] = useState(note?.bookmarked ?? false);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => pending.current?.abort(), []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pending.current) return;
    const abort = new AbortController(); pending.current = abort;
    setBusy(true); setError("");
    try {
      const data = await request("/api/dashboard/notes" + (note ? "/" + note.id : ""), {
        method: note ? "PATCH" : "POST", signal: abort.signal,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title, body, category, bookmarked}),
      });
      if (abort.signal.aborted) return;
      if (onSaved) onSaved(data.note as StudyNote);
      else router.push("/dashboard/" + data.note.id);
    } catch (e) {if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "저장하지 못했습니다.");}
    finally {pending.current = null; if (!abort.signal.aborted) setBusy(false);}
  }
  return <section>
    <h1>{note ? "학습 글 수정" : "학습 글 작성"}</h1>
    <p>ChatGPT에서 복사한 답변을 본문에 붙여 넣으세요. Markdown 형식도 사용할 수 있습니다.</p>
    <form onSubmit={save} className={styles.form}>
      <label>제목<input required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} disabled={busy} /></label>
      <label>카테고리<input required maxLength={80} value={category} onChange={e => setCategory(e.target.value)} disabled={busy} /></label>
      <label className={styles.check}><input type="checkbox" checked={bookmarked} onChange={e => setBookmarked(e.target.checked)} disabled={busy} />북마크</label>
      <label>본문<textarea required maxLength={100000} rows={15} value={body} onChange={e => setBody(e.target.value)} disabled={busy} /></label>
      <button type="button" aria-expanded={preview} onClick={() => setPreview(v => !v)}>{preview ? "미리보기 닫기" : "Markdown 미리보기"}</button>
      {preview && <div className={styles.markdown}><NoteMarkdown body={body} /></div>}
      {error && <p role="alert">{error}</p>}
      <div className={styles.actions}>
        <button type="submit" disabled={busy}>{busy ? "저장 중…" : "저장"}</button>
        {onCancel ? <button type="button" disabled={busy} onClick={onCancel}>취소</button> : <Link href="/dashboard">목록으로</Link>}
      </div>
    </form>
  </section>;
}
