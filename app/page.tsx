import SiteHeader from "@/components/site-header";
import SevenBanners from "@/components/SevenBanners";
import SiteFooter from "@/components/site-footer";
import MarketplaceProducts from "@/components/marketplace-products";
import { getHomeProducts } from "@/lib/home-products";

export default async function HomePage() {
  const initialProducts = await getHomeProducts();
  return <>
    <SiteHeader />
    <main className="min-h-screen bg-[#f4f6fa] text-[#172033]">
      <div className="mx-auto max-w-[1320px] px-3 sm:px-5">
        <SevenBanners />
        <h1 className="sr-only">
          বাংলাদেশের অনলাইন শপিং ও ডিজিটাল সার্ভিস প্ল্যাটফর্ম
        </h1>
        <section className="pb-12 pt-0">
          <MarketplaceProducts mode="home" initialProducts={initialProducts.length ? initialProducts : undefined} />
        </section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
