"use client"

import React, { useState } from "react"
import {
  SealCheck,
  Scales,
  Medal,
  TreeStructure,
  CheckCircle,
  DeviceMobile,
  Check,
  SlidersHorizontal,
  CaretRight
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

// --- Mock Data ---
const notifications = [
  {
    id: 1,
    title: "Báo cáo #RPT-8492 đã được phê duyệt",
    desc: "Đã thẩm định và đưa số 089.842.XXXX vào Blacklist quốc gia (+50 điểm Sentinel).",
    time: "15 phút trước",
    unread: true,
    dotColor: "bg-emerald-500",
    icon: SealCheck,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
  },
  {
    id: 2,
    title: "Hồ sơ khiếu nại #DSP-3091 đã được thụ lý",
    desc: "Ban Thẩm định đang rà soát giải tỏa hotline 091.234.8899, tạm hạ 70% mức cảnh báo.",
    time: "1 giờ trước",
    unread: true,
    dotColor: "bg-indigo-500",
    icon: Scales,
    iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
    iconColor: "text-indigo-500",
  },
  {
    id: 3,
    title: "Bạn đã đủ điều kiện nâng cấp Sentinel Lv.3",
    desc: "Đã tích lũy đủ 700/700 Điểm Sentinel. Mở rộng hạn mức tra cứu AI lên 100 lượt/ngày.",
    time: "3 giờ trước",
    unread: true,
    dotColor: "bg-amber-500",
    icon: Medal,
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    iconColor: "text-amber-500",
  },
  {
    id: 4,
    title: "Báo cáo #RPT-8411 được gộp vào hồ sơ Forex",
    desc: "Ảnh chứng từ của bạn đã liên kết vào hồ sơ FX-VIETNAM-CRIME-2025 (+25 điểm đối soát).",
    time: "Hôm qua",
    unread: false,
    icon: TreeStructure,
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-500 dark:text-slate-400",
  },
  {
    id: 5,
    title: "Đã gỡ bỏ nhãn cảnh báo tên miền shop-chinhhang.vn",
    desc: "Hồ sơ khiếu nại #DSP-2814 giải tỏa thành công sau xác thực giấy phép TMĐT.",
    time: "3 ngày trước",
    unread: false,
    icon: CheckCircle,
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
  },
  {
    id: 6,
    title: "Cập nhật cơ sở dữ liệu phòng vệ ScamShield v4.8",
    desc: "Đã tự động cập nhật 1.420 chữ ký độc hại và danh sách số điện thoại lừa đảo mới.",
    time: "5 ngày trước",
    unread: false,
    icon: DeviceMobile,
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-500 dark:text-slate-400",
  },
]

export default function UserNotificationsPage() {
  const [activeTab, setActiveTab] = useState("Tất cả (12)")
  const tabs = ["Tất cả (12)", "Báo cáo (6)", "Khiếu nại (2)", "Hệ thống (4)"]

  return (
    <div className="w-full max-w-6xl">
      {/* Title & Breadcrumb */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-4 tracking-wide">
            Cổng Người Dùng / Giám Sát & Phòng Vệ Số / <span className="text-slate-900 dark:text-white">Trung Tâm Thông Báo</span>
          </div>
          <h1 className="text-[28px] md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Thông Báo Hệ Thống
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Cập nhật kết quả phê duyệt báo cáo, tiến trình khiếu nại và cảnh báo từ hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 md:mt-6">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm">
            <Check weight="bold" size={16} /> Đã đọc tất cả
          </button>
          <button className="flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 w-9 h-9 rounded-full transition-colors shadow-sm">
            <SlidersHorizontal weight="bold" size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-full text-[11px] font-bold transition-all border shadow-sm",
              activeTab === tab
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-0.5", notif.iconBg, notif.iconColor)}>
                <notif.icon weight="fill" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn(
                    "text-[15px] leading-snug",
                    notif.unread ? "font-bold text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300"
                  )}>
                    {notif.title}
                  </h3>
                  {notif.unread && (
                    <div className={cn("w-2 h-2 rounded-full shrink-0", notif.dotColor)}></div>
                  )}
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {notif.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-16 sm:pl-0">
              <span className={cn(
                "text-xs font-bold whitespace-nowrap",
                notif.unread ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
              )}>
                {notif.time}
              </span>
              <CaretRight weight="bold" className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 transition-colors" size={16} />
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
