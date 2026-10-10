"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { StudyNote } from "../../lib/dashboard/domain.ts";
import { useNoteRequest } from "./client";
import styles from "./dashboard.module.css";
export function NoteLibrary() {
  const request = useNoteRequest();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{notes: StudyNote[]; count: number} | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    // Clear results immediately rather than showing a previous filter's records.
    const timer = setTimeout(() => {
      setResult(null); setError("");
      const params = new URLSearchParams({q: search, category, bookmarked: String(bookmarked), page: String(page)});
      request("/api/dashboard/notes?" + params, {signal: abort.signal})
        .then(data => {if (!abort.signal.aborted) setResult(data);})
        .catch(e => {if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "목록을 불러올 수 없습니다.");});
    }, 200);
    return () => {clearTimeout(timer); abort.abort();};
  }, [request, search, category, bookmarked, page]);
  return <section>
    <h1>개인 학습 자료실</h1>
    <p>ChatGPT 답변을 복사해 저장하고 다시 읽어보세요.</p>
    <div className={styles.filters}>
      <label>제목·본문 검색<input type="search" value={search} maxLength={200} onChange={e => {setSearch(e.target.value); setPage(0);}} /></label>
      <label>카테고리<input value={category} maxLength={80} placeholder="전체 (비워 두기)" onChange={e => {setCategory(e.target.value); setPage(0);}} /></label>
      <label className={styles.check}><input type="checkbox" checked={bookmarked} onChange={e => {setBookmarked(e.target.checked); setPage(0);}} />북마크만 보기</label>
    </div>
    {error ? <p role="alert">{error}</p> : !result ? <p role="status">목록을 불러오는 중입니다.</p> : <>
      <p className={styles.meta}>{result.count}개의 학습 글</p>
      {!result.notes.length && <p>조건에 맞는 학습 글이 없습니다. <Link href="/dashboard/new">글 작성</Link></p>}
      <div className={styles.cards}>{result.notes.map(note => <article className={styles.card} key={note.id}>
        <h2><Link href={"/dashboard/" + note.id}>{note.title}</Link></h2>
        <p className={styles.meta}>{note.category} · {note.bookmarked ? "북마크 · " : ""}{new Date(note.updated_at).toLocaleDateString("ko-KR")}</p>
        <p className={styles.excerpt}>{note.body.slice(0, 180)}</p>
      </article>)}</div>
      <div className={styles.actions}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>이전</button>
        <span className={styles.meta}>{page + 1}페이지</span>
        <button disabled={(page + 1) * 30 >= result.count} onClick={() => setPage(p => p + 1)}>다음</button>
      </div>
    </>}
  </section>;
}
