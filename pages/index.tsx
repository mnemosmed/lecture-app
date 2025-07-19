import Link from "next/link";
import { categories, lectures } from "../data/videos";
import Image from "next/image";

export default function Home() {
  // Helper to check if a category has lectures
  const hasContent = (categoryId: string) =>
    lectures.some((l) => l.categoryId === categoryId);

  // Sort categories: those with content first
  const sortedCategories = [...categories].sort((a, b) => {
    const aHas = hasContent(a.id);
    const bHas = hasContent(b.id);
    if (aHas === bHas) return 0;
    return aHas ? -1 : 1;
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: "#fcfeff" }}
    >
      <img
        src="/MNEMOS_logo.png"
        alt="MNEMOS Logo"
        className="mb-6 w-32 h-32 object-contain mx-auto"
        style={{ maxWidth: "140px", maxHeight: "140px" }}
      />
      <h1 className="text-3xl font-bold mb-2" style={{ color: "#0da6b8" }}>
        Category
      </h1>
      <p className="mb-8" style={{ color: "#555" }}>
        Start by Selecting a Category
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-5xl">
        {sortedCategories.map((cat) => {
          const content = hasContent(cat.id);
          // Map category id to SVG icon filename
          const iconMap: Record<string, string> = {
            neurology: "neurology.svg",
            psychiatry: "psychiatry.svg",
            nephrology: "nephrology.svg",
            endocrinology: "endocrine.svg",
            obgyn: "obstetrics-gynecology.svg",
            pediatrics: "pediatrics.svg",
            surgery: "surgery.svg",
            pulmonology: "pulmonology.svg",
            musculoskeletal: "musculoskeletal.svg",
            dermatology: "dermatology.svg",
            basic: "basic-sciences.svg",
            gastroenterology: "gastrointestinal.svg",
            hematology: "hematology.svg",
            infectious: "infectious.svg",
            community: "community-medicine.svg",
            cardiology: "cardiology.svg",
          };
          const iconSrc = iconMap[cat.id] ? `/${iconMap[cat.id]}` : undefined;
          return content ? (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group rounded-xl shadow transition p-6 flex flex-col items-center justify-center border cursor-pointer"
              style={{
                borderColor: "#0da6b8",
                color: "#0da6b8",
                background: "#fff",
              }}
            >
              {iconSrc && (
                <img
                  src={iconSrc}
                  alt={`${cat.name} icon`}
                  className="mb-3 w-12 h-12 object-contain"
                  style={{ maxWidth: "48px", maxHeight: "48px" }}
                />
              )}
              <span
                className="text-lg font-semibold group-hover:text-[#0da6b8]"
                style={{ color: "#0da6b8" }}
              >
                {cat.name}
              </span>
              <style jsx>{`
                .group:hover {
                  background: #e6f9fb !important;
                  border-color: #0da6b8 !important;
                }
              `}</style>
            </Link>
          ) : (
            <div
              key={cat.id}
              className="rounded-xl shadow p-6 flex flex-col items-center justify-center border select-none"
              style={{
                background: "#f2f2f2",
                color: "#aaa",
                borderColor: "#f2f2f2",
                opacity: 1,
              }}
            >
              {iconSrc && (
                <img
                  src={iconSrc}
                  alt={`${cat.name} icon`}
                  className="mb-3 w-12 h-12 object-contain opacity-60"
                  style={{ maxWidth: "48px", maxHeight: "48px" }}
                />
              )}
              <span className="text-lg font-semibold" style={{ color: "#aaa" }}>
                {cat.name}
              </span>
              <span className="text-xs mt-2" style={{ color: "#aaa" }}>
                Coming soon...
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
