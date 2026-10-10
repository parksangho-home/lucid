"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Note = { id: number; title: string; category: string; body: string; created_at: string; updated_at: string };
const categories = ["LucidSpace", "AI Music", "Baduk Game", "Lotto Lab", "AI", "ETC"];
const empty = { title: "", category: "LucidSpace", body: "" };

export function NotesBoard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [owner, setOwner] = useState(false);
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Note | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  async function load() {
    try {
      const response = await fetch("/api/project-notes", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const result = await response.json();
      setNotes(result.notes);
      setOwner(result.owner);
      setError("");
    } catch { setError("글 목록을 불러오지 못했습니다."); }
  }
  useEffect(() => { void load(); }, []);

  function openEditor(note?: Note) {
    setForm(note ? { title: note.title, category: note.category, body: note.body } : empty);
    setEditing(note ? note.id : "new");
    setSelected(null);
    setPreview(false);
    setError("");
  }
  async function save() {
    if (!form.title.trim() || !form.body.trim()) { setError("제목과 내용을 입력해 주세요."); return; }
    setBusy(true); setError("");
    try {
      const url = editing === "new" ? "/api/project-notes" : `/api/project-notes/${editing}`;
      const response = await fetch(url, { method: editing === "new" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error((await response.json()).error || "저장 실패");
      setEditing(null);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "저장 실패"); }
    finally { setBusy(false); }
  }
  async function remove(note: Note) {
    if (!window.confirm(`"${note.title}" 글을 삭제하시겠습니까?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/project-notes/${note.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setSelected(null); await load();
    } catch { setError("삭제에 실패했습니다."); }
    finally { setBusy(false); }
  }
  const filtered = notes.filter(n => (filter === "전체" || n.category === filter) && (`${n.title} ${n.body}`.toLowerCase().includes(search.toLowerCase())));
  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <section className="notes-board">
      {error && <p role="alert" className="notes-board-error">{error}</p>}
      {editing !== null ? (
        <div className="notes-board-editor">
          <div className="notes-board-toolbar"><h2>{editing === "new" ? "새 기록 작성" : "기록 수정"}</h2><button onClick={() => setEditing(null)}>취소</button></div>
          <input aria-label="제목" placeholder="제목" maxLength={160} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <select aria-label="프로젝트" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select>
          <div className="notes-board-toolbar"><span>본문 (Markdown)</span><button onClick={() => setPreview(!preview)}>{preview ? "편집하기" : "미리보기"}</button></div>
          {preview ? <div className="notes-board-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{form.body}</ReactMarkdown></div> :
            <textarea aria-label="본문" placeholder="오늘 진행한 작업을 기록하세요..." rows={16} maxLength={30000} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />}
          <button className="notes-board-primary" disabled={busy} onClick={save}>{busy ? "저장 중..." : "게시하기"}</button>
        </div>
      ) : selected ? (
        <article className="notes-board-detail">
          <button onClick={() => setSelected(null)}>← 목록으로</button>
          <p className="notes-board-meta">{new Date(selected.created_at).toLocaleDateString("ko-KR")} · {selected.category}</p>
          <h2>{selected.title}</h2>
          <div className="notes-board-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.body}</ReactMarkdown></div>
          {owner && <div className="notes-board-actions"><button onClick={() => openEditor(selected)}>수정</button><button disabled={busy} onClick={() => remove(selected)}>삭제</button></div>}
        </article>
      ) : (
        <>
          <div className="notes-board-toolbar">
            <div className="notes-board-filters">
              {["전체", ...categories].map(c => <button key={c} className={filter === c ? "active" : ""} onClick={() => { setFilter(c); setPage(0); }}>{c}</button>)}
            </div>
            {owner && <button className="notes-board-primary" onClick={() => openEditor()}>+ 새 글</button>}
          </div>
          <input aria-label="글 검색" placeholder="기록 검색..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
          <div className="notes-board-list">
            {visible.map(n => <button key={n.id} className="notes-board-item" onClick={() => setSelected(n)}>
              <span className="notes-board-meta">{new Date(n.created_at).toLocaleDateString("ko-KR")} · {n.category}</span>
              <strong>{n.title}</strong>
              <span className="notes-board-excerpt">{n.body.replace(/[#*_`>\[\]]/g, "").slice(0, 105)}</span>
              <span className="notes-board-more">자세히 보기 →</span>
            </button>)}
            {visible.length === 0 && <p className="notes-board-empty">등록된 기록이 없습니다.</p>}
          </div>
          {filtered.length > pageSize && <div className="notes-board-pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>이전</button><span>{page + 1} / {Math.ceil(filtered.length / pageSize)}</span><button disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage(page + 1)}>다음</button></div>}
        </>
      )}
    </section>
  );
}
