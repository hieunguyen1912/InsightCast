# Podcast AI

Hệ thống backend API cho ứng dụng Podcast AI - nền tảng chuyển đổi bài viết tin tức thành podcast tự động bằng công nghệ AI.

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [API Documentation](#api-documentation)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Bảo mật](#bảo-mật)

## Giới thiệu

Podcast AI là hệ thống backend Spring Boot cho phép người dùng:
- Tạo và quản lý bài viết tin tức
- Tự động chuyển đổi bài viết thành audio podcast bằng Google Cloud Text-to-Speech
- Quản lý danh mục và bài viết
- Hệ thống comment và tương tác
- Quản lý người dùng với phân quyền chi tiết
- Tích hợp với Firebase Cloud Messaging cho thông báo real-time

## Tính năng

### Quản lý bài viết (Articles)
- Tạo, chỉnh sửa, xóa bài viết
- Workflow duyệt bài viết (DRAFT → PENDING_REVIEW → APPROVED/REJECTED)
- Upload hình ảnh featured và nội dung
- Tự động tóm tắt bài viết bằng Google Gemini AI
- Chuyển đổi bài viết thành audio podcast
- Quản lý bài viết theo danh mục

### Chuyển đổi Text-to-Speech (TTS)
- Tích hợp Google Cloud Text-to-Speech
- Hỗ trợ Long Audio Synthesis cho nội dung dài
- Cấu hình giọng nói, tốc độ, cao độ
- Xử lý bất đồng bộ với WebSocket progress updates
- Lưu trữ audio trên Google Cloud Storage

### Quản lý người dùng
- Đăng ký, đăng nhập với JWT
- Refresh token mechanism
- Quản lý role và permission (RBAC)
- Xác thực email
- Quản lý FCM tokens cho push notifications

### Tin tức (News)
- Thu thập tin tức từ nhiều nguồn
- Retry mechanism với Spring Retry
- Phân trang và tìm kiếm

### Tương tác
- Hệ thống comment đa cấp
- Yêu thích bài viết
- WebSocket cho real-time updates
- Push notifications qua Firebase

### Admin Panel
- Duyệt/từ chối bài viết
- Quản lý người dùng
- Thống kê hệ thống
- Quản lý categories, roles, permissions

## Công nghệ sử dụng

### Framework & Core
- **Spring Boot** 3.5.6
- **Java** 17
- **Maven** - Dependency Management

### Database
- **PostgreSQL** - Relational Database
- **JPA/Hibernate** - ORM
- **Spring Data JPA** - Data Access Layer

### Security
- **Spring Security** - Authentication & Authorization
- **JWT** - Token-based authentication
- **OAuth2 Resource Server** - Security configuration

### AI & Cloud Services
- **Google Cloud Text-to-Speech** - Text to speech conversion
- **Google Cloud Storage** - File storage
- **Spring AI (Google Gemini)** - AI content generation
- **Firebase Admin SDK** - Push notifications

### Other Technologies
- **WebSocket** - Real-time communication
- **Spring Mail** - Email notifications
- **MapStruct** - Bean mapping
- **Lombok** - Boilerplate code reduction
- **JSoup** - HTML parsing
- **Spring Retry** - Retry mechanism
- **SpringDoc OpenAPI** - API documentation

## Yêu cầu hệ thống

- **JDK** 17 hoặc cao hơn
- **Maven** 3.6+ hoặc cao hơn
- **PostgreSQL** 12+ hoặc cao hơn
- **Google Cloud Platform** account với các API enabled:
  - Text-to-Speech API
  - Cloud Storage API
- **Firebase** project với Admin SDK credentials

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd podcastai/backend
```

### 2. Cấu hình PostgreSQL

Tạo database mới:

```sql
CREATE DATABASE news_ai;
```

### 3. Cấu hình Google Cloud

1. Tạo project trên Google Cloud Platform
2. Enable các API sau:
   - Cloud Text-to-Speech API
   - Cloud Storage API
3. Tạo Service Account và download credentials JSON file
4. Tạo GCS bucket cho audio files

### 4. Cấu hình Firebase

1. Tạo Firebase project
2. Download Admin SDK credentials JSON file

### 5. Cập nhật cấu hình

Sửa file `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/news_ai
spring.datasource.username=your_username
spring.datasource.password=your_password

# Google Cloud TTS
google.cloud.tts.project-id=your-project-id
google.cloud.tts.credentials.path=/path/to/your/credentials.json
google.cloud.tts.long-audio.gcs-bucket-name=your-bucket-name

# Firebase
firebase.credentials.path=/path/to/your/firebase-credentials.json
firebase.project-id=your-firebase-project-id

# JWT
app.jwt.secret-key=your-secret-key

# Email (Mailtrap hoặc SMTP khác)
spring.mail.host=your-smtp-host
spring.mail.port=2525
spring.mail.username=your-username
spring.mail.password=your-password
```

## Cấu hình

### Cấu hình TTS

```properties
# Giọng nói mặc định
google.cloud.tts.default-language=en-US
google.cloud.tts.default-voice=en-US-Standard-A
google.cloud.tts.default-speaking-rate=1.0
google.cloud.tts.default-pitch=0.0

# Long Audio Synthesis
google.cloud.tts.long-audio.enabled=true
google.cloud.tts.long-audio.location=asia-southeast1
google.cloud.tts.long-audio.operation-timeout-seconds=300
```

### Cấu hình WebSocket

```properties
websocket.allowed-origins=http://localhost:3000,http://localhost:5173
```

### Cấu hình Async Processing

```properties
async.executor.core-pool-size=5
async.executor.max-pool-size=10
async.executor.queue-capacity=100
```

## Chạy ứng dụng

### Development mode

```bash
# Sử dụng Maven Wrapper
./mvnw spring-boot:run

# Hoặc sử dụng Maven
mvn spring-boot:run
```

### Build JAR file

```bash
./mvnw clean package
java -jar target/podcastai-0.0.1-SNAPSHOT.jar
```

Ứng dụng sẽ chạy tại: `http://localhost:8081`

## API Documentation

Sau khi khởi động ứng dụng, truy cập:

- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8081/v3/api-docs

### Main API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Đăng ký người dùng mới
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Đăng xuất
- `POST /api/v1/auth/revoke` - Revoke refresh token

#### Articles
- `POST /api/v1/articles` - Tạo bài viết mới
- `GET /api/v1/articles/{id}` - Lấy chi tiết bài viết
- `PUT /api/v1/articles/{id}` - Cập nhật bài viết
- `DELETE /api/v1/articles/{id}` - Xóa bài viết
- `POST /api/v1/articles/{id}/submit` - Gửi bài viết để duyệt
- `POST /api/v1/articles/generate-summary` - Tạo tóm tắt tự động
- `GET /api/v1/articles/audio/{audioId}/stream` - Stream audio

#### News
- `GET /api/v1/news` - Lấy danh sách tin tức
- `GET /api/v1/news/{id}` - Chi tiết tin tức

#### Comments
- `POST /api/v1/comments` - Tạo comment
- `GET /api/v1/comments/articles/{articleId}` - Lấy comments của bài viết
- `PUT /api/v1/comments/{id}` - Cập nhật comment
- `DELETE /api/v1/comments/{id}` - Xóa comment

#### Admin
- `GET /api/v1/admin/articles/pending` - Danh sách bài viết chờ duyệt
- `POST /api/v1/admin/articles/{id}/approve` - Duyệt bài viết
- `POST /api/v1/admin/articles/{id}/reject` - Từ chối bài viết
- `GET /api/v1/admin/users` - Quản lý người dùng
- `GET /api/v1/admin/stats` - Thống kê hệ thống

## Cấu trúc dự án

```
src/main/java/com/hieunguyen/podcastai/
├── config/              # Cấu hình (Security, WebSocket, Cloud, etc.)
├── controller/          # REST Controllers
├── dto/
│   ├── request/        # Request DTOs
│   └── response/       # Response DTOs
├── entity/             # JPA Entities
├── enums/              # Enumerations
├── exception/          # Custom exceptions và handlers
├── listener/           # Event listeners
├── mapper/             # MapStruct mappers
├── repository/         # Spring Data JPA repositories
├── service/            # Business logic services
├── specification/      # JPA Specifications cho dynamic queries
├── util/               # Utility classes
└── validator/          # Custom validators
```

## Bảo mật

- **JWT Authentication** với access token và refresh token
- **Role-Based Access Control (RBAC)** với Spring Security
- **OAuth2 Resource Server** configuration
- **CORS** configuration
- **Password hashing** với BCrypt
- **HTTPS** recommended cho production
- **HttpOnly cookies** cho refresh tokens

### Permissions

Hệ thống sử dụng permission-based authorization:
- `PERMISSION_ARTICLE_CREATE`
- `PERMISSION_ARTICLE_UPDATE`
- `PERMISSION_ARTICLE_DELETE`
- `PERMISSION_ARTICLE_SUMMARY`
- Và nhiều permissions khác...

## WebSocket

Hệ thống hỗ trợ WebSocket cho:
- Real-time audio generation progress updates
- Notification delivery
- Connection endpoint: `/ws`
