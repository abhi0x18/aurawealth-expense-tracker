import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mb-6">
        The page or financial record you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/">
        <Button variant="primary" size="md">
          <Home className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
