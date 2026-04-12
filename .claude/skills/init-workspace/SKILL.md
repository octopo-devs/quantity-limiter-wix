---
name: init-workspace
description: >
  Khởi tạo workspace mới từ boilerplate: tạo folder workspace bên trong boilerplate,
  copy .claude, chrome-profile, docs vào workspace, clone subprojects (có SSH→HTTPS fallback),
  phân tích tech stack và mối tương quan giữa subprojects để generate CLAUDE.md workspace,
  kiểm tra Claude setup trong từng subproject, cấu hình remote GitLab, init git.
  Giữ nguyên git của boilerplate. Dùng khi user nói "init workspace", "setup project",
  "khởi tạo workspace", "init".
---

# Init Workspace

Tạo workspace mới **bên trong** thư mục megamind-ai-boilerplate. Boilerplate giữ nguyên git repo. Workspace mới có git repo riêng.

## Nguyên tắc chính

1. **Clone subprojects TRƯỚC khi commit workspace.** CLAUDE.md và initial commit phản ánh trạng thái thật (đã clone được những project nào, tech stack gì).
2. **SSH clone fail → thử HTTPS trước khi bỏ cuộc.** Chỉ log warning nếu cả hai đều fail.
3. **Luôn dùng absolute path trong Bash calls.** Không `cd` giữa các call (state không persist giữa các Bash tool call).
4. **Phân tích subproject để viết CLAUDE.md có giá trị.** Đọc `package.json`, `README.md`, detect framework. Không chỉ liệt kê bảng repo.
5. **Không tự tạo `CLAUDE.md` trong subproject.** Subproject có git repo riêng của team khác; chỉ phát hiện thiếu và gợi ý user.

## Cấu trúc sau khi init

```
megamind-ai-boilerplate/          ← giữ nguyên, git repo không bị thay đổi
  .git/                           ← git của boilerplate (KHÔNG XOÁ)
  .claude/
  .gitignore                      ← thêm <workspace-name>/
  chrome-profile/
  docs/
  CLAUDE.md
  README.md
  <workspace-name>/              ← folder workspace MỚI
    .claude/                     ← copy từ boilerplate (đã xoá init-workspace skill)
    .gitignore                   ← generate mới
    chrome-profile/              ← copy từ boilerplate
    docs/                        ← copy từ boilerplate
    CLAUDE.md                    ← generate mới, có tổng quan + subprojects thật sự clone được
    README.md                    ← copy từ boilerplate
    .git/                        ← git repo riêng của workspace
    backend/                     ← subproject (git repo riêng)
    frontend/                    ← subproject (git repo riêng)
```

## Trigger

```
/init-workspace
```

## Flow

### Bước 1: Thu thập thông tin

Hỏi user từng câu một. Nếu user trả lời trống hoặc "skip" cho câu tuỳ chọn → bỏ qua.

**Câu 1 (bắt buộc): Workspace name**

```
Tên workspace? (vd: ordertracking-workspace)
→ Chỉ cho phép: chữ thường, số, dấu gạch ngang
→ Folder sẽ được tạo tại: <boilerplate-dir>/<workspace-name>/
```

- Validate regex: `^[a-z0-9][a-z0-9-]*[a-z0-9]$` (nếu 1 ký tự: `^[a-z0-9]$`)
- Nếu không hợp lệ → giải thích, hỏi lại
- Nếu folder đã tồn tại → báo lỗi, hỏi chọn tên khác hoặc xác nhận ghi đè

**Câu 2 (bắt buộc): App name**

```
Tên app hiển thị? (vd: Order Tracking)
→ Sẽ được ghi vào CLAUDE.md của workspace
```

**Câu 3 (tuỳ chọn): GitLab remote URL cho workspace**

```
GitLab remote URL cho workspace? (vd: git@gitlab.com:megamind/ordertracking-workspace.git)
→ Nhập 'skip' hoặc Enter để bỏ qua (có thể thêm sau)
```

- Nếu user trả lời "skip", "không có", trống → `REMOTE_URL = none`
- **KHÔNG** hỏi lại, **KHÔNG** báo lỗi

**Câu 4 (tuỳ chọn): Subprojects**

