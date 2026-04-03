import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.slice(1).replace(/-/g, " ");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Construction className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold capitalize">
        {pageName || "Page"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        This page is under construction
      </p>
    </div>
  );
}
