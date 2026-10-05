"use client"

import React, { useState } from "react"
import {
  FileText,
  Warning,
  Globe,
  ShieldCheck,
  MapPin,
  SlidersHorizontal,
  Bank,
  ShieldWarning,
  Briefcase,
  DeviceMobile,
  ChartLineUp,
  Target,
  CaretDown,
  TreeStructure,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// --- Mock Data ---

const stats = [
  {
    title: "TỔNG SỐ LƯỢT BÁO CÁO",
    value: "28.490",
    change: "+12.4%",
    changeColor: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 rounded font-bold",
    sub1: "Chu kỳ 30 ngày",
    sub2: "100% Ẩn danh",
    icon: FileText,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    title: "ĐÃ XÁC THỰC NGUY CƠ CAO",
    value: "19.832",
    change: "69.6% tổng số",
    changeColor: "text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 rounded font-bold",
    sub1: "Thêm vào blacklist",
    sub2: "4.890 STK & URL",
    sub2Color: "text-red-600 font-semibold",
    icon: Warning,
    iconColor: "text-red-500",
    iconBg: "bg-red-50 dark:bg-red-500/10",
  },
  {
    title: "PHẠM VI PHỦ SÓNG",
    value: "34 / 34",
    change: "100% Tỉnh thành",
    changeColor: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 rounded font-bold",
    sub1: "Điểm nóng chính",
    sub2: "HN & TP.HCM (67.6%)",
    sub2Color: "font-semibold text-slate-800 dark:text-slate-200",
    icon: Globe,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "SỐ LOẠI LỪA ĐẢO NGĂN CHẶN",
    value: "5",
    change: "Danh mục trọng yếu",
    changeColor: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 rounded font-bold",
    sub1: "Qua tra cứu tức thì",
    sub2: "SMS OTP, Số điện thoại, ...",
    sub2Color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    icon: ShieldCheck,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
]

const regions = [
  { id: "01", name: "TP. Hồ Chí Minh", reports: "7.420", type: "Lừa đảo tuyển dụng", risk: "Rất cao", riskStyle: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", trend: "+14.2%", trendColor: "text-red-600 dark:text-red-400" },
  { id: "02", name: "Hà Nội", reports: "6.150", type: "Lừa đảo mã OTP", risk: "Báo động", riskStyle: "border border-red-500 text-red-600 dark:border-red-400 dark:text-red-400", trend: "+11.5%", trendColor: "text-red-600 dark:text-red-400" },
  { id: "03", name: "Bình Dương", reports: "2.210", type: "Mạo danh ngân hàng", risk: "Cảnh báo", riskStyle: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", trend: "+8.4%", trendColor: "text-orange-600 dark:text-orange-400" },
  { id: "04", name: "Đà Nẵng", reports: "1.840", type: "Deepfake video & MXH", risk: "Cảnh báo", riskStyle: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", trend: "+4.1%", trendColor: "text-orange-600 dark:text-orange-400" },
  { id: "05", name: "Đồng Nai", reports: "1.650", type: "Sàn đầu tư tài chính Ảo", risk: "Cảnh báo", riskStyle: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", trend: "+0.7%", trendColor: "text-orange-600 dark:text-orange-400" },
  { id: "06", name: "Hải Phòng", reports: "1.430", type: "Mạo danh Ngân hàng SMS", risk: "Trung bình", riskStyle: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", trend: "-1.2%", trendColor: "text-emerald-500" },
  { id: "07", name: "Cần Thơ", reports: "1.150", type: "Giao hàng Shipper COD giả", risk: "Trung bình", riskStyle: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", trend: "+0.8%", trendColor: "text-emerald-500" },
  { id: "08", name: "Bắc Ninh", reports: "970", type: "Cộng tác viên tuyển dụng KCN", risk: "Trung bình", riskStyle: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", trend: "+5.0%", trendColor: "text-orange-500 dark:text-orange-400" },
]

const topThreats = [
  { icon: Bank, title: "Mạo Danh Ngân Hàng", level: "CỰC KỲ NGUY HIỂM", levelColor: "bg-red-600 text-white", desc: "Tin nhắn SMS Brandname mạo danh ngân hàng, gửi link giả mạo cập nhật sinh trắc học hoặc thông báo biến động số dư để đánh cắp tài khoản.", pct: "34.0%", reports: "9.689 báo cáo", trend: "+10.4% tuần này", trendColor: "text-red-600 dark:text-red-400" },
  { icon: ShieldWarning, title: "Mạo Danh Cảnh Sát & Cơ Quan Chức Năng", level: "NGHIÊM TRỌNG", levelColor: "bg-red-600 text-white", desc: "Gọi điện đe dọa lệnh bắt tạm giam, rửa tiền, phạt nguội giao thông; ép nạn nhân cài đặt ứng dụng Dịch vụ công giả mạo (file .apk) để chiếm quyền thiết bị.", pct: "26.0%", reports: "7.410 báo cáo", trend: "+11.5% tuần này", trendColor: "text-red-600 dark:text-red-400" },
  { icon: Briefcase, title: 'Tuyển Dụng "Việc Nhẹ Lương Cao"', level: "RẤT PHỔ BIẾN", levelColor: "bg-orange-500 text-white", desc: "Dụ dỗ làm cộng tác viên online xem video, chốt đơn sàn TMĐT nhận hoa hồng cao; sau khi nạp tiền làm nhiệm vụ lớn thì chiếm đoạt toàn bộ tiền cọc.", pct: "20.0%", reports: "5.700 báo cáo", trend: "+8.5% tuần này", trendColor: "text-orange-500 dark:text-orange-400" },
  { icon: DeviceMobile, title: "Lừa Đảo Lấy Mã OTP", level: "CẢNH BÁO CAO", levelColor: "bg-amber-500 text-white", desc: "Giả danh nhân viên nhà mạng yêu cầu nâng cấp SIM 4G/5G, đổi mã trúng thưởng hoặc link dịch vụ tự động trừ tiền để đánh cắp mã xác thực OTP/Smart OTP.", pct: "12.0%", reports: "3.420 báo cáo", trend: "+3.2% tuần này", trendColor: "text-amber-500 dark:text-amber-400" },
  { icon: ChartLineUp, title: "Nền Tảng Đầu Tư Giả Mạo", level: "THIỆT HẠI TÀI SẢN LỚN", levelColor: "bg-indigo-500 text-white", desc: "Mời gọi tham gia các sàn giao dịch ngoại hối, tiền mã hóa, chứng khoán quốc tế ảo hứa hẹn lãi suất phi thực tế; thao túng sàn lệnh và chặn rút tiền.", pct: "8.0%", reports: "2.280 báo cáo", trend: "-1.4% tuần này", trendColor: "text-emerald-500 dark:text-emerald-400" },
]


export default function GuestDashboardPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen pb-20">
      <DashboardHeader />
      <StatsGrid />
      <RegionalAnalysis />
      <TopThreats />
    </div>
  )
}

function DashboardHeader() {
  const [activeRange, setActiveRange] = useState("30 ngày qua")
  const ranges = ["Hôm nay", "7 ngày qua", "30 ngày qua", "Quý 1/2023", "Năm 2023"]

  return (
    <section className="w-full max-w-7xl mx-auto px-4 pt-12 pb-8">
      <div className="flex flex-col items-start gap-4 mb-8">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <h1 className="text-3xl md:text-[34px] font-bold tracking-tight">
            Dashboard tổng hợp lừa đảo trực tuyến Việt Nam
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Dữ liệu tổng hợp công khai theo thời gian thực từ báo cáo cộng đồng.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-1 w-full md:w-auto">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                activeRange === range
                  ? "bg-[#0F172A] dark:bg-slate-700 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              )}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs font-bold h-10 px-4 hover:bg-slate-50">
            <Globe weight="bold" size={16} /> Toàn quốc (63 Tỉnh/Thành) <CaretDown weight="bold" />
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none gap-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs font-bold h-10 px-4 hover:bg-slate-50">
            <SlidersHorizontal weight="bold" size={16} /> Bộ lọc mở rộng
          </Button>
        </div>
      </div>
    </section>
  )
}

function StatsGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4.5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-6 md:p-7 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed max-w-[180px]">{stat.title}</span>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/50", stat.iconBg)}>
                <stat.icon weight="fill" className={cn("text-xl", stat.iconColor)} />
              </div>
            </div>
            <div className="flex items-baseline gap-3 mb-8 mt-2">
              <span className="text-3xl md:text-[34px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">{stat.value}</span>
              <span className={cn("text-[11px] font-bold", stat.changeColor)}>{stat.change}</span>
            </div>
            <div className="flex justify-between items-end border-t border-slate-50 dark:border-slate-800/50 pt-5 mt-auto">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{stat.sub1}</div>
              <div className={cn("text-[11px] font-bold text-right", stat.sub2Color || "text-slate-900 dark:text-slate-300")}>{stat.sub2}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RegionalAnalysis() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col - Phân bố */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">Phân Bố Mối Đe Dọa</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mật độ cảnh báo ghi nhận</p>
          </div>

          <div className="space-y-7 mb-10 flex-1">
            {/* Item 1 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Miền Nam (Đông & Tây Nam Bộ)</span>
                </div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">12.705 reports (44.6%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-red-500 w-[44.6%] rounded-full"></div>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Rủi ro: Rất cao (Tập trung TP.HCM, Bình Dương)</span>
                <span className="text-slate-400 font-bold">+15.1% so với tháng trước</span>
              </div>
            </div>

            {/* Item 2 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Miền Bắc (Đồng bằng & Trung du)</span>
                </div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">10.882 reports (38.2%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-orange-500 w-[38.2%] rounded-full"></div>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Rủi ro: Báo động (Tập trung Hà Nội, Hải Phòng)</span>
                <span className="text-slate-400 font-bold">+8.6% so với tháng trước</span>
              </div>
            </div>

            {/* Item 3 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Miền Trung & Tây Nguyên</span>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">4.901 reports (17.2%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-500 w-[17.2%] rounded-full"></div>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Rủi ro: Đang tăng (Đà Nẵng, Khánh Hòa, Đắk Lắk)</span>
                <span className="text-slate-400 font-bold">+6.2% so với tháng trước</span>
              </div>
            </div>
          </div>

          {/* Map Mock Image */}
          <div className="w-full h-[200px] rounded-2xl relative overflow-hidden bg-emerald-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700/50">
            {/* Generic Map placeholder background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-blue-100/50 dark:from-emerald-900/20 dark:to-blue-900/20"></div>

            {/* Minimal generic map viz */}
            <div className="relative w-full h-full">
              {/* Vietnam approx shape dots */}
              <div className="absolute top-[20%] left-[30%] w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>
              <div className="absolute top-[50%] right-[35%] w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
              <div className="absolute bottom-[20%] left-[35%] w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>

              {/* Lines connecting */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none">
                <path d="M30% 20% L35% 80% L65% 50% Z" fill="none" stroke="url(#grad)" strokeWidth="1" strokeDasharray="4 2" />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Overlay Box */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0F172A] to-transparent rounded-b-2xl pt-10">
                <div className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-1">TRỌNG ĐIỂM HOẠT ĐỘNG</div>
                <div className="text-[15px] text-white font-bold flex items-center justify-between">
                  Tam giác HN - TP.HCM - DN
                  <div className="flex items-center gap-1.5 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> Giám sát 24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">Thống Kê Chi Tiết Theo Địa Bàn</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tỉnh & Thành phố ghi nhận số lượng báo cáo</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">TỈNH / THÀNH PHỐ</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right pr-6">LƯỢT REPORT</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap min-w-[150px]">LOẠI LỪA ĐẢO PHỔ BIẾN</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">MỨC RỦI RO</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">XU HƯỚNG</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4.5 flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 font-mono w-4">{region.id}</span>
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-200">{region.name}</span>
                    </td>
                    <td className="py-4.5 text-[13px] font-bold text-slate-900 dark:text-slate-200 text-right pr-6">{region.reports}</td>
                    <td className="py-4.5 text-xs font-medium text-slate-600 dark:text-slate-400 pr-2 line-clamp-1 truncate">{region.type}</td>
                    <td className="py-4.5">
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-sm whitespace-nowrap", region.riskStyle)}>
                        {region.risk}
                      </span>
                    </td>
                    <td className={cn("py-4.5 text-xs font-bold text-right whitespace-nowrap", region.trendColor)}>
                      {region.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

function TopThreats() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 mb-16">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
              <TreeStructure weight="bold" /> PHÂN LOẠI KỸ THUẬT SỐ - THREAT TAXONOMY
            </div>
            <h2 className="text-2xl md:text-[28px] font-bold text-slate-900 dark:text-white">Top 5 Hình Thức Lừa Đảo Trọng Yếu</h2>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 md:text-right max-w-[400px] leading-relaxed">
            Xếp hạng theo khối lượng báo cáo xác thực và mức độ thiệt hại tài sản trực tiếp ghi nhận trong hệ thống.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topThreats.map((threat, idx) => (
            <div key={idx} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[24px] p-7 border border-slate-100 dark:border-slate-800 flex flex-col group hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <threat.icon weight="fill" className="text-slate-700 dark:text-slate-300 text-2xl" />
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-1.5 rounded uppercase tracking-wider whitespace-nowrap", threat.levelColor)}>
                  {threat.level}
                </span>
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-2.5 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{threat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-8 flex-1">{threat.desc}</p>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TỶ LỆ CHIẾM</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">{threat.pct}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-3 overflow-hidden">
                  <div className={cn("h-full rounded-full", threat.levelColor.split(" ")[0])} style={{ width: threat.pct }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-600 dark:text-slate-300">{threat.reports}</span>
                  <span className={threat.trendColor}>{threat.trend}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Special Core Identity Card */}
          <div className="bg-[#0F172A] rounded-[24px] p-7 flex flex-col text-white shadow-xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 relative z-10">
              <Target weight="bold" className="text-lg" /> PHÂN TÍCH AI RADAR
            </div>

            <h3 className="text-lg font-bold mb-3 relative z-10">Đặc Điểm Nhận Diện Cốt Lõi</h3>

            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6 flex-1 relative z-10">
              Hơn 88% các vụ việc đều dẫn dụ nạn nhân chuyển khoản qua tài khoản ngân hàng trung gian (tài khoản rác mua lại) hoặc cài đặt tệp Android .APK ngoài chợ ứng dụng Google Play.
            </p>

            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 relative z-10 flex items-center gap-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 w-16 leading-tight">Nguyên tắc vàng</div>
              <div className="text-xs font-bold text-emerald-400 leading-tight">Không chuyển tiền khi chưa xác thực nhân thân</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
