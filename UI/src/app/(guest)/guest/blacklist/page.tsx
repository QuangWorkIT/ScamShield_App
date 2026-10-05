"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ShieldWarningIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  GlobeIcon,
  PhoneCallIcon,
  BuildingsIcon,
  CertificateIcon,
  ShieldPlusIcon,
  ArrowRightIcon,
  XIcon,
  CaretDownIcon,
  InfoIcon,
  CopyIcon,
  CheckIcon,
  CreditCardIcon,
  BroadcastIcon,
  PhoneSlashIcon,
  GlobeSimpleXIcon,
  ShieldSlashIcon,
  EyeIcon,
  CalendarBlankIcon,
  ProhibitIcon,
  GearIcon,
  ClockIcon,
  SirenIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type TabType = "blacklist" | "whitelist"
type CategoryFilter = "all" | "phone" | "website" | "bank" | "sms"
type SortOrder = "newest" | "name" | "reports"

interface WhitelistItem {
  id: string
  name: string
  category: "phone" | "website" | "bank" | "sms"
  categoryLabel: string
  description: string
  authority: string
  hotline: string
  hotlineLabel: string
  website: string
  websiteLabel: string
  identifierLabel: string
  identifierValue: string
  identifierColor?: string
  verificationBadge: string
  verifiedAt: string
  taxId?: string
  legalRepresentative?: string
  securityCert?: string
}

interface BlacklistItem {
  id: string
  target: string
  targetType: "phone" | "website" | "bank" | "sms"
  targetTypeLabel: string
  threatLevel: "critical" | "emergency" | "high" | "medium" | "financial"
  threatBadge: string
  threatBadgeType: "emergency-solid" | "danger-soft" | "warning-soft"
  impersonatedEntity: string
  reportCount: number
  description: string
  scamPattern: string
  reportedDate: string
  statusType: "blocked" | "investigating" | "pending"
  actionLabel: string
  iconType: "phone-slash" | "globe-slash" | "broadcast" | "phone-call" | "shield-slash" | "bank"
  ncscReference?: string
  evidenceHash?: string
  blockingDetails?: string
}

const WHITELIST_DATA: WhitelistItem[] = [
  {
    id: "wl-viettel",
    name: "Tập đoàn Viễn thông Viettel",
    category: "phone",
    categoryLabel: "VIỄN THÔNG QUỐC GIA",
    description:
      "Tổng Công ty Viễn thông Viettel - Chi nhánh Tập đoàn Công nghiệp - Viễn thông Quân đội.",
    authority: "Cấp phép: Bộ TT&TT",
    hotline: "1800 8098 / 198",
    hotlineLabel: "Hotline chính thức",
    website: "vietteltelecom.vn",
    websiteLabel: "Website duy nhất",
    identifierLabel: "SMS Brandname",
    identifierValue: "VIETTEL",
    identifierColor: "text-emerald-700 dark:text-emerald-400",
    verificationBadge: "Định danh xác thực",
    verifiedAt: "15/01/2026",
    taxId: "0100109106",
    legalRepresentative: "Tập đoàn Công nghiệp - Viễn thông Quân đội",
    securityCert: "NCSC Vietnam Trusted Partner 2026",
  },
  {
    id: "wl-dvc",
    name: "Cổng Dịch vụ công Quốc gia",
    category: "website",
    categoryLabel: "CỔNG DỊCH VỤ CÔNG",
    description:
      "Hệ thống đầu mối điện tử hỗ trợ công dân, doanh nghiệp thực hiện thủ tục hành chính trực tuyến.",
    authority: "Chứng thư: Ban Cơ yếu CP",
    hotline: "1800 1096",
    hotlineLabel: "Hotline hỗ trợ",
    website: "dichvucong.gov.vn",
    websiteLabel: "Website chính thức",
    identifierLabel: "Đơn vị chủ quản",
    identifierValue: "Văn phòng Chính phủ",
    verificationBadge: "Tên miền .gov.vn",
    verifiedAt: "01/01/2026",
    taxId: "Cơ quan hành chính nhà nước",
    legalRepresentative: "Văn phòng Chính phủ nước CHXHCN Việt Nam",
    securityCert: "Ban Cơ yếu Chính phủ - SHA-256 RSA",
  },
  {
    id: "wl-vcb",
    name: "Ngân hàng Vietcombank",
    category: "bank",
    categoryLabel: "NGÂN HÀNG TMCP",
    description:
      "Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam (VCB).",
    authority: "Cấp phép: NHNN Việt Nam",
    hotline: "1900 545413",
    hotlineLabel: "Tổng đài 24/7",
    website: "vietcombank.com.vn",
    websiteLabel: "Domain cổng",
    identifierLabel: "Brandname SMS",
    identifierValue: "Vietcombank",
    identifierColor: "text-emerald-700 dark:text-emerald-400",
    verificationBadge: "Bảo mật EV SSL",
    verifiedAt: "10/02/2026",
    taxId: "0100112437",
    legalRepresentative: "Ngân hàng TMCP Ngoại thương Việt Nam",
    securityCert: "DigiCert Extended Validation TLS SHA256",
  },
  {
    id: "wl-a05",
    name: "Bộ Công An (Cục An ninh mạng A05)",
    category: "phone",
    categoryLabel: "CƠ QUAN AN NINH",
    description:
      "Cục An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao.",
    authority: "Cơ quan Trung ương",
    hotline: "069.234.3640",
    hotlineLabel: "Đường dây nóng tội phạm",
    website: "bocongan.gov.vn",
    websiteLabel: "Cổng thông tin điện tử",
    identifierLabel: "Trực ban 24/7",
    identifierValue: "a05@bocongan.gov.vn",
    verificationBadge: "Kênh tiếp nhận chính thức",
    verifiedAt: "01/01/2026",
    taxId: "Lực lượng Công an Nhân dân",
    legalRepresentative: "Bộ Công An",
    securityCert: "Chính phủ bảo hộ trực tiếp",
  },
  {
    id: "wl-ncsc",
    name: "Trung tâm NCSC Quốc gia",
    category: "website",
    categoryLabel: "AN TOÀN THÔNG TIN",
    description:
      "Trung tâm Giám sát an toàn không gian mạng quốc gia trực thuộc Cục ATTT.",
    authority: "Bộ Thông tin & Truyền thông",
    hotline: "024.3209.6789",
    hotlineLabel: "Hotline kỹ thuật",
    website: "khonggianmang.vn",
    websiteLabel: "Cổng giám sát an toàn",
    identifierLabel: "Email sự cố mạng",
    identifierValue: "ais@mic.gov.vn",
    verificationBadge: "Tín nhiệm mạng NCSC",
    verifiedAt: "05/01/2026",
    taxId: "Đơn vị sự nghiệp công lập",
    legalRepresentative: "Cục An toàn Thông tin - Bộ TT&TT",
    securityCert: "NCSC Cyber Trust Seal cấp cao",
  },
]