```
Các dự án con muốn kéo vào workspace?
→ Format: "<folder-name> <git-url>" hoặc "<folder-name>: <git-url>" (1 project/dòng)
→ Nhập 'done' hoặc Enter để kết thúc
→ Nhập 'skip' nếu chưa có

Ví dụ:
  backend git@gitlab.com:megamind/ordertracking-backend.git
  frontend: git@gitlab.com:megamind/ordertracking-frontend.git
  done
```

**Parse rules:**
- **Split mỗi dòng tại khoảng trắng ĐẦU TIÊN** để tách `folder-token` và `url`. KHÔNG split trên `:` — vì URL SSH bản thân chứa `:` (vd `git@gitlab.com:org/repo.git`).
- Sau khi tách xong, **strip dấu `:` ở cuối folder-token** (cho phép cả `backend:` và `backend` làm folder-name).
- Nếu user paste nhiều dòng cùng lúc → parse tất cả, KHÔNG hỏi lại "are you done?". User có thể sửa ở Bước 2 (confirm).
- Nếu user trả lời "skip", "done", trống → danh sách rỗng.

**Ví dụ parse:**
- `backend: git@gitlab.com:org/repo.git` → folder `backend`, url `git@gitlab.com:org/repo.git` ✓
- `backend git@gitlab.com:org/repo.git` → folder `backend`, url `git@gitlab.com:org/repo.git` ✓
- ❌ `split(":")` sai: tạo ra 3 phần `["backend", " git@gitlab.com", "org/repo.git"]`.

### Bước 2: Xác nhận

Hiển thị summary **CHỈ những gì user đã cung cấp**. Mục skip ghi rõ:

```
╔══════════════════════════════════════════════════════════════════╗
║                    Init Workspace Summary                        ║
╠══════════════════════════════════════════════════════════════════╣
  Workspace:    age-workspace
  Location:     /path/to/boilerplate/age-workspace/
  App name:     Age Verification
  Remote:       git@gitlab.com:megamind/age-workspace.git
                (hoặc: "— chưa có, sẽ thêm sau")
  Subprojects:
    - backend/   ← git@gitlab.com:megamind/age-backend.git
    - frontend/  ← git@gitlab.com:megamind/age-frontend.git
                (hoặc: "— không có subproject")
╚══════════════════════════════════════════════════════════════════╝

Proceed? [Y/n]
```

Chờ user confirm. Nếu "no" → hỏi sửa gì, quay lại câu hỏi đó.

### Bước 3: Thực hiện

Sau khi user confirm, thực hiện theo đúng thứ tự dưới đây. Dùng absolute path cho tất cả Bash calls.

Biến dùng chung (hãy resolve trước):
- `$BOILERPLATE_DIR` = thư mục làm việc hiện tại (boilerplate root)
- `$WORKSPACE_DIR` = `$BOILERPLATE_DIR/$WORKSPACE_NAME`

#### 3.1 Tạo folder workspace

```bash
mkdir -p "$WORKSPACE_DIR"
```

#### 3.2 Copy scaffold từ boilerplate vào workspace

```bash
cp -r "$BOILERPLATE_DIR/.claude" "$WORKSPACE_DIR/.claude"
cp -r "$BOILERPLATE_DIR/chrome-profile" "$WORKSPACE_DIR/chrome-profile"
cp -r "$BOILERPLATE_DIR/docs" "$WORKSPACE_DIR/docs"
cp "$BOILERPLATE_DIR/README.md" "$WORKSPACE_DIR/README.md"
```

**KHÔNG copy:**
- `.git` (boilerplate git repo)
- `.gitignore` (sẽ generate riêng)
- `CLAUDE.md` (sẽ generate mới ở bước 3.6 sau khi biết kết quả clone)
- Folder workspace khác nếu tồn tại

#### 3.3 Xoá skill init-workspace khỏi workspace

```bash
rm -rf "$WORKSPACE_DIR/.claude/skills/init-workspace"
```

Skill này chỉ dùng 1 lần. Giữ nguyên trong boilerplate.

#### 3.4 Generate .gitignore cho workspace

Ghi file `$WORKSPACE_DIR/.gitignore`:

