import Link from "next/link";

export default function Footer() {
  return (
    <div className="mt-10 w-full border-t border-[#7a7a7a] bg-[#bcbcbc] py-4">
      <div className="flex flex-col items-center gap-3 text-sm text-gray-600">
        <div className="flex gap-6">
          <Link
            href="/help/about"
            className="hover:text-gray-900 text-gray-700 transition-colors"
          >
            What is this site?
          </Link>
          <Link
            href="/help/contact"
            className="hover:text-gray-900 text-gray-700 transition-colors"
          >
            Contact
          </Link>
        </div>
        <span className="text-gray-600">© 2025</span>
      </div>
    </div>
  );
}
