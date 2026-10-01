import { noteCategories } from "@/data/notes";

export function NotesPlaceholder() {
  return (
    <div className="notes-placeholder">
      <div className="tags">
        {noteCategories.map((category) => (
          <span key={category}>{category}</span>
        ))}
      </div>
      <div className="notes-empty">
        <span className="note-mark" aria-hidden="true">
          ✳
        </span>
        <div>
          <h3>Every discovery starts with a note.</h3>
          <p>
            배우고, 만들고, 발견한 것들. 첫 번째 탐험 기록을 준비하고 있습니다.
          </p>
        </div>
        <span className="coming-label">COMING SOON</span>
      </div>
    </div>
  );
}
