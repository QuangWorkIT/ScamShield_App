"use client"

import React, { useState } from "react"
import {
  Bank,
  ShieldWarning,
  Briefcase,
  AirplaneTilt,
  SquaresFour,
  Warning,
  VideoCamera,
  ShoppingCart,
  WarningCircle,
  Eye,
  Target,
  ShieldCheck,
  ChatCircleText,
  PhoneCall,
  MagnifyingGlass
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// --- Mock Data ---

const filters = [
  { id: "all", label: "Tất cả", icon: SquaresFour },
  { id: "bank", label: "Ngân hàng & OTP", icon: Bank },
  { id: "police", label: "Giả danh Công an", icon: ShieldWarning },
  { id: "job", label: "Việc làm Online", icon: Briefcase },
  { id: "travel", label: "Vé máy bay & Du lịch", icon: AirplaneTilt },
]

const scenarios = [
  {
    id: 1,
    tag: "GIẢ MẠO BRANDNAME",
    tagColor: "text-red-500",
    tagBg: "bg-red-50",
    cardBg: "bg-red-50/40 dark:bg-red-900/10 border-red-100 dark:border-red-900/30",
    severity: "Cực đại",
    severityStyle: "bg-red-50 text-red-600 border border-red-100",
    title: "SMS Brandname trạm phát BTS",
    desc: "Phát sóng giả mạo chứa tin nhắn lừa đảo vào luồng tin cậy ngân hàng.",
    tagIcon: Warning,
    mockType: "sms",
    mockHeader: "VCB Digibank",
    mockTime: "14:32",
    mockContent: <>"Tai khoan bi khoa sau 30 phut. Xac minh ngay tai: <span className="text-red-500 underline decoration-red-300 underline-offset-2">portal-vcb-digibanks[.]vn</span> de huy."</>,
    insights: [
      { label: "NHẬN DIỆN", text: "Tên miền giả kèm áp lực thời gian.", icon: Eye, color: "text-red-500" },
      { label: "MỤC TIÊU", text: "Chiếm đoạt mật khẩu và mã OTP.", icon: Target, color: "text-orange-500" },
      { label: "HÀNH ĐỘNG", text: "Không bấm link. Mở thẳng App gốc.", icon: ShieldCheck, color: "text-blue-500" },
    ]
  },
  {
    id: 2,
    tag: "DEEPFAKE - GIẢ DANH CƠ QUAN",
    tagColor: "text-red-500",
    tagBg: "bg-red-50",
    cardBg: "bg-red-50/40 dark:bg-red-900/10 border-red-100 dark:border-red-900/30",
    severity: "Nguy cấp",
    severityStyle: "bg-red-50 text-red-600 border border-red-100",
    title: "Video Zalo giả Cảnh sát điều tra",
    desc: "Dùng Deepfake khuôn mặt cán bộ trong phòng hỏi cung để dọa chuyển tiền.",
    tagIcon: VideoCamera,
    mockType: "video",
    mockHeader: "Zalo Video: CQ Điều tra",
    mockTime: "00:43",
    mockContent: `"Chị liên quan đường dây rửa tiền. Khóa cửa phòng, chuyển số dư vào tài khoản thanh tra ngay."`,
    insights: [
      { label: "NHẬN DIỆN", text: "Mặt mờ giật, ép bảo mật tuyệt đối.", icon: Eye, color: "text-red-500" },
      { label: "MỤC TIÊU", text: "Thao túng nỗi sợ để tự chuyển tiền.", icon: Target, color: "text-orange-500" },
      { label: "HÀNH ĐỘNG", text: "Cúp máy. Công an không làm việc qua mạng.", icon: ShieldCheck, color: "text-blue-500" },
    ]
  },
  {
    id: 3,
    tag: "CỘNG TÁC VIÊN ẢO",
    tagColor: "text-indigo-500",
    tagBg: "bg-indigo-50",
    cardBg: "bg-indigo-50/40 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30",
    severity: "Phổ biến",
    severityStyle: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    title: "Tuyển CTV đơn hàng hoa hồng 10-20%",
    desc: "Nạp tiền chốt đơn nhận lãi nhỏ ban đầu trước khi giữ khoản tiền lớn.",
    tagIcon: ShoppingCart,
    mockType: "chat",
    mockHeader: "Telegram CSKH",
    mockTime: "10:15",
    mockContent: `"Nhiệm vụ cuối: Nạp 15.000.000đ để nhận về 19.500.000đ. Ưu đãi giữ trong 10 phút!"`,
    insights: [
      { label: "NHẬN DIỆN", text: "Hoa hồng bất thường, nhóm kín Telegram.", icon: Eye, color: "text-indigo-500" },
      { label: "MỤC TIÊU", text: "Chiếm đoạt toàn bộ tiền nạp tích lũy.", icon: Target, color: "text-orange-500" },
      { label: "HÀNH ĐỘNG", text: "Chặn liên lạc. Sàn TMĐT không tuyển nạp tiền.", icon: ShieldCheck, color: "text-blue-500" },
    ]
  },
  {
    id: 4,
    tag: "VÉ MÁY BAY & DU LỊCH",
    tagColor: "text-blue-500",
    tagBg: "bg-blue-50",
    cardBg: "bg-blue-50/40 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30",
    severity: "Tăng vọt",
    severityStyle: "bg-blue-50 text-blue-600 border border-blue-100",
    title: "Cuộc gọi hoàn vé & hủy chuyến khẩn",
    desc: "Gọi thông báo hủy chuyến bay rồi gửi link nhận bồi thường chứa mã độc.",
    tagIcon: AirplaneTilt,
    mockType: "call",
    mockHeader: "Tổng đài Hãng không",
    mockTime: "16:45",
    mockContent: `"Chuyến bay bị hoãn, nhấn đền bù 800.000đ qua link xác thực gửi kèm Zalo."`,
    insights: [
      { label: "NHẬN DIỆN", text: "Yêu cầu cài App lạ hoặc truy cập link lạ.", icon: Eye, color: "text-blue-500" },
      { label: "MỤC TIÊU", text: "Đánh cắp OTP hoặc chiếm quyền điện thoại.", icon: Target, color: "text-orange-500" },
      { label: "HÀNH ĐỘNG", text: "Chỉ tra cứu qua ứng dụng chính hãng.", icon: ShieldCheck, color: "text-blue-500" },
    ]
  },
]

export default function GuestEducationHubPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen pb-20 bg-slate-50/50 dark:bg-transparent">
      <HeroSection />
      <LibrarySection />
    </div>
  )
}

