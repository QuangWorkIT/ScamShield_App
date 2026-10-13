# Chạy ScamShield Backend

**Database chạy bằng Docker, API chạy bằng IntelliJ IDEA.** Cần JDK 21 và Docker Desktop đang mở.

## 1. Tạo `.env`

File `.env` nằm trong **`Server/scamshield-backend`**, cùng cấp với `pom.xml` và `docker-compose.yml`.

Trong terminal IntelliJ, chuyển đến thư mục backend rồi tạo file nếu chưa có:

```powershell
cd D:\Huy-D\FPTU\Semester9\ScamShield_App\Server\scamshield-backend
if (-not (Test-Path .\.env)) {
    Copy-Item .\.env.example .\.env
}
```

Điền các giá trị trong `.env`:

- `JWT_SECRET`: khóa riêng cho JWT, bắt buộc.
- `FIREBASE_WEB_API_KEY`: API key của Firebase project dùng gửi OTP điện thoại.
- `MAIL_USERNAME`, `MAIL_PASSWORD`: Gmail và App Password, nếu dùng API OTP email.
- Các biến hết hạn `*_EXPIRATION_MS`: giữ giá trị mẫu hoặc đổi theo nhu cầu; đơn vị **mili giây**.

Nếu chưa có `JWT_SECRET`, chạy lệnh sau rồi dán kết quả vào `.env`:

```powershell
$jwtBytes = New-Object byte[] 32
$jwtRandom = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$jwtRandom.GetBytes($jwtBytes)
$jwtRandom.Dispose()
[Convert]::ToBase64String($jwtBytes)
```

## 2. Cấu hình IntelliJ để đọc `.env`

1. Mở project, import Maven từ `Server/scamshield-backend/pom.xml`, chọn **JDK 21**.
2. Vào **Run → Edit Configurations**. Chọn cấu hình `ScamshieldBackendApplication`; nếu chưa có, tạo cấu hình **Application**.
3. Đặt các trường sau:

| Trường | Giá trị |
| --- | --- |
| Main class | `com.be.scamshield.ScamshieldBackendApplication` |
| Use classpath of module | Module `scamshield-backend` |
| JDK / JRE | Java 21 |
| Working directory | `D:\Huy-D\FPTU\Semester9\ScamShield_App\Server\scamshield-backend` |
| Program arguments | `--spring.profiles.active=dev` |

