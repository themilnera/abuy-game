"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const footerHiddenRoutes = ["/admin", "/account", "new-day"];
  const location = usePathname();
  const isFooterHiddenRoute = footerHiddenRoutes.some((route) => location.match(route));

  if (!isFooterHiddenRoute)
    return (
      <div className="mt-10 w-full border-t border-[#7a7a7a] bg-[#bcbcbc] py-4">
        <div className="flex flex-col items-center gap-3 text-sm text-gray-600">
          <div className="flex gap-6">
            <Link href="/help/about" className="hover:text-gray-900 text-gray-700 transition-colors">
              What is this site?
            </Link>
            <Link href="/help/contact" className="hover:text-gray-900 text-gray-700 transition-colors">
              Contact
            </Link>
          </div>
          <span className="text-gray-600">© 2025</span>
        </div>
      </div>
    );
}
