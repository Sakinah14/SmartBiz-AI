import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <div className={`flex-shrink-0 transition-all duration-300 ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}`}>
        <Sidebar />
      </div>

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen((s) => !s)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="max-w-screen-2xl mx-auto w-full space-y-8 lg:space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;