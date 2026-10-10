"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  FileText,
  Clock,
  SealCheck,
  FilePlus,
  ListBullets,
  Phone,
  FilePdf,
  Info,
  CheckCircle,
  LockKey,
  DownloadSimple,
  Bank,
  WarningCircle
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export default function UserDisputesPage() {
  const [activeFilter, setActiveFilter] = useState("Tất cả (3)")
  const [activeAction, setActiveAction] = useState("progress")
  const filters = ["Tất cả (3)", "Đang thụ lý (1)", "Đã gỡ (2)"]

  return (
    <div className="w-full max-w-5xl">
      {/* Title Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md text-[11px] font-bold">
            <ShieldCheck weight="fill" /> Xác minh chính chủ
          </div>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
            • Thẩm định độc lập A05/NCSC
          </span>
        </div>
        <h1 className="text-[28px] md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
          Khiếu Nại & Gỡ Nhãn Sai
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-4xl leading-relaxed">
          Hỗ trợ xác minh chính chủ và giải tỏa các số điện thoại, tên miền hoặc số tài khoản bị gán nhãn nhầm.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              HỒ SƠ ĐÃ NỘP
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <FileText weight="fill" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">03</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">đơn</span>
          </div>
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2">
            2 đã gỡ <span className="text-slate-300 dark:text-slate-600 mx-1">•</span> 1 đang xử lý
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              THỜI GIAN TRUNG BÌNH
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Clock weight="fill" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">18.4</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">giờ</span>
          </div>
          <p className="text-[11px] font-bold text-emerald-500 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <Info weight="fill" /> Cam kết ≤ 48 giờ
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              TỶ LỆ KHÔI PHỤC
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
              <SealCheck weight="fill" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">100%</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">TRUSTSEAL</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2">
            Gỡ hoàn toàn blacklist
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
        <button
          onClick={() => setActiveAction("submit")}
          className={cn(
            "w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm",
            activeAction === "submit"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
          )}
        >
          <FilePlus weight="bold" className={activeAction === "submit" ? "" : "text-slate-500"} /> Nộp Đơn Khiếu Nại & Phản Chứng
        </button>
        <button
          onClick={() => setActiveAction("progress")}
          className={cn(
            "w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm",
            activeAction === "progress"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
          )}
        >
          <ListBullets weight="bold" className={activeAction === "progress" ? "" : "text-slate-500"} /> Tiến Trình Xử Lý Đơn Của Tôi
        </button>
      </div>

      {activeAction === "progress" ? (
        <>

          {/* List Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Nhật Ký & Tiến Trình Thẩm Định Hồ Sơ
              </h2>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                3 Hồ sơ
              </span>
            </div>
            <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
                    activeFilter === filter
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-4">

            {/* Item 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-5 md:p-6 pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">#DSP-3091</span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mx-1">• Nộp lúc 08:30 hôm nay</span>
                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Độ ưu tiên cao (Doanh nghiệp)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> ĐANG THỤ LÝ ĐỐI SOÁT
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Phone weight="fill" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">CHỈ SỐ PHÚC KHẢO</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">091.234.8899 <span className="font-medium text-slate-500 text-xs ml-1">(Hotline Doanh Nghiệp)</span></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <FileText weight="fill" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">TÀI LIỆU ĐÍNH KÈM</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">2 tệp <span className="font-medium text-slate-500 text-xs ml-1">(GPKD Tân Phát...)</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg p-4 flex gap-3 mb-6">
                  <Info weight="fill" className="text-orange-500 shrink-0 text-lg mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Tiến trình thẩm định của Hội đồng:</h4>
                    <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      Hội đồng 3 thành viên đang xác thực con dấu số với Cơ quan ĐKKD Hà Nội. Hệ thống đã tạm hạ 70% trọng số cảnh báo khi người dùng khác nhận cuộc gọi từ số này.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Clock weight="bold" /> Ước tính có kết quả trước 17:00 ngày mai
                </div>
                <div className="flex gap-2">
                  <button className="bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors">
                    Xem chi tiết log
                  </button>
                  <button className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors">
                    Bổ sung chứng cứ
                  </button>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-5 md:p-6 pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">#DSP-2814</span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mx-1">• Hoàn tất ngày 15/10/2024</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full">
                    <CheckCircle weight="fill" className="text-sm" /> ĐÃ GỠ BLACKLIST QUỐC GIA
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <LockKey weight="fill" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">CHỈ SỐ PHÚC KHẢO</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">techcorp-vietnam.vn</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <SealCheck weight="fill" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">BIÊN BẢN GIẢI TỎA</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Quyết định số #QĐ1029</div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-4 flex gap-3 mb-6">
                  <CheckCircle weight="fill" className="text-emerald-500 shrink-0 text-lg mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Kết luận thẩm định:</h4>
                    <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      Xác nhận tên miền bị đối tượng giấu mặt Ddos và tạo subdomain mạo danh. Đã gỡ bỏ toàn bộ cảnh báo trên trình duyệt & nhà mạng VNPT/Viettel/FPT.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <LockKey weight="bold" /> Được bảo vệ bởi SCS TrustSeal (Có hiệu lực đến 10/2025)
                </div>
                <div className="flex gap-2">
                  <button className="bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5">
                    <DownloadSimple weight="bold" /> Tải biên bản giải tỏa (.PDF)
                  </button>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-5 md:p-6 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">#DSP-2105</span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mx-1">• Nộp lúc 02/09/2024</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                    <WarningCircle weight="bold" className="text-sm" /> CẦN BỔ SUNG MINH CHỨNG
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Bank weight="fill" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">CHỈ SỐ KHIẾU NẠI</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">STK Techcombank 1902.9999.xxxx</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
                      <WarningCircle weight="fill" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">YÊU CẦU TỪ KIỂM DUYỆT</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Bổ sung sao kê giao dịch</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  Thời hạn bổ sung còn: <span className="text-red-500">02 ngày</span>
                </div>
                <div className="flex gap-2">
                  <button className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 shadow-sm">
                    <FilePlus weight="bold" /> Cập nhật chứng cứ ngay
                  </button>
                </div>
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-10 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px] text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-6">
            <FilePlus weight="fill" className="text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Form nộp đơn khiếu nại đang được cập nhật</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Tính năng nộp đơn khiếu nại & phản chứng trực tuyến sẽ được phát triển sau.
          </p>
        </div>
      )}
    </div>
  )
}