function HeroSection() {
  const [activeFilter, setActiveFilter] = useState("all")

  return (
    <section className="w-full max-w-7xl mx-auto px-4 pt-12 pb-8">
      <div className="w-full rounded-lg p-8 md:p-12 relative overflow-hidden bg-[#0F172A] shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Học Viện Phòng Chống<br />Lừa Đảo
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-medium mb-10 max-w-lg leading-relaxed">
            Nhận diện thủ đoạn công nghệ cao và bảo vệ gia đình trên không gian mạng.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 border",
                  activeFilter === filter.id
                    ? "bg-white text-slate-900 border-white shadow-md"
                    : "bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white backdrop-blur-sm"
                )}
              >
                <filter.icon weight={activeFilter === filter.id ? "fill" : "bold"} size={16} />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LibrarySection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 mb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Thư viện giải phẫu thủ đoạn
          </h2>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Hiển thị 4 ca thực địa mới nhất
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-xl transition-shadow flex flex-col h-full group overflow-hidden">

            {/* Header */}
            <div className={cn("flex items-center justify-between px-7 py-5 md:px-8 md:py-5 border-b border-black/5 dark:border-white/5", scenario.tagBg)}>
              <div className="flex items-center gap-2">
                <scenario.tagIcon weight="fill" className={cn("text-lg", scenario.tagColor)} />
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", scenario.tagColor)}>
                  {scenario.tag}
                </span>
              </div>
              <span className={cn("text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap bg-white dark:bg-slate-900 shadow-sm", scenario.tagColor)}>
                {scenario.severity}
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-7 md:p-8 pt-6">
              {/* Title & Desc */}
              <h3 className="text-[19px] font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {scenario.title}
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                {scenario.desc}
              </p>

              {/* Mock Chat Block */}
              <div className="bg-indigo-50/80 dark:bg-indigo-800/50 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-700/50 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {scenario.mockType === "sms" && <ChatCircleText weight="fill" className="text-slate-400" />}
                    {scenario.mockType === "video" && <VideoCamera weight="fill" className="text-slate-400" />}
                    {scenario.mockType === "chat" && <ChatCircleText weight="fill" className="text-slate-400" />}
                    {scenario.mockType === "call" && <PhoneCall weight="fill" className="text-slate-400" />}
                    {scenario.mockHeader}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{scenario.mockTime}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-3.5 rounded-xl text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium shadow-sm">
                  {scenario.mockContent}
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-auto">
                {scenario.insights.map((insight, idx) => (
                  <div key={idx} className="bg-indigo-50 dark:bg-indigo-800/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-700/50 flex flex-col">
                    <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-2", insight.color)}>
                      <insight.icon weight="bold" className="text-sm" />
                      {insight.label}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {insight.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  )
}