Nếu trường bị ẩn, mở **Modify options** để hiện **Working directory** hoặc **Program arguments**. Xem [hướng dẫn IntelliJ](https://www.jetbrains.com/help/idea/run-debug-configuration-java-application.html).

4. Bấm **Apply → OK**.

Code đã tự đọc `.env` từ **Working directory**. Không cần plugin EnvFile hoặc nhập từng biến vào ô **Environment variables**. Nếu ô này có biến trùng với `.env`, bỏ giá trị cũ để tránh ghi đè. Sửa `.env` xong cần **Stop rồi Run lại API**.

## 3. Chạy Docker Compose trước

Mở Docker Desktop. Trong terminal ở **thư mục backend có `docker-compose.yml`**, chạy:

```powershell
cd D:\Huy-D\FPTU\Semester9\ScamShield_App\Server\scamshield-backend
docker compose up -d scamshield-db
docker compose exec -T scamshield-db pg_isready -U postgres -d scamshield-db
```

Đợi PostgreSQL báo **`accepting connections`**. Database local dùng `localhost:5432`, database `scamshield-db`, username/password `postgres`.

Lệnh trên chạy database; API sẽ chạy từ IntelliJ ở bước tiếp theo.

## 4. Khi nào chạy API?

**Chạy API sau khi `.env` đã điền, IntelliJ cấu hình xong và PostgreSQL đã sẵn sàng.**

Trong IntelliJ, chọn `ScamshieldBackendApplication` rồi bấm **Run ▶**. Đợi log `Started ScamshieldBackendApplication`; API chạy ở cổng **8080** và Hibernate tạo/cập nhật bảng khi khởi động.

- Swagger: <http://localhost:8080/swagger-ui/index.html>.
- UI test OTP/partner: <http://localhost:8080/firebase-otp-test.html>.

UI test dùng profile `dev`. Luồng đăng ký: **gửi SMS → `verify-contacts` với số điện thoại và OTP → gửi form kèm `verificationToken`**. Không cần OTP email.

## 5. Lần đầu: chạy script dữ liệu mẫu

Sau khi API đã chạy và tạo bảng, dùng file [script/mock_data_vi.sql](script/mock_data_vi.sql) đã có sẵn:

1. Mở file trong công cụ SQL bạn đang dùng (pgAdmin hoặc Database của IntelliJ nếu có).
2. Chọn kết nối đến database **`scamshield-db`** ở `localhost:5432`.
3. Chạy toàn bộ script để thêm role và dữ liệu mẫu, rồi thử đăng ký.

Không cần nhập lại các câu INSERT trong terminal. Chỉ nạp lần đầu khi database chưa có dữ liệu mẫu; script chỉ INSERT, không xóa dữ liệu cũ.

Nếu container **`mock-data-seeder`** đã được tạo, có thể bấm **Start** trong Docker Desktop sau khi API tạo bảng; container sẽ tự chạy cùng file script. Chọn một cách nạp dữ liệu để tránh chạy script hai lần.

## API khiếu nại và lưu nháp

Các API dưới đây cần đăng nhập bằng JWT:

| API | Chức năng |
| --- | --- |
| `POST /api/disputes` | Gửi hồ sơ mới, tạo trạng thái `PENDING` |
| `POST /api/disputes/drafts` | Lưu nháp, cho phép chưa đủ thông tin |
| `PUT /api/disputes/drafts/{id}` | Lưu lại nội dung nháp, thêm/xóa tệp |
| `GET /api/disputes/drafts` | Danh sách nháp của tôi, có `page`, `size` |
| `GET /api/disputes/drafts/{id}` | Mở nháp để tiếp tục nhập |
| `POST /api/disputes/drafts/{id}/submit` | Gửi bản nháp thành hồ sơ chính thức |

API ghi dữ liệu dùng `multipart/form-data`: part `request` là JSON, part `files` là các tài liệu PDF/JPG/PNG, tối đa **5MB/tệp, 10 tệp/hồ sơ**. Ví dụ JSON khi gửi:

```json
{
  "indicatorType": "PHONE",
  "indicatorValue": "0912348899",
  "legalRelationship": "LEGAL_REPRESENTATIVE",
  "reason": "Hotline chính chủ của doanh nghiệp bị gắn nhãn sai.",
  "agreeTerms": true
}
```

`indicatorType`: `PHONE`, `BANK_ACCOUNT`, `URL`, `BRANDNAME`. `legalRelationship`: `OWNER` (chủ sở hữu), `LEGAL_REPRESENTATIVE` (đại diện pháp luật), `AUTHORIZED_REPRESENTATIVE` (người được ủy quyền).

Khi lưu nháp có thể gửi `{}`. Khi cập nhật nháp, gửi lại toàn bộ các trường muốn giữ; trường bị bỏ sẽ được xóa. Tệp mới được thêm vào, `removedEvidenceIds` là danh sách ID tệp muốn bỏ. Khi gửi nháp, gửi JSON đầy đủ như trên; backend dùng lại các tệp đã lưu nên không cần upload lại. Hồ sơ nháp chưa tính vào `/me` và `/me/summary`.

Backend chỉ nhận hồ sơ chính thức khi tìm thấy xác thực blacklist `ACTIVE`. Nếu đã `RETRACTED`, hoặc bạn đã có đơn đang xử lý cho cùng chỉ số, API trả `409`; không tìm thấy xác thực trả `404`.

**Lưu tài liệu:** Hồ sơ khiếu nại lưu tài liệu vào S3 bucket (mặc định dùng chung bucket `evidences` từ `AWS_S3_BUCKET_NAME`). Điền thông tin S3 vào `.env` rồi restart API:

```dotenv
# S3 Configurations
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=evidences
AWS_S3_ENDPOINT_OVERRIDE=
```

API trả liên kết tải có thời hạn (mặc định 900 giây, tùy chỉnh qua `DISPUTE_FILE_URL_EXPIRATION_SECONDS`); lấy lại hồ sơ để nhận liên kết mới khi hết hạn. Nếu thiếu cấu hình hoặc kho lưu trữ lỗi, API trả `503` và hồ sơ không bị lưu dở dang.

**Nếu database đã có bảng `disputes` từ phiên bản cũ:** chạy SQL sau trong công cụ SQL của bạn để cho phép nháp thiếu nội dung và thêm trạng thái `DRAFT`, rồi restart API. Đây là cập nhật schema, không chạy trong `mock_data_vi.sql`.

```sql
BEGIN;
ALTER TABLE disputes ALTER COLUMN confirmed_indicator_id DROP NOT NULL;
ALTER TABLE disputes ALTER COLUMN reason DROP NOT NULL;
ALTER TABLE disputes ALTER COLUMN reason TYPE text;
ALTER TABLE disputes DROP CONSTRAINT IF EXISTS disputes_status_check;
ALTER TABLE disputes ADD CONSTRAINT disputes_status_check
  CHECK (status IN ('DRAFT', 'PENDING', 'IN_REVIEW', 'NEEDS_MORE_INFO', 'APPROVED', 'REJECTED'));
COMMIT;
```

Database mới được Hibernate tạo theo entity hiện tại, không cần bước SQL này.

## Nếu gặp lỗi

- **Không đọc `.env`**: kiểm tra tên file, file cạnh `pom.xml`, Working directory trong IntelliJ và restart API.
- **Connection refused ở 5432**: mở Docker Desktop, chạy lại bước 3.
- **Cổng 8080 đã bị dùng**: dừng API cũ. Nếu từng chạy API bằng Docker, chạy `docker compose stop scamshield-api` rồi Run trong IntelliJ.
- **SMS thật bị từ chối**: kiểm tra Phone Authentication, billing và SMS region của Firebase. Xem [hướng dẫn Firebase](https://firebase.google.com/docs/auth/web/phone-auth).
