"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { StudyNote } from "../../lib/dashboard/domain.ts";
import { useNoteRequest } from "./client";
import { NoteEditor } from "./editor";
import { NoteMarkdown } from "./markdown";
import styles from "./dashboard.module.css";
export function NoteDetail({id}: {id: string}) {
  const request = useNoteRequest();
  const router = useRouter();
  const [note, setNote] = useState<StudyNote | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    request("/api/dashboard/notes/" + encodeURIComponent(id), {signal: abort.signal})
      .then(data => {if (!abort.signal.aborted) setNote(data.note);})
      .catch(e => {if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "자료를 불러올 수 없습니다.");});
    return () => {abort.abort(); pending.current?.abort();};
  }, [id, request]);
  async function mutate(remove: boolean) {
    if (!note || pending.current || (remove && !window.confirm("이 학습 글을 삭제하시겠습니까?"))) return;
    const abort = new AbortController(); pending.current = abort;
    setBusy(true); setError("");
    try {
      const data = await request("/api/dashboard/notes/" + note.id, {method: remove ? "DELETE" : "PATCH", signal: abort.signal,
        headers: {"Content-Type": "application/json"}, ...(remove ? {} : {body: JSON.stringify({bookmarked: !note.bookmarked})})});
      if (abort.signal.aborted) return;
      if (remove) router.push("/dashboard"); else setNote(data.note);
    } catch (e) {if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "변경하지 못했습니다.");}
    finally {pending.current = null; if (!abort.signal.aborted) setBusy(false);}
  }
  if (editing && note) return <NoteEditor key={note.id} note={note} onSaved={saved => {setNote(saved); setEditing(false);}} onCancel={() => setEditing(false)} />;
  return <section>
    {error && <p role="alert">{error}</p>}
    {!note ? <p role="status">{error ? "자료를 표시할 수 없습니다." : "불러오는 중입니다."}</p> : <>
      <h1>{note.title}</h1>
      <p className={styles.meta}>{note.category} · 수정 {new Date(note.updated_at).toLocaleString("ko-KR")}</p>
      <div className={styles.actions}>
        <button disabled={busy} aria-pressed={note.bookmarked} onClick={() => void mutate(false)}>{note.bookmarked ? "북마크 해제" : "북마크"}</button>
        <button disabled={busy} onClick={() => setEditing(true)}>수정</button>
        <button disabled={busy} onClick={() => void mutate(true)}>삭제</button>
      </div>
      <div className={styles.markdown}><NoteMarkdown body={note.body} /></div>
    </>}
    <Link href="/dashboard">목록으로</Link>
  </section>;
}