```
# Secrets & credentials
resources.md

# Browser session data
chrome-profile/

# Subprojects (managed by their own git repos)
<folder-name>/   # chỉ thêm nếu có subprojects — 1 dòng mỗi folder
...

# Dependencies
node_modules/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# Build output
dist/
build/
.cache/

# Environment
.env
.env.*
```

#### 3.5 Clone subprojects (VỚI SSH→HTTPS fallback)

**Chỉ thực hiện nếu có subprojects.** Chạy song song nhiều subproject bằng multiple Bash calls trong 1 message.

Với mỗi subproject:

**Quan trọng — chặn hang:** luôn set `GIT_TERMINAL_PROMPT=0` để git không hỏi username/password tương tác (sẽ treo forever trong tool call). Và luôn dùng Bash với `timeout` ≤ 60000ms (60s) cho mỗi attempt, để host unreachable không làm cả flow hang 2 phút mỗi lần.

**Step 1 — Thử SSH URL (URL user cung cấp):**

```bash
GIT_TERMINAL_PROMPT=0 git clone "$SUBPROJECT_URL" "$WORKSPACE_DIR/$FOLDER_NAME" 2>&1
```
(Bash tool call: set `timeout: 60000`.)

**Step 2 — Nếu SSH fail (exit code ≠ 0), thử HTTPS fallback:**

Convert SSH URL → HTTPS URL:
- `git@<host>:<path>.git` → `https://<host>/<path>.git`
- Ví dụ: `git@gitlab.xipat.com:megaminds/megamind-age-verify-backend.git` → `https://gitlab.xipat.com/megaminds/megamind-age-verify-backend.git`

```bash
GIT_TERMINAL_PROMPT=0 git clone "$HTTPS_URL" "$WORKSPACE_DIR/$FOLDER_NAME" 2>&1
```
(Bash tool call: set `timeout: 60000`.)

Thông báo user: `"SSH clone failed, thử HTTPS fallback..."`

**Không skip HTTPS fallback** kể cả khi nhìn URL/host "có vẻ không tồn tại". Lý do cho skip phải là exit code thật từ SSH attempt, không phải suy đoán.

**Step 3 — Nếu cả hai đều fail:**

- Log warning, **KHÔNG dừng flow**, tiếp tục clone các subproject còn lại:
  ```
  ⚠️ Clone <folder>/ failed (cả SSH và HTTPS).
     SSH URL: <ssh-url>
     HTTPS URL: <https-url>
     Có thể do: chưa kết nối VPN, không có quyền access, hoặc repo không tồn tại.
     Bạn có thể clone sau khi fix: cd <workspace-path> && git clone <url> <folder>
  ```
- Ghi nhận trạng thái `FAILED` cho subproject này để dùng ở bước 3.6.

**Ghi nhận kết quả:** với mỗi subproject, lưu:
- `folder_name`
- `url_used` (ssh hoặc https)
- `status` (success / failed)

#### 3.6 Phân tích subprojects và generate CLAUDE.md workspace

Với mỗi subproject **clone thành công**, đọc metadata:

1. **Tech stack detection** — đọc các file sau (nếu có):
   - `package.json` → name, description, dependencies (React, Next, Express, Vue, Nuxt, Shopify Polaris, Remix...)
   - `composer.json` → PHP / Laravel
   - `requirements.txt` / `pyproject.toml` → Python / Django / FastAPI
   - `go.mod` → Go
   - `Gemfile` → Ruby / Rails
   - `pom.xml` / `build.gradle` → Java / Spring Boot
   - `README.md` → đọc 50 dòng đầu để lấy mô tả dự án

2. **Claude setup check** — kiểm tra trong subproject:
   - Có `CLAUDE.md` không?
   - Có `.claude/` không?
   - Ghi nhận: `has_claude_md`, `has_claude_dir`

3. **Generate CLAUDE.md workspace** — ghi file mới `$WORKSPACE_DIR/CLAUDE.md` với cấu trúc:

```markdown
# CLAUDE.md — <App name>

Workspace for <App name>. This file provides guidance to Claude Code when working across the subprojects in this workspace.

## Workflow

This workspace uses the 4-phase AI-assisted development workflow installed by megamind-ai-boilerplate:

1. **Explore Story** (`/explore-story`) — research feasibility, write user story
2. **Create Test Case** (`/create-test-case`) — generate manual test cases
3. **Implement** (`/brainstorming ... read @US and @TC`) — brainstorm → plan → TDD
4. **Verify & Sync** (`/self-test`) — run test cases, sync docs

See the copied sections at the bottom for full workflow rules.

## Subprojects

<!-- chỉ generate nếu có subprojects -->

Workspace này gồm các dự án con, mỗi dự án có git repo riêng:

| Folder | Repo | Stack | Claude setup |
|--------|------|-------|--------------|
| `backend/` | git@gitlab.com:...backend.git | Node.js + Express (detected từ package.json) | ✅ CLAUDE.md + .claude/ |
| `frontend/` | git@gitlab.com:...frontend.git | Next.js 14 + Shopify Polaris | ⚠️ Chưa có CLAUDE.md — chạy `/init` trong `frontend/` để tạo |
| `<folder>/` | — | ⚠️ Clone failed — chưa có data | — |

### Tổng quan từng subproject

#### `backend/` — <Detected name / App Backend>
<Từ README / package.json description: 2-3 câu mô tả>
- Tech stack: <framework chính + key libraries>
- Entry points: <nếu phát hiện được từ package.json scripts>

#### `frontend/` — <Detected name>
<mô tả tương tự>

### Mối tương quan giữa các subprojects

<!-- Claude suy luận dựa trên stack detected -->
<Ví dụ tự động suy luận, ví dụ:>
- `backend/` cung cấp REST API (hoặc GraphQL nếu phát hiện apollo-server) cho `frontend/`.
- `frontend/` gọi backend qua API URL cấu hình trong `.env` (xem file env.example trong từng project).
- Cả hai độc lập về deployment, release riêng.

> **Lưu ý:** Phần này là phân tích ban đầu từ metadata. Hãy xác nhận/cập nhật khi làm việc thực tế với code.

## Commit rules cho workspace

- Commit trong workspace chỉ chứa thay đổi về scaffold (`.claude/`, `docs/`, config shared).
- Commit trong subproject: `cd <subproject>/` rồi commit ở đó (có git repo riêng).
- Không auto-commit.

<!-- Copy nguyên section "Workflow rules that override defaults" từ boilerplate CLAUDE.md -->
```

**Chi tiết thêm:**

- Nếu một subproject fail clone → ghi trong bảng với trạng thái `⚠️ Clone failed` và bỏ qua phần "Tổng quan" cho subproject đó (vì chưa có data).
- Nếu subproject thiếu `CLAUDE.md` → cột "Claude setup" ghi `⚠️ Chưa có CLAUDE.md — gợi ý chạy /init`.
- Nếu không detect được tech stack → ghi `(Không rõ — kiểm tra README)`.
- Section "Mối tương quan" chỉ viết khi có ≥ 2 subprojects clone thành công.
- **Luôn copy section "Workflow rules that override defaults"** từ boilerplate CLAUDE.md để workspace giữ được contract của workflow.

#### 3.7 Init git cho workspace

```bash
git init -b main "$WORKSPACE_DIR"
git -C "$WORKSPACE_DIR" add -A
git -C "$WORKSPACE_DIR" commit -m "Initial commit from megamind-ai-boilerplate

Workspace: $WORKSPACE_NAME
App: $APP_NAME"
```

**Lưu ý:** dùng `git -C <path>` thay vì `cd`, vì `cd` không persist giữa Bash calls.

#### 3.8 Set remote và push

**Chỉ thực hiện nếu REMOTE_URL != none.**

```bash
git -C "$WORKSPACE_DIR" remote add origin "$REMOTE_URL"
git -C "$WORKSPACE_DIR" push -u origin main
```

- Nếu push fail (SSH timeout, repo chưa tồn tại trên GitLab, etc.):
  - Thử HTTPS fallback (nếu URL là SSH) bằng cách đổi remote URL và push lại.
  - Vẫn fail → log warning, KHÔNG dừng flow:
    ```
    ⚠️ Push failed (cả SSH và HTTPS).
    Bạn có thể push sau bằng: git -C <workspace-path> push -u origin main
    ```

- Nếu REMOTE_URL = none → skip hoàn toàn. Log:
  ```
  Skip remote — chưa có URL. Thêm sau bằng:
    git -C <workspace-path> remote add origin <url>
    git -C <workspace-path> push -u origin main
  ```

