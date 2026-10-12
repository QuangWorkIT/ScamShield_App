"use client"

import React, { useState } from "react"
import {
  ChatText,
  GlobeHemisphereWest,
  Phone,
  Bank,
  ShieldCheck,
  ShieldWarning,
  WarningCircle,
  LockKey,
  EyeSlash,
  CaretRight,
  AppleLogo,
  GooglePlayLogo,
  QrCode,
  Sparkle,
  CheckCircle,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Data mock cho phần "Cảnh báo lừa đảo"
const recentScams = [
  {
    type: "MẠO DANH CƠ QUAN CHÍNH QUYỀN",
    time: "15 phút trước",
    title: "Giả danh cán bộ Cục Thuế / Công an gọi thông báo kích hoạt định danh VNeID mức 2",
    description: "Yêu cầu nạn nhân tải ứng dụng chưa rõ gốc (APK) từ liên kết giả qua Zalo để chiếm quyền điều khiển tài khoản ngân hàng từ xa.",
    target: "034.777x.xxxx",
    level: "Cực kỳ nguy hiểm",
    levelColor: "text-red-600 bg-red-50",
  },
  {
    type: "LỪA ĐẢO ĐẦU TƯ TÀI CHÍNH",
    time: "42 phút trước",
    title: "Sàn đầu tư năng lượng xanh quốc tế cam kết lợi nhuận 30%/ngày",
    description: "Kêu gọi nộp tiền vào ví trung gian, cho rút tiền thử các lần đầu sau đó khóa tài khoản đòi nộp thêm phí bảo hiểm giao dịch.",
    target: "*.green-fund-vip.xyz",
    level: "Rất rủi ro",
    levelColor: "text-orange-600 bg-orange-50",
  },
  {
    type: "MẠO DANH QUÀ TẶNG TRÚNG THƯỞNG",
    time: "4 giờ trước",
    title: "Trạm phát sóng BTS giả mạo gửi tin nhắn trúng thưởng quà tặng Shopee / Tiki",
    description: "Dẫn dụ người dùng nhập số thẻ tín dụng hoặc thông tin thẻ ghi nợ kèm mã OTP để trừ toàn bộ hạn mức số dư.",
    target: "SMS: Brandname giả mạo",
    level: "Cực kỳ nguy hiểm",
    levelColor: "text-red-600 bg-red-50",
  }
]

export default function GuestCheckPage() {
  return (
    <div className="flex flex-col items-center w-full">
      <HeroSection />
      <RecentScamsSection />
      <DownloadAppSection />
    </div>
  )
}

function HeroSection() {
  const [activeTab, setActiveTab] = useState("sms")
  const [inputText, setInputText] = useState("Viettel: Ma xac thuc OTP cua quy khach la 842106 cho giao dich tai SmartBanking luc 14:20. Khong cung cap ma nay cho bat ky ai.")

  return (
    <section className="w-full max-w-5xl mx-auto px-4 pt-16 pb-12 flex flex-col items-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
        <Sparkle weight="fill" className="text-blue-600" />
        Hệ thống phân tích mới bằng trí tuệ nhân tạo
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold text-center text-slate-900 dark:text-white leading-tight mb-4 tracking-tight">
        Kiểm tra trước khi tin tưởng.<br />Bảo vệ bạn khỏi lừa đảo số.
      </h1>
      <p className="text-slate-600 dark:text-slate-300 text-center max-w-2xl mb-12 text-lg">
        Xác minh tức thì tin nhắn SMS, tài khoản ngân hàng, liên kết web hoặc số điện thoại lạ dựa trên cơ sở dữ liệu thời gian thực và mô hình AI phát hiện gian lận.
      </p>

      {/* Check Form Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-2 mb-12">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-2 mb-2">
          <TabButton
            active={activeTab === "sms"}
            onClick={() => setActiveTab("sms")}
            icon={<ChatText weight="fill" size={18} />}
            label="Tin nhắn / Chat"
          />
          <TabButton
            active={activeTab === "url"}
            onClick={() => setActiveTab("url")}
            icon={<GlobeHemisphereWest size={18} />}
            label="Website / Đường dẫn"
          />
          <TabButton
            active={activeTab === "phone"}
            onClick={() => setActiveTab("phone")}
            icon={<Phone size={18} />}
            label="Số điện thoại / Hotline"
          />
          <TabButton
            active={activeTab === "bank"}
            onClick={() => setActiveTab("bank")}
            icon={<Bank size={18} />}
            label="Tài khoản ngân hàng"
          />
        </div>

        {/* Input Area */}
        <div className="px-4 pb-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            NHẬP NỘI DUNG TIN NHẮN, SỐ GỌI HOẶC ĐOẠN MÃ CẦN KIỂM TRA
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full min-h-[140px] p-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-slate-700 font-mono text-sm leading-relaxed"
            placeholder="Dán nội dung cần kiểm tra vào đây..."
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><LockKey weight="bold" size={14} /> Bảo mật AES-256</span>
              <span className="flex items-center gap-1.5"><EyeSlash weight="bold" size={14} /> Không lưu thông tin cá nhân</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors">Làm mới</button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 py-5 h-auto flex items-center gap-2 font-semibold shadow-lg shadow-slate-900/20">
                <ShieldCheck weight="bold" size={18} /> Phân tích
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Result Card */}
      <div className="w-full max-w-5xl bg-[#0F172A] rounded-[28px] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 flex flex-col gap-6 relative">

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
              <ShieldCheck weight="fill" className="text-emerald-500 text-2xl" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h3 className="text-lg md:text-xl font-bold text-white">Kênh Tin Nhắn Brandname Viettel Telecom & OTP Chính Danh</h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-sm border border-emerald-500/20 uppercase tracking-widest">XÁC NHẬN CHÍNH THỐNG</span>
              </div>
              <p className="text-slate-400 text-xs font-mono tracking-wide">Mã phân tích AI: VNCAM-VN-094192 • Cơ sở dữ liệu: MIC / Cục ATTT</p>
            </div>
          </div>

          {/* Risk Score */}
          <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl py-1.5 pl-4 pr-1.5 border border-slate-700 max-w-fit">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CHỈ SỐ RỦI RO</div>
              <div className="text-[11px] text-slate-300 font-medium">Mức độ: <span className="text-emerald-400 font-bold">Rất an toàn</span></div>
            </div>
            <div className="w-10 h-10 rounded-full border-[2.5px] border-emerald-500 flex items-center justify-center font-bold text-emerald-400 text-sm">
              04
            </div>
          </div>

        </div>

        <div className="p-6 md:p-8 bg-[#F8FAFC]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">TÍNH HỢP PHÁP BRANDNAME</div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-1.5">
                <CheckCircle weight="fill" size={18} /> Khớp với nhà mạng Viettel
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Đã kiểm định với hệ thống định danh nhà mạng viễn thông quốc gia.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">LIÊN KẾT ẨN / PHISHING LINK</div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-1.5">
                <CheckCircle weight="fill" size={18} /> Không phát hiện URL độc hại
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Tin nhắn không chứa liên kết giả mạo cổng đăng nhập ngân hàng.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">MẪU THAO TÚNG TÂM LÝ (SOCIAL ENG.)</div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-1.5">
                <CheckCircle weight="fill" size={18} /> Không có dấu hiệu thúc ép
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Không có lời đe dọa khóa tài khoản hoặc yêu cầu gọi số lạ.</p>
            </div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100/60 p-5 rounded-2xl flex items-start gap-4">
            <WarningCircle weight="fill" className="text-indigo-500 text-2xl flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              <span className="font-bold text-slate-900">Khuyến cáo an toàn từ Chuyên gia An ninh mạng:</span> Tuyệt đối không chia sẻ mã xác thực OTP cho bất kỳ ai, kể cả nhân viên tự xưng là ngân hàng hoặc công an qua điện thoại. Nếu nghi ngờ hãy chủ động gọi hotline ngân hàng trên mặt sau thẻ ATM.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
        active
          ? "bg-[#0F172A] text-white shadow-md"
          : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <span className={active ? "text-white" : "text-slate-400"}>{icon}</span>
      {label}
    </button>
  )
}

function RecentScamsSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <ShieldWarning weight="fill" className="text-red-500 text-3xl" /> Cảnh báo lừa đảo vừa phát hiện
        </h2>
        <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:underline">
          Xem chi tiết <CaretRight weight="bold" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentScams.map((scam, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all flex flex-col h-full group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-widest">{scam.type}</span>
              <span className="text-xs text-slate-400 font-medium">{scam.time}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{scam.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-medium mb-6 flex-1 line-clamp-3">{scam.description}</p>

            <div className="pt-4 border-t border-slate-100/80 flex items-center justify-between mt-auto">
              <div className="text-[11px]">
                <span className="text-slate-400 font-medium">Đầu số/URL: </span>
                <span className="font-mono font-bold text-slate-700">{scam.target}</span>
              </div>
              <span className={cn("text-[11px] font-bold uppercase tracking-wider", scam.levelColor.split(" ")[0])}>{scam.level}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DownloadAppSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8 mb-16">
      <div className="bg-[#0F172A] rounded-[32px] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 flex-1 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 text-xs font-bold mb-6 border border-slate-700 backdrop-blur-sm">
            <Sparkle weight="fill" className="text-blue-400" /> Ứng dụng di động tiện ích
          </div>
          <h2 className="text-3xl md:text-[40px] font-bold text-white leading-tight mb-6">
            Cài đặt ứng dụng ScamShield VN trực tiếp trên điện thoại
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
            Phát hiện tin nhắn SMS độc hại và kiểm tra tài khoản ngân hàng thụ hưởng tức thì, tiện lợi ngay trên chiếc điện thoại của bạn.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Button className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 rounded-2xl px-6 py-7 font-bold flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
              <AppleLogo weight="fill" size={28} />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-0.5">Tải về cho</div>
                <div className="text-sm">iOS (App Store)</div>
              </div>
            </Button>
            <Button className="w-full sm:w-auto bg-slate-800/80 text-white hover:bg-slate-700 rounded-2xl px-6 py-7 font-bold flex items-center gap-3 border border-slate-700 backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
              <GooglePlayLogo weight="fill" size={28} />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-0.5">Tải về cho</div>
                <div className="text-sm">Android (Google Play)</div>
              </div>
            </Button>
          </div>
        </div>

        <div className="relative z-10 bg-white p-7 rounded-[28px] flex flex-col items-center justify-center gap-4 shadow-2xl shrink-0 border border-slate-100 w-full md:w-auto max-w-[240px]">
          <div className="w-40 h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center p-2">
            <QrCode size={140} weight="light" className="text-slate-900" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-bold text-slate-900 uppercase tracking-widest mb-1">Quét mã QR</p>
            <p className="text-slate-500 text-[11px] font-medium">Tải nhanh ứng dụng</p>
          </div>
        </div>
      </div>
    </section>
  )
}
