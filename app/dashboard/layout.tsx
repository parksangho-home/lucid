import Link from "next/link";
import { redirect } from "next/navigation";
import { requireDashboardOwner } from "../../lib/dashboard/auth.ts";
import { DashboardError } from "../../lib/dashboard/domain.ts";
import { DashboardSession } from "../../components/dashboard/session-boundary";
import styles from "../../components/dashboard/dashboard.module.css";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({children}: {children: React.ReactNode}) {
  let owner;
  try {owner = await requireDashboardOwner();}
  catch (error) {
    if (error instanceof DashboardError && [401, 403, 404].includes(error.status)) redirect("/");
    return <section className={styles.shell}><h1>Dashboard 연결 확인</h1><p role="alert">{error instanceof DashboardError ? error.message : "연결을 확인할 수 없습니다."}</p><Link href="/">LucidSpace 홈으로</Link></section>;
  }
  return <section className={styles.shell}><DashboardSession key={owner.userId} userId={owner.userId}>
    <nav className={styles.nav} aria-label="Dashboard 메뉴"><Link href="/dashboard">저장한 학습 글</Link><Link href="/dashboard/new">새 글 작성</Link></nav>
    {children}
  </DashboardSession></section>;
}