const BLACKLIST_DATA: BlacklistItem[] = [
  // Page 1 (Exact items matching user's design image)
  {
    id: "bl-01",
    target: "024 8888 XXXX",
    targetType: "phone",
    targetTypeLabel: "SỐ ĐIỆN THOẠI LỪA ĐẢO",
    threatLevel: "critical",
    threatBadge: "CỰC KỲ NGUY HIỂM",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Mạo danh Cục Cảnh sát Giao thông (CSGT)",
    reportCount: 1892,
    description:
      "Giả mạo Cục Cảnh sát giao thông thông báo nợ phạt nguội, ép nạn nhân tải file APK chứa mã độc theo dõi.",
    scamPattern: "Cuộc gọi giả danh cơ quan hành pháp / Tống tiền tâm lý qua mã độc APK",
    reportedDate: "12/04/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "phone-slash",
    ncscReference: "NCSC-VN-2025-0842",
    evidenceHash: "SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    blockingDetails: "Đã điều phối các nhà mạng Viettel, VNPT, MobiFone cô lập toàn bộ các dải định tuyến VoIP lậu phát sinh cuộc gọi.",
  },
  {
    id: "bl-02",
    target: "vietcombank-ebank-login[.]xyz",
    targetType: "website",
    targetTypeLabel: "WEBSITE PHISHING",
    threatLevel: "emergency",
    threatBadge: "KHẨN CẤP",
    threatBadgeType: "emergency-solid",
    impersonatedEntity: "Giả mạo Ngân hàng TMCP Ngoại thương (Vietcombank)",
    reportCount: 3124,
    description:
      "Website giả mạo giao diện Internet Banking Vietcombank đánh cắp mã OTP xác thực và mật khẩu đăng nhập ngân hàng.",
    scamPattern: "Phishing chiếm đoạt tài khoản Internet Banking & Smart OTP",
    reportedDate: "13/04/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "globe-slash",
    ncscReference: "NCSC-IOC-2025-4190",
    evidenceHash: "SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    blockingDetails: "Đã thu hồi ủy quyền phân giải DNS tại Trung tâm Internet Việt Nam (VNNIC) và đưa vào blacklist trình duyệt toàn cầu (Google Safe Browsing, Microsoft Defender SmartScreen).",
  },
  {
    id: "bl-03",
    target: "VIETCOMBANK_SMS",
    targetType: "sms",
    targetTypeLabel: "SMS BRANDNAME GIẢ MẠO",
    threatLevel: "high",
    threatBadge: "NGUY HIỂM",
    threatBadgeType: "warning-soft",
    impersonatedEntity: "Giả mạo Brandname SMS Vietcombank",
    reportCount: 940,
    description:
      "Phát sóng từ các thiết bị trạm BTS lưu động bất hợp pháp chèn tin nhắn chứa link nhận thưởng giả mạo.",
    scamPattern: "Phát sóng sóng di động chèn tin nhắn mạo danh Brandname qua trạm BTS giả",
    reportedDate: "11/04/2025",
    statusType: "investigating",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "broadcast",
    ncscReference: "A05-BTS-TRACK-9912",
    evidenceHash: "CELL-ID: 452-04-12984-7712 / IMEI: 864901048821901",
    blockingDetails: "Cục Tần số Vô tuyến điện phối hợp cùng Công an các địa phương đã xác định tọa độ nguồn phát sóng, đang tổ chức vây bắt quả tang đối tượng vận hành trạm BTS trên ô tô.",
  },
  {
    id: "bl-04",
    target: "+84 28 7109 XXXX",
    targetType: "phone",
    targetTypeLabel: "CUỘC GỌI QUẤY RỐI & TỐNG TIỀN",
    threatLevel: "high",
    threatBadge: "RỦI RO CAO",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Mạo danh Tổng công ty Điện lực Việt Nam (EVN)",
    reportCount: 1405,
    description:
      "Mạo danh Tổng công ty Điện lực Việt Nam (EVN) đe dọa cắt điện trong 2 giờ nhằm cưỡng ép nạn nhân thanh toán qua tài khoản lừa đảo.",
    scamPattern: "Giả mạo thông báo vi phạm hợp đồng dịch vụ công ích / Ép chuyển tiền gấp",
    reportedDate: "10/04/2025",
    statusType: "pending",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "phone-call",
    ncscReference: "TEL-EVN-LOG-0192",
    evidenceHash: "VOIP-SIP: sip:trunk-evn-spoof@103.149.28.11",
    blockingDetails: "Hồ sơ đã được gửi sang Cục Viễn thông và các nhà mạng để thực hiện biện pháp chặn một chiều đối với thuê bao vi phạm.",
  },
  {
    id: "bl-05",
    target: "green-fund-vip[.]xyz",
    targetType: "website",
    targetTypeLabel: "LỪA ĐẢO TÀI CHÍNH PONZI",
    threatLevel: "financial",
    threatBadge: "LỪA ĐẢO TÀI CHÍNH",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Quỹ Đầu tư Năng Lượng Xanh Giả mạo",
    reportCount: 870,
    description:
      "Sàn đầu tư năng lượng xanh hứa hẹn lãi suất 40%/tháng, dụ dỗ người dùng nạp tiền vào ví tiền số cá nhân rồi khóa tài khoản.",
    scamPattern: "Huy động vốn đa cấp trực tuyến / Mô hình Ponzi tiền số USDT",
    reportedDate: "09/04/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "shield-slash",
    ncscReference: "NCSC-FIN-2025-6311",
    evidenceHash: "WALLET-USDT: 0x9812a14e912fba6129881ab7911029481ad09181",
    blockingDetails: "Toàn bộ các nhà mạng viễn thông trong nước đã đưa địa chỉ IP máy chủ của sàn vào danh sách lọc Firewall tầng mạng quốc gia.",
  },

  // Page 2 Items
  {
    id: "bl-06",
    target: "1029384756 (STB - NGUYEN VAN A)",
    targetType: "bank",
    targetTypeLabel: "TÀI KHOẢN NGÂN HÀNG GIAN LẬN",
    threatLevel: "financial",
    threatBadge: "LỪA ĐẢO TÀI CHÍNH",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Tài khoản nhận tiền lừa đảo tuyển dụng CTV Shopee/Lazada",
    reportCount: 2450,
    description:
      "Tài khoản thu tiền các nạn nhân bị dụ dỗ làm nhiệm vụ cộng tác viên Shopee/Lazada hưởng hoa hồng ảo, nạp tiền vào không thể rút ra.",
    scamPattern: "Lừa đảo việc làm online / Nạp tiền làm nhiệm vụ giật đơn hàng ảo",
    reportedDate: "08/04/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "bank",
    ncscReference: "SBV-FRAUD-ACC-2025-1102",
    evidenceHash: "BANK-ACC: 1029384756-SACOMBANK-NGUYEN-VAN-A",
    blockingDetails: "Ngân hàng Nhà nước và Sacombank đã tạm khóa chiều ghi nợ và phong tỏa số dư còn lại phục vụ công tác điều tra án.",
  },
  {
    id: "bl-07",
    target: "dichvucong-gov-vn[.]cc",
    targetType: "website",
    targetTypeLabel: "WEBSITE PHISHING",
    threatLevel: "critical",
    threatBadge: "CỰC KỲ NGUY HIỂM",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Giả mạo Cổng Dịch vụ công Quốc gia",
    reportCount: 4210,
    description:
      "Trang web giả mạo cổng DVC Quốc gia yêu cầu công dân cài app VNeID giả mạo để chiếm quyền điều khiển điện thoại từ xa.",
    scamPattern: "Mã độc Android Accessibility Service chiếm toàn quyền thiết bị di động",
    reportedDate: "07/04/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "globe-slash",
    ncscReference: "NCSC-IOC-2025-5021",
    evidenceHash: "APK-SHA256: 3a2c418290bc91fa120491823901baef18902134901823910283019283019283",
    blockingDetails: "Đã đồng bộ thông tin nhận dạng mã độc tới tất cả các ngân hàng để tự động khóa giao dịch sinh trắc học khi phát hiện thiết bị nhiễm độc.",
  },
  {
    id: "bl-08",
    target: "0598 432 XXX",
    targetType: "phone",
    targetTypeLabel: "SỐ ĐIỆN THOẠI LỪA ĐẢO",
    threatLevel: "high",
    threatBadge: "RỦI RO CAO",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Mạo danh Chi cục Thuế yêu cầu quyết toán thuế",
    reportCount: 1670,
    description:
      "Gọi điện thoại ép hộ kinh doanh cài phần mềm quyết toán thuế điện tử giả mạo để chiếm đoạt tài khoản ngân hàng.",
    scamPattern: "Giả mạo cơ quan Thuế / Hỗ trợ hoàn thuế giá trị gia tăng lừa đảo",
    reportedDate: "06/04/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "phone-call",
    ncscReference: "GDT-FRAUD-CALL-982",
    evidenceHash: "TEL-LOG: +84598432XXX-ROUTE-VOIP-71",
    blockingDetails: "Nhà mạng Viettel đã chấm dứt cung cấp dịch vụ viễn thông đối với số thuê bao này do vi phạm điều khoản chống spam cuộc gọi.",
  },
  {
    id: "bl-09",
    target: "BIDV-THONGBAO",
    targetType: "sms",
    targetTypeLabel: "SMS BRANDNAME GIẢ MẠO",
    threatLevel: "emergency",
    threatBadge: "KHẨN CẤP",
    threatBadgeType: "emergency-solid",
    impersonatedEntity: "Giả mạo Ngân hàng BIDV",
    reportCount: 2890,
    description:
      "Giả mạo thương hiệu BIDV phát tán tin nhắn cảnh báo tài khoản bị đăng nhập nơi khác kèm link lừa đảo thay đổi mật khẩu.",
    scamPattern: "SMS Spoofing chèn tin nhắn vào luồng Brandname ngân hàng chính thức",
    reportedDate: "05/04/2025",
    statusType: "investigating",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "broadcast",
    ncscReference: "BIDV-ALERT-2025-04",
    evidenceHash: "SMS-CONTENT-HASH: 9912ba012f491c01284baef18912304918239012",
    blockingDetails: "Hệ thống điều phối an ninh mạng đã kích hoạt bộ lọc nội dung SMS tại các gateway trung tâm, loại bỏ các tin có chứa từ khóa vi phạm.",
  },
  {
    id: "bl-10",
    target: "crypto-vippool[.]io",
    targetType: "website",
    targetTypeLabel: "LỪA ĐẢO TÀI CHÍNH",
    threatLevel: "financial",
    threatBadge: "LỪA ĐẢO TÀI CHÍNH",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Sàn Giao dịch Tiền mã hóa VIP Pool",
    reportCount: 1980,
    description:
      "Kêu gọi tham gia nhóm Telegram VIP đầu tư vàng và tiền điện tử có cam kết bảo hiểm vốn nhưng không thể rút vốn khi nạp tiền lớn.",
    scamPattern: "Sàn giao dịch nhị phân (BO) can thiệp kết quả lệnh / Giữ tiền nạn nhân",
    reportedDate: "04/04/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "shield-slash",
    ncscReference: "NCSC-CRYPTO-2025-781",
    evidenceHash: "IP-CLUSTER: 104.21.88.192, 172.67.142.11",
    blockingDetails: "Đã ban hành lệnh chặn kỹ thuật trên toàn bộ 5 nhà cung cấp dịch vụ Internet hàng đầu tại Việt Nam.",
  },

  // Page 3 Items
  {
    id: "bl-11",
    target: "028 9999 8821",
    targetType: "phone",
    targetTypeLabel: "SỐ ĐIỆN THOẠI LỪA ĐẢO",
    threatLevel: "critical",
    threatBadge: "CỰC KỲ NGUY HIỂM",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Mạo danh Viện Kiểm sát Nhân dân Tối cao",
    reportCount: 3150,
    description:
      "Đầu số gọi tự xưng Kiểm sát viên yêu cầu nạn nhân kê khai tài sản và chuyển tiền vào 'tài khoản an toàn' của cơ quan điều tra.",
    scamPattern: "Thao túng tâm lý / Đe dọa bắt giam / Cưỡng ép chuyển tiền giám định",
    reportedDate: "03/04/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "phone-slash",
    ncscReference: "VKS-FRAUD-CALL-2025-01",
    evidenceHash: "SIP-SERVER: voip-relay.southeast-telecom.net",
    blockingDetails: "Bộ TT&TT đã chỉ đạo xử phạt đơn vị cung cấp đầu số vì không thực hiện đúng quy trình định danh khách hàng doanh nghiệp.",
  },
  {
    id: "bl-12",
    target: "mobi-vina-khuyenmai[.]top",
    targetType: "website",
    targetTypeLabel: "WEBSITE LỪA ĐẢO",
    threatLevel: "emergency",
    threatBadge: "KHẨN CẤP",
    threatBadgeType: "emergency-solid",
    impersonatedEntity: "Giả mạo Cổng Khuyến mãi Mobifone / Vinaphone",
    reportCount: 1760,
    description:
      "Trang web dụ dỗ người dùng nạp thẻ cào điện thoại gấp 10 lần giá trị để chiếm đoạt mã thẻ cào và số seri của nạn nhân.",
    scamPattern: "Lừa đảo tri ân khách hàng nạp thẻ nhân dịp kỷ niệm / Chiếm đoạt mã thẻ cào",
    reportedDate: "02/04/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "globe-slash",
    ncscReference: "NCSC-IOC-2025-3310",
    evidenceHash: "DNS-LOG: mobi-vina-khuyenmai.top -> 185.220.101.5",
    blockingDetails: "Trung tâm An toàn thông tin đã phát lệnh chặn khẩn cấp toàn quốc trong vòng 15 phút sau khi nhận báo cáo.",
  },
  {
    id: "bl-13",
    target: "VNPT_HOTRO",
    targetType: "sms",
    targetTypeLabel: "SMS BRANDNAME GIẢ MẠO",
    threatLevel: "high",
    threatBadge: "NGUY HIỂM",
    threatBadgeType: "warning-soft",
    impersonatedEntity: "Giả mạo Tập đoàn Bưu chính Viễn thông VNPT",
    reportCount: 1120,
    description:
      "Phát tán tin nhắn giả thông báo tích điểm đổi quà tặng cao cấp, dẫn dụ người dân điền thông tin thẻ ngân hàng vào link độc hại.",
    scamPattern: "Lừa đảo đổi điểm thưởng nhà mạng / Đánh cắp thông tin thẻ tín dụng",
    reportedDate: "01/04/2025",
    statusType: "investigating",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "broadcast",
    ncscReference: "VNPT-SPOOF-2025-99",
    evidenceHash: "BTS-TELEMETRY: CellID 452-02-88129",
    blockingDetails: "Lực lượng nghiệp vụ Công an thành phố đang phối hợp kỹ thuật cùng VNPT tổ chức đo quét tần số để thu giữ thiết bị BTS lậu.",
  },
  {
    id: "bl-14",
    target: "+84 24 7300 XXXX",
    targetType: "phone",
    targetTypeLabel: "CUỘC GỌI LỪA ĐẢO",
    threatLevel: "high",
    threatBadge: "RỦI RO CAO",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Mạo danh Cục Viễn thông (Bộ TT&TT)",
    reportCount: 2010,
    description:
      "Cuộc gọi tự động thông báo số điện thoại của bạn sẽ bị khóa trong 2 giờ do chưa chuẩn hóa thông tin thuê bao, yêu cầu bấm phím 9 để gặp cán bộ.",
    scamPattern: "Robocall đe dọa khóa sim / Dụ dỗ cung cấp CCCD và mã OTP",
    reportedDate: "31/03/2025",
    statusType: "pending",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "phone-call",
    ncscReference: "TEL-SPAM-BOT-771",
    evidenceHash: "SIP-IVR-HASH: 8812af120491823901baef1890213490",
    blockingDetails: "Hệ thống phòng chống cuộc gọi rác quốc gia đã ghi nhận trên 5,000 cuộc gọi cùng kịch bản phát sinh từ dải số này.",
  },
  {
    id: "bl-15",
    target: "ai-trading-bot[.]site",
    targetType: "website",
    targetTypeLabel: "LỪA ĐẢO TÀI CHÍNH",
    threatLevel: "financial",
    threatBadge: "LỪA ĐẢO TÀI CHÍNH",
    threatBadgeType: "danger-soft",
    impersonatedEntity: "Bot Giao dịch AI Sinh lời Tự động",
    reportCount: 930,
    description:
      "Quảng cáo bot trí tuệ nhân tạo tự động giao dịch ngoại hối với cam kết lợi nhuận 5% mỗi ngày, khóa lệnh nạp rút sau khi gom tiền nạn nhân.",
    scamPattern: "Đầu tư thuật toán AI lừa đảo / Chiếm đoạt tài khoản ví tiền điện tử",
    reportedDate: "30/03/2025",
    statusType: "blocked",
    actionLabel: "Chi tiết cảnh báo",
    iconType: "shield-slash",
    ncscReference: "NCSC-IOC-2025-2980",
    evidenceHash: "SMART-CONTRACT: 0x118239102830192830192833a2c418290bc91fa1",
    blockingDetails: "Toàn bộ tên miền và các mirror site liên quan đã được đưa vào danh sách đen của các DNS Server tại Việt Nam.",
  },
]

