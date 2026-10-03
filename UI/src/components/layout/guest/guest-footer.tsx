import Link from "next/link"
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr"

export function GuestFooter() {
  return (
    <footer className="w-full border-t border-[#C6C6CE]/40 bg-white text-[#45464D] dark:border-border dark:bg-card dark:text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 border-b border-[#E2E7FF] pb-8 md:grid-cols-4 dark:border-border">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#545D7C]/15 text-[#545D7C] dark:bg-primary/20 dark:text-primary">
                <ShieldCheck size={20} weight="fill" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-[#131B2E] dark:text-foreground">
                ScamShield Việt Nam
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#45464D] dark:text-muted-foreground">
              Hệ thống phân tích và xác minh an toàn số cộng đồng, hỗ trợ phát
              hiện tin nhắn, cuộc gọi, tài khoản ngân hàng và liên kết lừa đảo
              ứng dụng trí tuệ nhân tạo.
            </p>
          </div>

          {/* Quick Legal & Standards Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-[#131B2E] uppercase dark:text-foreground">
              QUY CHUẨN & PHÁP LÝ
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/guest/education"
                  className="transition-colors hover:text-[#131B2E] dark:hover:text-foreground"
                >
                  Quy trình kiểm tra dữ liệu
                </Link>
              </li>
              <li>
                <Link
                  href="/guest/education"
                  className="transition-colors hover:text-[#131B2E] dark:hover:text-foreground"
                >
                  Quy tắc đạo đức cộng đồng
                </Link>
              </li>
              <li>
                <Link
                  href="/guest/education"
                  className="transition-colors hover:text-[#131B2E] dark:hover:text-foreground"
                >
                  Chính sách bảo mật dữ liệu
                </Link>
              </li>
              <li>
                <Link
                  href="/guest/education"
                  className="transition-colors hover:text-[#131B2E] dark:hover:text-foreground"
                >
                  Điều khoản dịch vụ an toàn
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Partnership */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-[#131B2E] uppercase dark:text-foreground">
              KẾT NỐI AN TOÀN
            </h3>
            <p className="text-sm text-[#45464D] dark:text-muted-foreground">
              Đồng hành cùng Trung tâm Giám sát an toàn không gian mạng quốc gia
              (NCSC) và các tổ chức tài chính.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Cơ sở dữ liệu thời gian thực
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-xs text-[#936ABB] md:flex-row dark:text-muted-foreground">
          <p>
            © 2025 ScamShield Vietnam. Hợp tác bảo vệ người dùng số và giao dịch
            ngân hàng điện tử.
          </p>
          <div className="flex items-center gap-2 text-[#545D7C] dark:text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">Phản ứng nhanh 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