#### 3.9 Cập nhật .gitignore của boilerplate

Thêm workspace folder vào `.gitignore` của boilerplate (nếu chưa có):

- Đọc `$BOILERPLATE_DIR/.gitignore`
- Nếu đã có dòng `$WORKSPACE_NAME/` → skip
- Nếu chưa có → append:
  ```
  
  # Workspace
  <workspace-name>/
  ```

### Bước 4: Hiển thị kết quả

```
Workspace initialized!

  Location:     /path/to/boilerplate/age-workspace/
  App name:     Age Verification
  Remote:       git@gitlab.com:megamind/age-workspace.git (pushed)
                (hoặc: "— chưa cấu hình" / "⚠️ push failed")
  Branch:       main
  Subprojects:
    backend/    ✅ cloned (SSH) — Node.js + Express — has CLAUDE.md
    frontend/   ✅ cloned (HTTPS fallback) — Next.js — ⚠️ no CLAUDE.md
                (hoặc: "⚠️ failed" / "— không có subproject")

  Boilerplate:  giữ nguyên tại /path/to/boilerplate/ (đã thêm vào .gitignore)

Next steps:
  1. cd <workspace-path>
  2. Tạo resources.md (TASK_LIST_URL, LARK_NOTIFY_URL, ...)
  <!-- chỉ hiển thị nếu có subproject chưa có CLAUDE.md -->
  3. cd <subproject>/ và chạy /init để tạo CLAUDE.md riêng cho subproject đó
  <!-- chỉ hiển thị nếu có clone failed -->
  4. Khi VPN ổn, clone lại các subproject failed (lệnh đã in ở trên)
  <!-- chỉ hiển thị nếu REMOTE_URL = none -->
  5. git remote add origin <url> && git push -u origin main
  6. Start using skills: /explore-story, /create-test-case, etc.
```

**Logic hiển thị next steps:**
- Luôn hiển thị step 1 (`cd`) và step tạo resources.md
- Chỉ hiển thị step "init Claude trong subproject" nếu có subproject thiếu CLAUDE.md
- Chỉ hiển thị step "re-clone failed subprojects" nếu có clone failed
- Chỉ hiển thị step push nếu chưa push
- Đánh số lại tuần tự, bỏ các step không áp dụng

## Xử lý lỗi

| Tình huống | Xử lý |
|-----------|-------|
| User trả lời "skip"/"không có"/trống cho câu tuỳ chọn | Ghi nhận skip, tiếp tục |
| Workspace name không hợp lệ | Giải thích regex, hỏi lại |
| Folder workspace đã tồn tại | Báo lỗi, hỏi chọn tên khác hoặc xác nhận ghi đè |
| Subproject input format sai | Parse nới lỏng (space / `:`), strip trailing `:`, thử lại |
| SSH clone fail | Tự động thử HTTPS fallback trước khi bỏ cuộc |
| Cả SSH và HTTPS fail | Warning, tiếp tục clone project khác, gợi ý lệnh manual |
| Push fail | Thử HTTPS fallback (nếu URL là SSH), sau đó warning |
| User "no" ở confirm | Hỏi muốn sửa gì, quay lại câu hỏi đó |
| Copy file fail | Log warning, tiếp tục các file còn lại |
| `package.json` / `README.md` trong subproject không đọc được | Ghi "(Không rõ stack — kiểm tra README)" vào CLAUDE.md, tiếp tục |

## Quy tắc quan trọng khi thực thi

- **Luôn dùng absolute path và `git -C <path>`** trong tool Bash. `cd` không persist giữa các tool call nên tránh hoàn toàn giữa các call riêng lẻ.
- **Chỉ chạy song song các clone** (không có dependency). Các bước copy / git init / commit / push phải tuần tự.
- **Không tự tạo CLAUDE.md trong subproject.** Đó là repo của team khác, tự tạo sẽ làm bẩn git status của họ. Chỉ báo cáo thiếu và gợi ý user chạy `/init` trong subproject đó nếu họ muốn.
- **Initial commit phải sau khi clone subproject xong**, để CLAUDE.md commit ban đầu phản ánh đúng trạng thái thật.
