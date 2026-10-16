"use client"

import React, { useState } from "react"
import {
  Medal,
  ShieldCheck,
  Shield,
  SealCheck,
  Compass,
  Eye,
  Scales,
  Lightning,
  UsersThree,
  Lock,
  CheckCircle,
  ClockCounterClockwise,
  Question,
  Gift,
  Gauge,
  Terminal,
  TShirt,
  TrendUp,
  Flag,
  Info,
  MagnifyingGlass,
  Trophy,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

// --- Mock Data ---

type BadgeStatus = "earned" | "locked"

interface Badge {
  id: number
  tag: string
  title: string
  desc: string
  icon: Icon
  iconBg: string
  iconColor: string
  status: BadgeStatus
  date?: string
  progress?: { current: number; total: number; unit: string }
}

const badges: Badge[] = [
  { id: 1, tag: "CỰC KỲ", title: "Người Khai Phá", desc: "Đưa báo cáo đầu tiên vào Blacklist Quốc gia.", icon: Compass, iconBg: "bg-blue-50 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400", status: "earned", date: "15/01/2025" },
  { id: 2, tag: "HIẾM", title: "Chiến Binh Chống Lừa Đảo", desc: "Gửi >20 báo cáo lừa đảo công nghệ cao...", icon: Shield, iconBg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-800 dark:text-slate-200", status: "earned", date: "02/03/2025" },
  { id: 3, tag: "HUYỀN THOẠI", title: "Chuẩn Xác 100%", desc: "Duy trì tỷ lệ chính xác tuyệt đối trong 30 ngày.", icon: SealCheck, iconBg: "bg-sky-50 dark:bg-sky-900/30", iconColor: "text-sky-600 dark:text-sky-400", status: "earned", date: "28/04/2025" },
  { id: 4, tag: "CHUYÊN SÂU", title: "Khắc Tinh Deepfake", desc: "Phát hiện 5 video lừa đảo AI khuôn mặt mạo...", icon: Eye, iconBg: "bg-indigo-50 dark:bg-indigo-900/30", iconColor: "text-indigo-600 dark:text-indigo-400", status: "earned", date: "10/05/2025" },
  { id: 5, tag: "UY TÍN", title: "Hiệp Sĩ Phản Biện", desc: "Minh oan chính xác cho các doanh nghiệp bị vu...", icon: Scales, iconBg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-800 dark:text-slate-200", status: "earned", date: "04/05/2025" },
  { id: 6, tag: "PHẢN ỨNG", title: "Giám Sát Siêu Tốc", desc: "Báo cáo số điện thoại rác trong 5 phút đầu...", icon: Lightning, iconBg: "bg-blue-50 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400", status: "earned", date: "22/04/2025" },
  { id: 7, tag: "CỘNG ĐỒNG", title: "Hộ Vệ Dòng Lòng", desc: "Đóng góp 50 lượt xác thực hồ sơ nghi vấn...", icon: UsersThree, iconBg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-800 dark:text-slate-200", status: "earned", date: "18/03/2025" },
  { id: 8, tag: "TIẾN ĐỘ", title: "Vệ Binh Trăm Trận", desc: "Đạt 100 báo cáo được duyệt vào kho dữ liệu.", icon: Lock, iconBg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-400", status: "locked", progress: { current: 42, total: 100, unit: "báo cáo" } },
  { id: 9, tag: "TIẾN ĐỘ", title: "Thợ Săn Mã Độc APK", desc: "Nộp mẫu phân tích mã độc giả mạo dịch vụ...", icon: Lock, iconBg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-400", status: "locked", progress: { current: 1, total: 3, unit: "mẫu" } },
]

const leaderboard = [
  { rank: 1, name: "Trần Hữu Nam", level: "Sentinel Lv.4", pts: "4.920", rankStyle: "bg-slate-900 text-white dark:bg-white dark:text-slate-900" },
  { rank: 2, name: "Lê Hoàng Yến", level: "Sentinel Lv.4", pts: "4.310", rankStyle: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { rank: 3, name: "Phạm Quốc Dũng", level: "Sentinel Lv.3", pts: "3.890", rankStyle: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
]

const rewards = [
  { id: 1, tag: "Tiện ích AI", title: "Gói Mở Rộng 500 Lượt AI Pro", desc: "Thêm 500 lượt phân tích chuyên sâu URL độc hại và tài khoản lừa đảo.", cost: 300, icon: Gauge },
  { id: 2, tag: "Lập trình viên", title: "Khóa API Sandbox 30 Ngày", desc: "Tích hợp trực tiếp dữ liệu Blacklist quốc gia với hạn mức 10k req/ngày.", cost: 450, icon: Terminal },
  { id: 3, tag: "Đối tác an ninh", title: "Voucher Bkav / Kaspersky", desc: "Mã ưu đãi giảm 50% bản quyền 1 năm phần mềm bảo mật đối tác.", cost: 250, icon: ShieldCheck },
  { id: 4, tag: "Quà tặng độc quyền", title: "Áo Thun Sentinel x NCSC", desc: "Áo thun cotton cao cấp in huy hiệu phản quang Sentinel Trust.", cost: 600, icon: TShirt },
]

const CARD =
  "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"

export default function UserReputationPage() {
  return (
    <div className="w-full max-w-6xl pb-10">
      <PageHeader />
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <RankCard />
        <CampaignCard />
      </div>
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <BadgesSection />
        <Sidebar />
      </div>
      <RewardsSection />
    </div>
  )
}

function PageHeader() {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div className="mb-4 text-[11px] font-bold tracking-wide text-slate-500 dark:text-slate-400">
          Cổng Người Dùng / Đóng Góp &amp; Thành Tích /{" "}
          <span className="text-slate-900 dark:text-white">
            Huy Hiệu &amp; Đổi Thưởng
          </span>
        </div>
        <h1 className="mb-2 text-[28px] font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
          Huy Hiệu &amp; Đổi Thưởng
        </h1>
        <p className="max-w-xl text-sm font-medium text-slate-500 dark:text-slate-400">
          Tích lũy điểm uy tín và mở khóa đặc quyền bảo vệ an toàn số.
        </p>
      </div>
      <div className="flex items-center gap-2 md:mt-6">
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
          <ClockCounterClockwise weight="bold" size={16} /> Lịch sử điểm
          <span className="text-emerald-600 dark:text-emerald-400">
            ( +720 pts )
          </span>
        </button>
        <button
          aria-label="Trợ giúp"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <Question weight="bold" size={16} />
        </button>
      </div>
    </div>
  )
}

function RankCard() {
  const progress = 70
  return (
    <div className={cn(CARD, "rounded-2xl p-6 md:p-7 lg:col-span-7")}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-md">
            <ShieldCheck weight="fill" size={34} />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold whitespace-nowrap text-white">
              Lv.2
            </span>
          </div>
          <div>
            <div className="mb-0.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              CẤP BẬC HOẠT ĐỘNG
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sentinel Lv.2 (Hiệp Sĩ Phòng Vệ)
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Mã định danh:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                STN-VN-8842
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Điểm khả dụng
          </div>
          <div className="text-3xl leading-none font-bold text-slate-900 dark:text-white">
            720{" "}
            <span className="text-xs font-bold text-slate-400">PTS</span>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <TrendUp weight="bold" /> Tiến trình cấp bậc
          </span>
          <span className="text-slate-900 dark:text-white">
            700 / 1.000 EXP (Lv.3)
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
          <MagnifyingGlass weight="bold" className="text-blue-500" /> Hạn mức
          tra cứu 50 lượt/ngày
        </span>
        <span className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
          <SealCheck weight="bold" className="text-blue-500" /> Huy hiệu uy tín
          trên báo cáo
        </span>
      </div>
    </div>
  )
}

function CampaignCard() {
  const progress = 64
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-[#0F172A] p-6 text-white shadow-xl md:p-7 lg:col-span-5">
      <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-blue-500/20 blur-2xl" />
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold">
          Chiến dịch Tháng 05/2025
        </span>
        <span className="text-xs font-semibold text-slate-300">
          Còn 12 ngày
        </span>
      </div>
      <h3 className="relative z-10 mb-2 text-xl font-bold">Nhiệm vụ Hộ Vệ Số</h3>
      <p className="relative z-10 mb-5 text-sm font-medium text-slate-300">
        Phát hiện đầu mối lừa đảo giả mạo công trực tuyến.
      </p>

      <div className="relative z-10 mb-5 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
        <div className="mb-2 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">Mục tiêu tháng</span>
          <span>320 / 500 PTS ({progress}%)</span>
        </div>
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-slate-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-slate-400">
          <span>200 PTS (Đã nhận)</span>
          <span className="text-slate-200">500 PTS: VIP 3T</span>
          <span>800 PTS</span>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold">
          <Gift weight="fill" size={18} /> ScamShield VIP 3 Tháng
        </span>
        <button className="rounded-md bg-white px-4 py-1.5 text-xs font-bold text-slate-900 transition-colors hover:bg-slate-200">
          Đổi quà
        </button>
      </div>
    </div>
  )
}

function BadgesSection() {
  const tabs = ["Tất cả (12)", "Đã đạt (7)", "Chưa mở (5)"]
  const [activeTab, setActiveTab] = useState(tabs[0])

  const visible = badges.filter((b) =>
    activeTab === tabs[1]
      ? b.status === "earned"
      : activeTab === tabs[2]
        ? b.status === "locked"
        : true
  )

  return (
    <section className={cn(CARD, "rounded-2xl p-6 lg:col-span-8")}>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Medal weight="bold" className="text-blue-600" /> Huy Hiệu Đạt Được
        </h2>
        <div className="flex items-center gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              aria-pressed={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[11px] font-bold transition-all",
                activeTab === tab
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg bg-blue-50/60 px-4 py-2.5 text-[11px] font-medium text-slate-600 dark:bg-blue-900/20 dark:text-slate-300">
        <Info weight="fill" className="shrink-0 text-blue-600" />
        Dữ liệu báo cáo được thẩm định và đồng bộ trực tiếp tới cơ sở dữ liệu
        an ninh mạng quốc gia A05.
      </div>
    </section>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  const locked = badge.status === "locked"
  const pct = badge.progress
    ? Math.round((badge.progress.current / badge.progress.total) * 100)
    : 0

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-4 transition-shadow hover:shadow-md",
        locked
          ? "border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/30"
          : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            badge.iconBg
          )}
        >
          <badge.icon weight="fill" size={20} className={badge.iconColor} />
        </div>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {badge.tag}
        </span>
      </div>
      <h3
        className={cn(
          "mb-1 text-sm font-bold",
          locked
            ? "text-slate-500 dark:text-slate-400"
            : "text-slate-900 dark:text-white"
        )}
      >
        {badge.title}
      </h3>
      <p className="mb-4 flex-1 text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
        {badge.desc}
      </p>

      {locked && badge.progress ? (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>
              {badge.progress.current} / {badge.progress.total}{" "}
              {badge.progress.unit}
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-slate-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-[11px] font-bold dark:border-slate-800">
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <CheckCircle weight="bold" size={14} /> Đã đạt
          </span>
          <span className="text-slate-900 dark:text-white">{badge.date}</span>
        </div>
      )}
    </div>
  )
}

function Sidebar() {
  return (
    <div className="flex flex-col gap-6 lg:col-span-4">
      <div className={cn(CARD, "rounded-2xl p-6")}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Thứ hạng của bạn
          </span>
          <span className="flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <TrendUp weight="bold" /> Top 1%
          </span>
        </div>
        <div className="mb-4 flex items-baseline gap-1.5">
          <span className="text-4xl font-bold text-slate-900 dark:text-white">
            #142
          </span>
          <span className="text-xs font-semibold text-slate-400">/ 128.450</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/50">
            <div className="text-[10px] font-semibold text-slate-500">
              Tuần này
            </div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              +185 PTS
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/50">
            <div className="text-[10px] font-semibold text-slate-500">
              Tổng điểm
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              1.850 PTS
            </div>
          </div>
        </div>
      </div>

      <div className={cn(CARD, "rounded-2xl p-6")}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Trophy weight="bold" className="text-blue-600" /> Bảng Xếp Hạng
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Tháng 05/2025
          </span>
        </div>
        <ul className="space-y-3">
          {leaderboard.map((u) => (
            <li key={u.rank} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  u.rankStyle
                )}
              >
                {u.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {u.name}
                </div>
                <div className="text-[10px] font-medium text-slate-400">
                  {u.level}
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {u.pts} pts
              </span>
            </li>
          ))}
          <li className="text-center text-slate-300" aria-hidden="true">
            ...
          </li>
          <li className="flex items-center gap-3 rounded-lg bg-blue-50 px-2 py-2 dark:bg-blue-900/20">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white dark:bg-white dark:text-slate-900">
              142
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate text-xs font-bold text-slate-900 dark:text-white">
                Nguyễn Tuấn Anh
                <span className="rounded bg-blue-600 px-1 text-[8px] font-bold text-white">
                  BẠN
                </span>
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                Sentinel Lv.2
              </div>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              1.850 pts
            </span>
          </li>
        </ul>
        <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
          Top 10 chung cuộc nhận vinh danh từ NCSC.
        </p>
      </div>
    </div>
  )
}

function RewardsSection() {
  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Flag weight="bold" className="text-blue-600" /> Kho Đổi Đặc Quyền
            &amp; Voucher Bảo Vệ Số
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Sử dụng điểm uy tín đã tích lũy để đổi các tiện ích bảo mật thực tế
          </p>
        </div>
        <div className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Số dư đổi quà: <span className="text-slate-900 dark:text-white">720 PTS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rewards.map((reward) => {
          const affordable = reward.cost <= 720
          return (
            <div
              key={reward.id}
              className={cn(CARD, "flex flex-col rounded-xl p-5")}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <reward.icon weight="bold" size={20} />
              </div>
              <span className="mb-2 w-fit rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {reward.tag}
              </span>
              <h3 className="mb-1.5 text-sm font-bold text-slate-900 dark:text-white">
                {reward.title}
              </h3>
              <p className="mb-5 flex-1 text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                {reward.desc}
              </p>
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Chi phí:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {reward.cost} PTS
                </span>
              </div>
              <button
                type="button"
                disabled={!affordable}
                className="w-full rounded-md bg-black py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Đổi Ngay
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
