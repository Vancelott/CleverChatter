import { Toaster } from "react-hot-toast";

export default async function SlugLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams: {
    slug: string;
  };
}) {
  const slug = searchParams?.slug;

  return (
    <div className="h-max w-full px-4 md:px-24 py-12 bg-blue-00">
      {children}
    </div>
  );
}
