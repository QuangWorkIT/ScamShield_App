import {
  ShieldCheck,
  ShieldWarning,
  Lightbulb,
  ArrowRight,
} from "@phosphor-icons/react"
import { CheckScanResponse } from "@/features/check/types/check.types"

interface ScamEvidenceCardProps {
  data: CheckScanResponse
}

export function ScamEvidenceCard({ data }: ScamEvidenceCardProps) {
  const basis = data.legal_basis

  return (
    <div className="space-y-6 rounded-2xl border border-[#C6C6CE]/40 bg-white p-6 shadow-xs dark:border-border dark:bg-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C6C6CE]/30 pb-4 dark:border-border">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={22} weight="fill" className="text-[#10B981]" />
          <h3 className="font-heading text-sm font-bold text-[#131B2E] dark:text-foreground">
            Căn Cứ & Bằng Chứng Pháp Lý Xác Thực
          </h3>
        </div>
        <div className="rounded-lg bg-[#FAF8FF] px-2.5 py-1 font-mono text-[11px] font-bold text-[#45464D] dark:bg-muted dark:text-muted-foreground">
          Mã lý do: {basis?.case_code || "VN-A05-THREAT-IMP-GOV-092"}
        </div>
      </div>

      {/* Point 1: A05 / NCSC matching */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#BA1A1A] dark:text-rose-400">
          <ShieldWarning size={16} weight="fill" />
          <span>
            {basis?.title || "Khớp 100% với hồ sơ cảnh báo liên ngành"}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-[#45464D] dark:text-muted-foreground">
          {basis?.description ||
            "Khớp 100% với phương thức thủ đoạn được Cục An ninh mạng & Phòng chống tội phạm công nghệ cao (A05) và Cổng NCSC phát lệnh cảnh báo khẩn cấp số 24/TB-A05."}
        </p>
        {basis?.press_release_link && (
          <a
            href={basis.press_release_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-[#008CC7] hover:underline dark:text-primary"
          >
            <span>
              Xem thông cáo báo chí chính thức trên Cổng thông tin Bộ Công An
            </span>
            <ArrowRight size={13} weight="bold" />
          </a>
        )}
      </div>

      {/* Point 2: ScamShield AI Opinion */}
      <div className="space-y-1.5 rounded-xl bg-[#FAF8FF] p-4 dark:bg-muted/30">
        <div className="flex items-center gap-2 text-xs font-bold text-[#131B2E] dark:text-foreground">
          <Lightbulb size={16} weight="fill" className="text-[#F59E0B]" />
          <span>Nhận định chuyên gia ScamShield AI:</span>
        </div>
        <p className="text-xs leading-relaxed text-[#45464D] dark:text-muted-foreground">
          {basis?.ai_opinion ||
            "Cơ quan điều tra tuyệt đối KHÔNG bao giờ làm việc qua Zalo/điện thoại, KHÔNG yêu cầu công dân chuyển tiền đến 'tài khoản an toàn' hoặc tải ứng dụng thông qua đường dẫn file lạ bên ngoài Google Play và App Store."}
        </p>
      </div>

      {/* Recommendations 1, 2, 3 */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#131B2E] dark:text-foreground">
          Khuyến nghị hành động tức thời bảo vệ an toàn:
        </h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {data.recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-[#C6C6CE]/30 bg-[#FAF8FF]/60 p-3.5 dark:border-border dark:bg-muted/20"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white font-heading text-xs font-bold text-[#BA1A1A] shadow-2xs dark:bg-card dark:text-rose-400">
                {index + 1}
              </div>
              <p className="text-[11px] leading-relaxed text-[#45464D] dark:text-muted-foreground">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