export default function GuestBlacklistPage() {
  const [activeTab, setActiveTab] = useState<TabType>("blacklist")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<WhitelistItem | null>(null)
  const [selectedBlacklistItem, setSelectedBlacklistItem] = useState<BlacklistItem | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [newReportTarget, setNewReportTarget] = useState("")
  const [newReportType, setNewReportType] = useState<"phone" | "website" | "bank" | "sms">("phone")
  const [newReportDesc, setNewReportDesc] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => {
      setCopiedKey(null)
    }, 2000)
  }

  // Filter Whitelist
  const filteredWhitelist = useMemo(() => {
    let result = WHITELIST_DATA.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hotline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.identifierValue.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })

    if (sortOrder === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [searchQuery, sortOrder])

  // Filter Blacklist
  const filteredBlacklist = useMemo(() => {
    let result = BLACKLIST_DATA.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.impersonatedEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" || item.targetType === selectedCategory
      return matchesSearch && matchesCategory
    })

    if (sortOrder === "name") {
      result = [...result].sort((a, b) => a.target.localeCompare(b.target))
    } else if (sortOrder === "reports") {
      result = [...result].sort((a, b) => b.reportCount - a.reportCount)
    }

    return result
  }, [searchQuery, selectedCategory, sortOrder])

  // Pagination calculation
  const ITEMS_PER_PAGE = 5
  const isFiltering = searchQuery.trim() !== "" || selectedCategory !== "all"
  const totalRecords = isFiltering ? filteredBlacklist.length : 48290
  const totalPages = isFiltering
    ? Math.max(1, Math.ceil(filteredBlacklist.length / ITEMS_PER_PAGE))
    : 2415

  const paginatedBlacklist = useMemo(() => {
    if (isFiltering) {
      const start = (currentPage - 1) * ITEMS_PER_PAGE
      return filteredBlacklist.slice(start, start + ITEMS_PER_PAGE)
    }
    // When showing standard dataset, select 5 items matching current page
    const pageIndex = (currentPage - 1) % 3
    const start = pageIndex * ITEMS_PER_PAGE
    return filteredBlacklist.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredBlacklist, currentPage, isFiltering])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 380, behavior: "smooth" })
      }
    }
  }

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReportTarget) return
    setReportSubmitted(true)
    setTimeout(() => {
      setIsReportModalOpen(false)
      setReportSubmitted(false)
      setNewReportTarget("")
      setNewReportDesc("")
    }, 1800)
  }

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-foreground dark:bg-background">
      {/* Top Ambient Glow & Header Section */}
      <section className="relative overflow-hidden border-b border-[#E2E7FF]/70 bg-[#F2F3FF] px-4 pt-10 pb-16 sm:px-6 lg:px-8 dark:border-border/60 dark:bg-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-[#DBE1FF]/40 blur-[32px] dark:bg-primary/10"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#131B2E] sm:text-4xl lg:text-5xl dark:text-foreground">
              Tra cứu tài nguyên
            </h1>
            <p className="text-base leading-relaxed text-[#45464D] sm:text-lg dark:text-muted-foreground">
              Tra cứu tức thì danh bạ cảnh báo các đầu số, tên miền lừa đảo (Blacklist) và danh sách liên lạc, website chính thống đã được xác thực.
            </p>
          </div>
        </div>
      </section>

      {/* Main Directory Operations Container */}
      <div className="relative mx-auto -mt-8 max-w-6xl space-y-6 px-4 pb-24 sm:px-6 lg:px-8">
        {/* Segmented Master Controls & Search Hub Card */}
        <div className="rounded-2xl border border-[#E2E7FF] bg-white p-6 shadow-xs dark:border-border dark:bg-card">
          {/* Top Row: Segmented Tab Switchers */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-xl bg-[#F2F3FF] p-1 dark:bg-muted">
              {/* Tab: Blacklist */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("blacklist")
                  setCurrentPage(1)
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                  activeTab === "blacklist"
                    ? "bg-white text-[#131B2E] shadow-xs dark:bg-card dark:text-foreground"
                    : "text-[#45464D] hover:text-[#131B2E] dark:text-muted-foreground dark:hover:text-foreground"
                )}
              >
                <WarningCircleIcon
                  size={18}
                  weight="fill"
                  className={cn(
                    activeTab === "blacklist"
                      ? "text-[#BA1A1A] dark:text-destructive"
                      : "text-[#BA1A1A]/70"
                  )}
                />
                <span>Danh Sách Đen (Blacklist)</span>
                <span className="rounded-full bg-[#FFDAD6] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#93000A] dark:bg-destructive/20 dark:text-destructive">
                  48.2K
                </span>
              </button>

              {/* Tab: Whitelist */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("whitelist")
                  setCurrentPage(1)
                  if (sortOrder === "reports") {
                    setSortOrder("newest")
                  }
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                  activeTab === "whitelist"
                    ? "bg-white text-[#131B2E] shadow-xs dark:bg-card dark:text-foreground"
                    : "text-[#45464D] hover:text-[#131B2E] dark:text-muted-foreground dark:hover:text-foreground"
                )}
              >
                <ShieldCheckIcon
                  size={18}
                  weight="fill"
                  className={cn(
                    activeTab === "whitelist"
                      ? "text-[#059669] dark:text-emerald-400"
                      : "text-[#059669]/70"
                  )}
                />
                <span>Danh Sách Trắng (Whitelist)</span>
                <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#047857] dark:bg-emerald-950/40 dark:text-emerald-400">
                  3.4K
                </span>
              </button>
            </div>

            {/* Quick Helper Text */}
            <div className="hidden text-xs text-[#45464D] sm:block dark:text-muted-foreground">
              {activeTab === "whitelist" ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircleIcon size={14} weight="fill" />
                  Dữ liệu định danh chính thống từ cơ quan nhà nước & tổ chức uy tín
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                  <WarningCircleIcon size={14} weight="fill" />
                  Cơ sở dữ liệu cảnh báo gian lận & tội phạm công nghệ cao
                </span>
              )}
            </div>
          </div>

          {/* Search Field */}
          <div className="mt-5">
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-4 text-[#45464D] dark:text-muted-foreground">
                <MagnifyingGlassIcon size={20} weight="bold" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Tìm kiếm số điện thoại, tên miền URL, đơn vị, Brandname..."
                className="h-14 w-full rounded-xl border border-[#E2E7FF] bg-white pr-12 pl-12 text-sm text-[#131B2E] placeholder-[#76767E] transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-hidden dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                  className="absolute right-4 rounded-full p-1 text-[#45464D] hover:bg-[#F2F3FF] dark:text-muted-foreground dark:hover:bg-muted"
                  aria-label="Xóa tìm kiếm"
                >
                  <XIcon size={16} weight="bold" />
                </button>
              )}
            </div>
          </div>

          {/* Filters & Sort Controls Row */}
          <div className="mt-4 flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Tags - Only displayed in Blacklist tab */}
            {activeTab === "blacklist" && (
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { key: "all", label: "Tất cả loại hình" },
                    { key: "phone", label: "Số điện thoại" },
                    { key: "website", label: "Website / Domain" },
                    { key: "bank", label: "Tài khoản ngân hàng" },
                    { key: "sms", label: "SMS Brandname" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.key)
                      setCurrentPage(1)
                    }}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                      selectedCategory === cat.key
                        ? "bg-[#131A33] text-white shadow-xs dark:bg-primary dark:text-primary-foreground"
                        : "bg-[#F2F3FF] text-[#45464D] hover:bg-[#E2E7FF] hover:text-[#131B2E] dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/80 dark:hover:text-foreground"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Sort Dropdown */}
            <div
              className={cn(
                "flex items-center gap-2 text-xs font-semibold text-[#45464D] dark:text-muted-foreground",
                activeTab === "whitelist" && "sm:ml-auto"
              )}
            >
              <span>SẮP XẾP:</span>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="appearance-none rounded-lg border border-[#E2E7FF] bg-white py-1.5 pr-8 pl-3 text-xs font-medium text-[#131B2E] focus:border-primary focus:outline-hidden dark:border-border dark:bg-background dark:text-foreground"
                >
                  <option value="newest">Mới cập nhật nhất</option>
                  <option value="name">Theo tên (A - Z)</option>
                  {activeTab === "blacklist" && (
                    <option value="reports">Lượt tố cáo nhiều nhất</option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[#45464D] dark:text-muted-foreground">
                  <CaretDownIcon size={14} weight="bold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section: TAB 1 - BLACKLIST CONTENT (MATCHES USER SCREENSHOT) */}
        {activeTab === "blacklist" && (
          <div className="space-y-3">
            {paginatedBlacklist.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#C6C6CE] bg-white p-12 text-center dark:border-border dark:bg-card">
                <WarningCircleIcon size={48} className="mx-auto text-muted-foreground opacity-40" />
                <h3 className="mt-3 text-base font-bold text-[#131B2E] dark:text-foreground">
                  Không tìm thấy cảnh báo nào phù hợp
                </h3>
                <p className="mt-1 text-sm text-[#45464D] dark:text-muted-foreground">
                  Thử tìm kiếm với số điện thoại, URL hoặc tên tài khoản khác.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setCurrentPage(1)
                  }}
                  className="mt-4 inline-flex items-center rounded-lg bg-[#131A33] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#131A33]/90 dark:bg-primary dark:text-primary-foreground"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              paginatedBlacklist.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:shadow-md lg:flex-row lg:items-center dark:border-border dark:bg-card"
                >
                  {/* Left: Icon and Core Target Information */}
                  <div className="flex items-start gap-3.5">
                    {/* Icon Box */}
                    <div
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl",
                        item.iconType === "broadcast"
                          ? "bg-[#FFF6E5] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-[#FFEAEA] text-[#D83A56] dark:bg-rose-950/40 dark:text-rose-400"
                      )}
                    >
                      {item.iconType === "phone-slash" && (
                        <PhoneSlashIcon size={20} weight="bold" />
                      )}
                      {item.iconType === "globe-slash" && (
                        <GlobeSimpleXIcon size={20} weight="bold" />
                      )}
                      {item.iconType === "broadcast" && (
                        <BroadcastIcon size={20} weight="bold" />
                      )}
                      {item.iconType === "phone-call" && (
                        <PhoneCallIcon size={20} weight="bold" />
                      )}
                      {item.iconType === "shield-slash" && (
                        <ShieldSlashIcon size={20} weight="bold" />
                      )}
                      {item.iconType === "bank" && (
                        <CreditCardIcon size={20} weight="bold" />
                      )}
                    </div>

                    {/* Information Area */}
                    <div className="space-y-1">
                      {/* Line 1: Target + Threat Level + Secondary Tag */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-[#131B2E] sm:text-lg dark:text-foreground">
                          {item.target}
                        </span>

                        {/* Threat Level Badge */}
                        {item.threatBadgeType === "emergency-solid" ? (
                          <span className="rounded bg-[#B31D1D] px-2 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase">
                            {item.threatBadge}
                          </span>
                        ) : item.threatBadgeType === "warning-soft" ? (
                          <span className="rounded bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#92400E] uppercase dark:bg-amber-950/50 dark:text-amber-300">
                            {item.threatBadge}
                          </span>
                        ) : (
                          <span className="rounded bg-[#FFE4E6] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#9F1239] uppercase dark:bg-rose-950/50 dark:text-rose-300">
                            {item.threatBadge}
                          </span>
                        )}
                      </div>

                      {/* Line 2: Description */}
                      <p className="text-xs leading-relaxed text-[#45464D] dark:text-muted-foreground">
                        {item.description}
                      </p>

                      {/* Line 3: Meta Statistics Row */}
                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#64748B] dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <EyeIcon size={14} className="text-[#64748B] dark:text-slate-400" />
                          <span className="font-semibold text-[#1E293B] dark:text-slate-200">
                            {item.reportCount.toLocaleString()}
                          </span>{" "}
                          lượt cảnh báo
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarBlankIcon size={14} className="text-[#64748B] dark:text-slate-400" />
                          Cập nhật: {item.reportedDate}
                        </span>


                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="shrink-0 pt-2 lg:pt-0">
                    <button
                      type="button"
                      onClick={() => setSelectedBlacklistItem(item)}
                      className="rounded-lg bg-[#EEF2FF] px-4 py-2 text-xs font-semibold text-[#4338CA] transition hover:bg-[#E0E7FF] dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Bottom Bar: Separated Pages & Report CTA Button (Exact layout from screenshot) */}
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-[#F8FAFC] p-3 sm:flex-row sm:items-center sm:justify-between dark:border-border dark:bg-card/60">
              {/* Left: Record summary & Page indicator */}
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>
                  Đang hiển thị {paginatedBlacklist.length} trên tổng số{" "}
                  {totalRecords.toLocaleString()} bản ghi
                </span>
                <span className="mx-2 text-slate-400">•</span>
                <span>
                  Trang {currentPage} / {totalPages.toLocaleString()}
                </span>
              </div>

              {/* Right: Pagination Navigation & Report CTA */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="rounded px-2.5 py-1 text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-500 dark:text-slate-400 dark:hover:text-white"
                  >
                    Trước
                  </button>

                  {/* Page numbers: 1, 2, 3 ... */}
                  {[1, 2, 3].map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "size-7 rounded-md flex items-center justify-center font-bold text-xs transition-colors",
                        currentPage === pageNum
                          ? "bg-[#0B132B] text-white dark:bg-foreground dark:text-background"
                          : "text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-muted"
                      )}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <span className="px-1 text-slate-400">...</span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="rounded px-2.5 py-1 text-slate-700 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-700 dark:text-slate-300 dark:hover:text-white font-medium"
                  >
                    Sau
                  </button>
                </div>

                {/* Red CTA Button: Report new scam target */}
                <button
                  type="button"
                  onClick={() => {
                    setReportSubmitted(false)
                    setIsReportModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#A31D1D] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#8B1818] active:scale-95"
                >
                  <SirenIcon size={14} weight="fill" />
                  <span>Báo cáo đối tượng mới</span>
                </button>
              </div>
            </div>

            {/* Warning Alert Note */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
              <div className="flex items-start gap-2.5">
                <InfoIcon size={18} weight="fill" className="mt-0.5 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  <p className="font-bold">Lưu ý bảo mật từ Trung tâm Giám sát Không gian mạng:</p>
                  <p className="leading-relaxed">
                    Không bao giờ cung cấp mã OTP, mật khẩu tài khoản ngân hàng hoặc chuyển tiền vào các số tài khoản cá nhân theo yêu cầu của người lạ qua điện thoại hoặc mạng xã hội. Nếu phát hiện dấu hiệu lừa đảo, hãy báo cáo ngay cho cơ quan chức năng hoặc gửi báo cáo tại ScamShield VN.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Section: TAB 2 - WHITELIST CONTENT */}
        {activeTab === "whitelist" && (
          <div className="space-y-4">
            {filteredWhitelist.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#C6C6CE] bg-white p-12 text-center dark:border-border dark:bg-card">
                <ShieldCheckIcon size={48} className="mx-auto text-muted-foreground opacity-40" />
                <h3 className="mt-3 text-base font-bold text-[#131B2E] dark:text-foreground">
                  Không tìm thấy đơn vị nào phù hợp
                </h3>
                <p className="mt-1 text-sm text-[#45464D] dark:text-muted-foreground">
                  Thử tìm kiếm với từ khóa khác.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                  }}
                  className="mt-4 inline-flex items-center rounded-lg bg-[#131A33] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#131A33]/90 dark:bg-primary dark:text-primary-foreground"
                >
                  Đặt lại tìm kiếm
                </button>
              </div>
            ) : (
              filteredWhitelist.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between gap-4 rounded-xl border border-[#E2E7FF] bg-white p-4 shadow-xs transition-all hover:border-[#CAD4FF] hover:shadow-md lg:flex-row lg:items-center dark:border-border dark:bg-card dark:hover:border-primary/40"
                >
                  {/* Left: Organization Identity Info */}
                  <div className="flex items-start gap-4 lg:w-[35%]">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400">
                      {item.category === "phone" ? (
                        <BroadcastIcon size={20} weight="bold" />
                      ) : item.category === "bank" ? (
                        <CreditCardIcon size={20} weight="bold" />
                      ) : item.category === "website" && item.authority.includes("Cơ yếu") ? (
                        <BuildingsIcon size={20} weight="bold" />
                      ) : (
                        <ShieldCheckIcon size={20} weight="bold" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-base font-bold tracking-tight text-[#131B2E] sm:text-lg dark:text-foreground">
                          {item.name}
                        </h3>
                        <span className="rounded bg-[#D1FAE5] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#065F46] uppercase dark:bg-emerald-900/40 dark:text-emerald-300">
                          {item.categoryLabel}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-[#45464D] dark:text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] font-bold text-[#45464D] dark:text-muted-foreground">
                        <CertificateIcon size={14} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                        <span>{item.authority}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Key Verification Attributes (3 columns on background) */}
                  <div className="grid grid-cols-1 gap-2 rounded-lg bg-[#F2F3FF] p-2.5 sm:grid-cols-3 sm:gap-4 lg:w-[42%] dark:bg-muted/50">
                    {/* Hotline */}
                    <div className="space-y-0.5">
                      <span className="block text-[11px] font-bold text-[#45464D] dark:text-muted-foreground">
                        {item.hotlineLabel}
                      </span>
                      <span className="block font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {item.hotline}
                      </span>
                    </div>

                    {/* Official Website */}
                    <div className="space-y-0.5">
                      <span className="block text-[11px] font-bold text-[#45464D] dark:text-muted-foreground">
                        {item.websiteLabel}
                      </span>
                      <span className="block truncate font-mono text-sm font-medium text-[#131B2E] dark:text-foreground">
                        {item.website}
                      </span>
                    </div>

                    {/* Specific Identity */}
                    <div className="space-y-0.5">
                      <span className="block text-[11px] font-bold text-[#45464D] dark:text-muted-foreground">
                        {item.identifierLabel}
                      </span>
                      <span
                        className={cn(
                          "block truncate text-sm font-bold",
                          item.identifierColor || "text-[#131B2E] dark:text-foreground"
                        )}
                      >
                        {item.identifierValue}
                      </span>
                    </div>
                  </div>

                  {/* Right: Verified Badge & Action Button */}
                  <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:pt-0 lg:w-[20%] lg:justify-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#047857] dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircleIcon size={14} weight="fill" />
                      {item.verificationBadge}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedItemForDetail(item)}
                      className="rounded-lg bg-[#EAEDFF] px-3.5 py-1.5 text-xs font-semibold text-[#131B2E] transition-colors hover:bg-[#D5DCFF] dark:bg-primary/20 dark:text-foreground dark:hover:bg-primary/30"
                    >
                      Chi tiết thẩm định
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* B2B Call-to-action Banner (Registration Whitelist) */}
            <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-[#CAD4FF] bg-[#E2E7FF] p-6 shadow-xs md:flex-row md:items-center dark:border-primary/20 dark:bg-primary/10">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#131A33] text-white dark:bg-primary dark:text-primary-foreground">
                  <ShieldPlusIcon size={24} weight="fill" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#131B2E] sm:text-xl dark:text-foreground">
                    Đăng ký Whitelist Doanh Nghiệp & Đơn vị Chính thức
                  </h3>
                  <p className="mt-1 text-sm text-[#45464D] dark:text-muted-foreground">
                    Bảo vệ thương hiệu, xác thực số hotline, SMS Brandname và tên miền chính thức để phòng tránh tội phạm mạng mạo danh.
                  </p>
                </div>
              </div>
              <Link
                href="/guest/dispute"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#131A33] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#131A33]/90 dark:bg-primary dark:text-primary-foreground"
              >
                <span>Nộp hồ sơ thẩm định tổ chức</span>
                <ArrowRightIcon size={16} weight="bold" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Blacklist Investigation Detail Modal (Xem hồ sơ vi phạm / chứng cứ NCSC) */}
      {selectedBlacklistItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-destructive/30 dark:bg-card">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFEAEA] text-[#D83A56] dark:bg-rose-950/40 dark:text-rose-400">
                  <ShieldWarningIcon size={24} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-[#131B2E] dark:text-foreground">
                      Hồ Sơ Cảnh Báo Vi Phạm
                    </h3>
                    <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 uppercase dark:bg-destructive/30 dark:text-rose-300">
                      {selectedBlacklistItem.threatBadge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mã hồ sơ: {selectedBlacklistItem.ncscReference || selectedBlacklistItem.id.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlacklistItem(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Đóng"
              >
                <XIcon size={18} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4 text-xs">
              {/* Target Banner */}
              <div className="rounded-xl border border-rose-100 bg-[#FFF5F5] p-3.5 dark:border-destructive/20 dark:bg-destructive/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                    ĐỐI TƯỢNG BỊ TỐ CÁO
                  </span>
                  <span className="rounded bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-rose-700 shadow-xs dark:bg-card dark:text-rose-300">
                    {selectedBlacklistItem.reportCount.toLocaleString()} lượt báo cáo
                  </span>
                </div>
                <p className="mt-1 font-mono text-base font-bold text-[#BA1A1A] sm:text-lg dark:text-rose-400">
                  {selectedBlacklistItem.target}
                </p>
                <p className="mt-1 text-xs text-[#45464D] dark:text-muted-foreground">
                  {selectedBlacklistItem.description}
                </p>
              </div>

              {/* Technical Dossier Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-2.5">
                  <span className="block text-[10px] text-muted-foreground">
                    Đơn vị bị mạo danh
                  </span>
                  <span className="mt-0.5 block font-bold text-foreground">
                    {selectedBlacklistItem.impersonatedEntity}
                  </span>
                </div>
                <div className="rounded-lg border border-border p-2.5">
                  <span className="block text-[10px] text-muted-foreground">
                    Thủ đoạn ghi nhận
                  </span>
                  <span className="mt-0.5 block font-semibold text-foreground">
                    {selectedBlacklistItem.scamPattern}
                  </span>
                </div>
                <div className="rounded-lg border border-border p-2.5">
                  <span className="block text-[10px] text-muted-foreground">
                    Thời điểm cập nhật mới nhất
                  </span>
                  <span className="mt-0.5 block font-bold text-foreground">
                    {selectedBlacklistItem.reportedDate}
                  </span>
                </div>
              </div>

              {/* Technical Blocking Evidence */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-border dark:bg-muted/40">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  BIỆN PHÁP NGĂN CHẶN KỸ THUẬT & CHỨNG CỨ
                </span>
                <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedBlacklistItem.blockingDetails || "Đã phối hợp liên ngành cùng Bộ TT&TT, Cục A05 và các nhà mạng để thực hiện biện pháp ngăn chặn trên hạ tầng mạng quốc gia."}
                </p>
                {selectedBlacklistItem.evidenceHash && (
                  <p className="mt-2 font-mono text-[10px] text-slate-500 break-all dark:text-slate-400">
                    Mã bằng chứng IOC: {selectedBlacklistItem.evidenceHash}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
              <button
                type="button"
                onClick={() => setSelectedBlacklistItem(null)}
                className="rounded-lg bg-[#131A33] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#131A33]/90 dark:bg-primary dark:text-primary-foreground"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Scam Report Modal (Báo cáo đối tượng mới) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl dark:bg-card">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                  <SirenIcon size={24} weight="fill" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#131B2E] dark:text-foreground">
                    Báo Cáo Đối Tượng Lừa Đảo Mới
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Đóng góp thông tin vào cơ sở dữ liệu quốc gia ScamShield VN
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Đóng"
              >
                <XIcon size={18} weight="bold" />
              </button>
            </div>

            {/* Form Body */}
            {reportSubmitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircleIcon size={32} weight="fill" />
                </div>
                <h4 className="mt-3 text-base font-bold text-foreground">
                  Đã gửi báo cáo thành công!
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Đội ngũ điều phối và kiểm duyệt ScamShield VN sẽ tiến hành thẩm định kỹ thuật và cập nhật vào danh sách cảnh báo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-4 text-xs">
                {/* Target Type Selector */}
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Loại hình vi phạm
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(
                      [
                        { key: "phone", label: "Số điện thoại" },
                        { key: "website", label: "Website / URL" },
                        { key: "bank", label: "Tài khoản bank" },
                        { key: "sms", label: "SMS Brandname" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setNewReportType(t.key)}
                        className={cn(
                          "rounded-lg border py-2 text-center text-xs font-semibold transition-all",
                          newReportType === t.key
                            ? "border-red-600 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300"
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Value */}
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Thông tin đối tượng nghi vấn
                  </label>
                  <input
                    type="text"
                    required
                    value={newReportTarget}
                    onChange={(e) => setNewReportTarget(e.target.value)}
                    placeholder="Ví dụ: 028.9999.xxxx, domain-lua-dao.xyz, STK..."
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Mô tả thủ đoạn / Bằng chứng
                  </label>
                  <textarea
                    rows={3}
                    value={newReportDesc}
                    onChange={(e) => setNewReportDesc(e.target.value)}
                    placeholder="Mô tả chi tiết kịch bản lừa đảo, số tiền bị chiếm đoạt hoặc đính kèm link bằng chứng..."
                    className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#A31D1D] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#8B1818]"
                  >
                    <SirenIcon size={14} weight="fill" />
                    <span>Gửi báo cáo thẩm định</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Verification Detail Modal (Whitelist) */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#E2E7FF] bg-white p-6 shadow-xl dark:border-border dark:bg-card">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E2E7FF] pb-4 dark:border-border">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400">
                  <ShieldCheckIcon size={22} weight="fill" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#131B2E] dark:text-foreground">
                    Hồ sơ Thẩm định Định danh
                  </h3>
                  <p className="text-xs text-[#45464D] dark:text-muted-foreground">
                    Mã xác thực: {selectedItemForDetail.id.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForDetail(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F2F3FF] hover:text-foreground dark:hover:bg-muted"
                aria-label="Đóng"
              >
                <XIcon size={18} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-[#F2F3FF] p-3.5 dark:bg-muted/40">
                <span className="block text-[10px] font-bold tracking-wider text-[#45464D] uppercase dark:text-muted-foreground">
                  TỔ CHỨC ĐƯỢC XÁC THỰC
                </span>
                <p className="mt-0.5 text-sm font-bold text-[#131B2E] dark:text-foreground">
                  {selectedItemForDetail.name}
                </p>
                <p className="mt-1 text-xs text-[#45464D] dark:text-muted-foreground">
                  {selectedItemForDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#E2E7FF] p-2.5 dark:border-border">
                  <span className="block text-[10px] text-[#45464D] dark:text-muted-foreground">
                    Cơ quan phê duyệt
                  </span>
                  <span className="mt-0.5 font-bold text-[#131B2E] dark:text-foreground">
                    {selectedItemForDetail.authority}
                  </span>
                </div>
                <div className="rounded-lg border border-[#E2E7FF] p-2.5 dark:border-border">
                  <span className="block text-[10px] text-[#45464D] dark:text-muted-foreground">
                    Ngày phê chuẩn
                  </span>
                  <span className="mt-0.5 font-bold text-[#131B2E] dark:text-foreground">
                    {selectedItemForDetail.verifiedAt}
                  </span>
                </div>
                <div className="rounded-lg border border-[#E2E7FF] p-2.5 dark:border-border">
                  <span className="block text-[10px] text-[#45464D] dark:text-muted-foreground">
                    Mã số thuế / Pháp lý
                  </span>
                  <span className="mt-0.5 font-mono font-bold text-[#131B2E] dark:text-foreground">
                    {selectedItemForDetail.taxId || "Đang cập nhật"}
                  </span>
                </div>
                <div className="rounded-lg border border-[#E2E7FF] p-2.5 dark:border-border">
                  <span className="block text-[10px] text-[#45464D] dark:text-muted-foreground">
                    Chứng thư số bảo mật
                  </span>
                  <span className="mt-0.5 truncate font-bold text-[#131B2E] dark:text-foreground">
                    {selectedItemForDetail.securityCert || "TLS Extended Validation"}
                  </span>
                </div>
              </div>

              {/* Verified Communications Channels */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-[#131B2E] dark:text-foreground">
                  KÊNH LIÊN HỆ ĐÃ ĐƯỢC BẢO HỘ PHÁP LÝ
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 px-3 py-2 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <PhoneCallIcon size={16} weight="bold" />
                      <span className="font-mono font-bold">{selectedItemForDetail.hotline}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedItemForDetail.hotline, "hotline")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold hover:underline"
                    >
                      {copiedKey === "hotline" ? (
                        <>
                          <CheckIcon size={12} weight="bold" /> Đã sao chép
                        </>
                      ) : (
                        <>
                          <CopyIcon size={12} /> Sao chép
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 px-3 py-2 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <GlobeIcon size={16} weight="bold" />
                      <span className="font-mono font-medium">{selectedItemForDetail.website}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedItemForDetail.website, "website")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold hover:underline"
                    >
                      {copiedKey === "website" ? (
                        <>
                          <CheckIcon size={12} weight="bold" /> Đã sao chép
                        </>
                      ) : (
                        <>
                          <CopyIcon size={12} /> Sao chép
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end gap-2 border-t border-[#E2E7FF] pt-4 dark:border-border">
              <button
                type="button"
                onClick={() => setSelectedItemForDetail(null)}
                className="rounded-lg bg-[#131A33] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#131A33]/90 dark:bg-primary dark:text-primary-foreground"
              >
                Đóng thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
