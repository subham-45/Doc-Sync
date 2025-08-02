export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-10 bg-blue-50 bg-opacity-90 backdrop-blur border-t border-blue-300 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-blue-800">
        © {new Date().getFullYear()} <span className="font-semibold">Doc-Sync</span> by{" "}
        <span className="font-medium text-blue-900">Subham Pandey</span>. All rights reserved.
      </div>
    </footer>
  );
}
