import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";
import { LottoDashboard } from "@/components/lotto/LottoDashboard";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getDashboard } from "@/lib/lotto/storage-supabase";

export const metadata = { title: "LOTTO LAB" };
export const dynamic = "force-dynamic";

export default async function LottoPage() {
  const authReady = isSupabaseConfigured();
  const dataReady = isSupabaseConfigured();
  let userName: string | undefined;
  let userId: string | undefined;
  let data: Awaited<ReturnType<typeof getDashboard>> = {
    current: null,
    previous: null,
    predictions: [],
  };
  let dataError = false;
  try {
    if (authReady) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      userName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email ||
        undefined;
    }
    if (dataReady) data = await getDashboard(userId);
  } catch (error) {
    console.error("Failed to load LOTTO LAB", error);
    dataError = true;
  }

  return (
    <div className="container inner-page">
      <Link href="/projects" className="text-link">
        ← ALL PROJECTS
      </Link>
      <PageIntro
        label="PLANET 01 / PROBABILITY · DATA"
        title="LOTTO LAB"
        description="5개의 전략으로 매주 5게임을 실험하고, 실제 당첨 결과와 비교해 기록합니다."
      />
      <LottoDashboard
        {...data}
        userName={userName}
        authReady={authReady}
        dataReady={dataReady}
        dataError={dataError}
      />
    </div>
  );
}
