---
name: check-quality
description: >
  Quality gate bắt buộc: chạy unit test + SonarQube scan, fix issues cho đến khi pass.
  Dùng trước khi commit/push/PR, hoặc user nói
  "run tests", "quality gate", "check quality", "check trước khi commit", "sonar scan".
  Gộp unit test gate + SonarQube check thành 1 skill.
---

# Check Quality

Checkpoint bắt buộc trước mọi action finalizing code. Triết lý: broken code không được rời local machine. Bắt lỗi sớm ở đây tiết kiệm thời gian hơn là debug trên CI/production.

## Trigger

```
/check-quality
```

## Config

Lấy từ `resources.md`:
- **SONARQUBE_TOKEN** — token xác thực SonarQube
- **SONARQUBE_KEY** — project key

SonarQube server: `http://localhost:9000`

## Quy trình (tuần tự, không bỏ bước)

### Step 1: Unit Tests

Kiểm tra changes trong backend:
```bash
git diff --name-only -- backend/ && git diff --name-only --cached -- backend/
```

Nếu có changes → chạy test:
```bash
cd backend && npx jest --coverage
```

**Điều kiện pass (cả 2 phải đạt):**
- 100% test pass — zero failures, zero errors
- Coverage > 70% — check dòng "All files" trong coverage summary

**Nếu fail:**
1. Đọc failure output, xác định test nào fail và tại sao
2. Phân biệt: lỗi ở production code (fix code) hay test code (fix test)
3. Fix → chạy lại → lặp cho đến khi pass

**Nếu coverage < 70%:**
1. Xem coverage table, tìm files có coverage thấp
2. Viết thêm test cho uncovered code paths — ưu tiên files đã thay đổi trong session
3. Chạy lại → verify coverage > 70%

Không chuyển sang Step 2 cho đến khi Step 1 pass hoàn toàn.

### Step 2: SonarQube Scan

```bash
npm run sonar
```

Chờ scan xong + ~5 giây cho server xử lý results.

### Step 3: Kiểm tra kết quả SonarQube

Query API với SONARQUBE_TOKEN và SONARQUBE_KEY từ `resources.md`:

**Get quality gate status:**
```bash
curl -s -u "{SONARQUBE_TOKEN}:" \
  "http://localhost:9000/api/qualitygates/project_status?projectKey={SONARQUBE_KEY}"
```

**Get measures:**
```bash
curl -s -u "{SONARQUBE_TOKEN}:" \
  "http://localhost:9000/api/measures/component?component={SONARQUBE_KEY}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_hotspots,alert_status"
```

**Get open issues (sorted by severity):**
```bash
curl -s -u "{SONARQUBE_TOKEN}:" \
  "http://localhost:9000/api/issues/search?componentKeys={SONARQUBE_KEY}&statuses=OPEN,CONFIRMED,REOPENED&ps=500&s=SEVERITY&asc=false"
```

**Điều kiện pass:**
- Quality Gate status: OK
- 0 Blocker issues
- 0 Critical issues

### Step 4: Fix issues (nếu có Blocker/Critical)

Fix theo thứ tự severity:
1. **BLOCKER** — bắt buộc fix
2. **CRITICAL** — bắt buộc fix
3. **MAJOR** — fix nếu đơn giản, note cho user nếu cần refactoring lớn ngoài scope

Mỗi issue từ API chứa: `component` (file path), `line`, `message`, `type`.

Sau khi fix → quay lại Step 1 (re-run test) → Step 2 (re-scan) → Step 3 (re-check). Lặp tối đa 3 vòng.

### Step 5: Kiểm tra test coverage theo registry

Đọc coverage matrix từ `docs/features/{FEATURE_FLAG}/test-cases/coverage-matrix.md`:

1. Kiểm tra xem có user story nào chưa có test case (Status = Missing):
   - Nếu có → **cảnh báo user**: "US-xxx chưa có test case nào — cần bổ sung trước khi commit"
   - Liệt kê danh sách stories thiếu test

2. Tính coverage ratio:
   - `coverage = (stories có ít nhất 1 test) / (tổng stories) × 100%`
   - **Recommend:** coverage >= 80% trước khi commit

3. Cập nhật `docs/registry.yaml`:
   - `tests_pass`, `coverage`

### Step 6: Báo cáo

```
Quality Gate: PASSED ✓
- Tests: XX passed, 0 failed
- Coverage: XX.X%
- SonarQube: 0 Blocker, 0 Critical, X Major, X Minor
- Story Coverage: X/Y stories có test (XX%)
- Missing tests: [US-xxx, US-yyy] (nếu có)
- Fixed in this session: [danh sách]
```

### Nếu không pass sau 3 vòng

1. **Dừng** — không proceed với action gốc
2. **Báo cáo** chi tiết lỗi còn lại và lý do không fix được
3. **Hỏi user** cách xử lý (fix manually, skip checks cụ thể...)

Không bao giờ tự ý bypass gate. User phải explicitly approve.

## Lưu ý

- Tests chạy trong `backend/` (NestJS backend)
- SonarQube cần chạy tại `http://localhost:9000`
- Nếu SonarQube không chạy (curl fail) → thông báo user, hỏi có muốn chỉ chạy test gate
- Frontend changes: nếu project có frontend lint/test → chạy tương tự
