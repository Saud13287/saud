import WarRoomView from "@/components/dashboard/WarRoomView";

export default function WarRoomPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">غرفة الحرب</h1>
        <p className="text-sm text-[var(--color-omega-muted)]">
          اجتماع مجلس الخبراء لاتخاذ القرارات الاستثمارية
        </p>
      </div>
      <WarRoomView />
    </div>
  );
}
