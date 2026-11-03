
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f7f7f3]">
      <Sidebar />
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
