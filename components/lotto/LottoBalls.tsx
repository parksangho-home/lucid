import { getLottoBallRange } from "@/lib/lotto/ball-range";

export function LottoBalls({ numbers }: { numbers: number[] }) {
  return (
    <div
      className="lotto-balls"
      role="img"
      aria-label={
        numbers.length ? `로또 번호: ${numbers.join(", ")}` : "번호 표시 대기"
      }
    >
      {(numbers.length ? numbers : Array(6).fill(null)).map(
        (number: number | null, index) => (
          <span
            aria-hidden="true"
            className={`lotto-ball ${number ? `ball-${getLottoBallRange(number)}` : "ball-empty"}`}
            key={index}
          >
            {number ?? "·"}
          </span>
        ),
      )}
    </div>
  );
}
