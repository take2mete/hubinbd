import SiteHeader from "@/components/site-header";
import SevenBanners from "@/components/SevenBanners";
import SiteFooter from "@/components/site-footer";
import MarketplaceProducts from "@/components/marketplace-products";

export default function HomePage() {
  return <>
    <SiteHeader />
    <main className="min-h-screen bg-[#f4f6fa] text-[#172033]">
      <div className="mx-auto max-w-[1320px] px-3 sm:px-5">
        <SevenBanners />
        <section className="pb-12 pt-8">
          <MarketplaceProducts mode="home" />
        </section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
