import { Storefront } from "@/components/Storefront";
import { getProducts } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  const configured = isSupabaseConfigured();

  return (
    <section>
      <div className="mb-4 rounded-3xl bg-gradient-to-l from-squishy-pink-soft via-white to-squishy-blue-soft px-4 py-3 text-center shadow-sm">
        <p className="text-sm font-bold leading-6">
          בחרו סקווישי, הוסיפו לסל, ושלחו הזמנה לליהי בווצאפ
        </p>
      </div>
      <Storefront products={products} configured={configured} />
    </section>
  );
}
