import Header from "@/components/Header";
import WalnutGallery from "@/components/WalnutGallery";
import { CATEGORIES, MOCK_WALNUTS } from "@/constants";

// Server Component: Fetches data and renders static content
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] font-serif text-[#2c2825] selection:bg-stone-200">
      <Header />
      <main className="pb-24">
        <WalnutGallery categories={CATEGORIES} initialWalnuts={MOCK_WALNUTS} />
      </main>
    </div>
  );
}
