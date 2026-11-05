# 高兵兵 3D 简历（ATMOS 版式）

基于 `https://atmos.leeroy.ca/` 的公开前端发行资源，通过 REA 捕获和静态分析恢复的本地项目。已将运行时内容替换为高兵兵的中文简历：3D 场景与 About 面板展示基本信息、技能、项目、开源项目与联系方式。保留原站 Three.js 场景、飞机/云/大象模型、滚动轨迹、天空着色器、音乐/音效、Lottie 按钮及重播。

这是原站**已发布前端的本地化版本**，不是恢复出的原始 Git 仓库，也不是从零重写的 Canvas 2D 示意页面。压缩变量名与工程模块名不能凭发布文件完整还原。`reference/main.readable.js` 是捕获脚本的格式化阅读副本，不是原始开发源码。简历内容由 `scripts/apply-resume-content.mjs` 写入运行时 bundle；重新执行 `prepare-assets.mjs` 前请先备份简历版的 `public/main.js` 与 `public/index.html`。

## 启动

已包含所有运行资源，无需安装依赖即可启动（需要 Node.js 22+）：

```sh
cd /Users/gao/resume/atmos-local
npm run dev
```

打开 <http://127.0.0.1:4173>，点击 **开始查看**，用滚轮、触控板或触屏滑动前进。

- `ArrowDown / ArrowUp / PageDown / PageUp`：前进、后退。
- `关于我`：简历要点与链接；`Escape` 关闭。
- 左侧波形：切换声音；音乐在点击 Explore 后启动。
- 结束画面的 `Explore again`：重新开始。

若端口占用：`PORT=4174 npm run dev`。服务只绑定本机地址。也可以将 `public/` 部署到任意支持普通静态文件的 HTTP 服务，不要直接双击 HTML 使用 `file://`。

## 文件结构

```text
public/
  index.html              本地页面入口
  main.js                 原站发布脚本，已本地化资源 URL 并替换为简历内容
  main.css                原站 CSS，Google 字体已改为本地
  local.js / local.css    加载提示、WebGL 错误提示与键盘/焦点补充
  models/                 飞机、两种云和大象 GLB
  textures/               云雾使用的径向纹理
  draco/                  云模型的本地解码器
  fonts/                  DM Sans 与备用字体
  benchmarks/             原版本 detect-gpu 数据
reference/
  main.readable.js        格式化的原始发布脚本，便于检索分析
  main.readable.css       格式化的原始 CSS
src/data.js               15 条简历要点的可读清单（用于对照，不参与运行）
server.mjs                无第三方运行依赖的静态服务器
scripts/prepare-assets.mjs 从工作区 evidence 和公开 URL 重新准备资源
scripts/verify-assets.mjs 逐个校验资源 SHA-256
scripts/browser-check.mjs 桌面/手机场景验证
asset-manifest.json       资源来源、字节数、原始与本地 SHA-256
verification/            浏览器报告和截图
```

正常使用只需要 `public/`、`server.mjs` 和 `package.json`。不要在没有父目录 `evidence/` 时运行 `prepare-assets.mjs`；它是保留的复现工具，启动与测试不需要重新下载资源。

## 部署

网站是纯静态项目，部署时只需要发布 `public/` 目录。

### Nginx 示例

```nginx
server {
    listen 80;
    server_name resume.example.com;
    root /var/www/resume/public;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|ttf|woff2|glb|mp3|svg|png|json)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
```

### Caddy

```caddy
resume.example.com {
    root * /var/www/resume/public
    encode gzip zstd
    file_server
}
```

### GitHub Pages / Vercel

- GitHub Pages：把 `public/` 作为站点根目录，或通过 CI 上传 `public/` 内容。
- Vercel / Netlify：`public` 为输出目录，无需构建命令。

### 服务器建议

- 开启 gzip / brotli 压缩；TTF、JS、GLB 都是静态资源，压缩收益明显。
- HTML 不缓存或短缓存，其余静态资源设置一年长缓存并带版本号（当前资源 URL 已带 `?resume-20261105`）。
- 确认 MIME 类型：`.glb` 为 `model/gltf-binary`、`.ttf` 为 `font/ttf`、`.mp3` 为 `audio/mpeg`。
- 中文字体已子集化（约 196 KB），首屏资源总量已经可控；如需进一步瘦身，可再压缩音频或按需延迟加载音乐。
- 网站需要 WebGL，访问端浏览器需开启图形加速；音乐在用户点击“开始查看”后才会播放，不受自动播放策略影响。

## 与线上页面的差异

- 删除 Google Tag Manager 和 Cloudflare Rocket Loader，普通 defer 脚本即可运行。
- 字体、Draco 解码器、音乐、模型、GPU 基准数据全部本地化。
- 去除原站返回 404 的 Safari mask-icon 引用。
- 补充加载/WebGL 错误提示、按钮键盘激活、键盘滚动、About 焦点循环与 Escape。
- `prefers-reduced-motion` 减少 DOM 过渡和圆章旋转；3D 场景保留原站持续渲染行为。
- 保留原作者、音乐署名和第三方脚本的 `main.js.LICENSE.txt`。保留的资料来源链接点击后会联网；正常旅程资源加载不需要外网。

原站会随机放置部分对象，重新加载后轨迹方向和内容位置可能变化。不同 GPU/屏幕的画面会略有差别，未宣称逐像素一致。3D 文字使用内置 Noto Sans SC 字体，不依赖系统字体。

## 验证

```sh
npm test
npm run verify:assets
```

浏览器验证是可选开发工具，需要安装开发依赖并有 Chrome：

```sh
npm ci
npm run test:browser
# 非 macOS 默认安装路径：
CHROME_PATH=/absolute/path/to/chrome npm run test:browser
```

桌面 1440×960、手机 390×844 下验证：首页、15 条 references、Enter 开始、PageDown 和滚轮、About 打开/关闭、焦点循环、静音/恢复；桌面还覆盖结束与重播。验证时拦截所有非本地网络请求，要求没有外部请求、404/5xx 或未捕获 JS 错误。

当前报告：`verification/browser-report.json`。手机尺寸为 Chromium 模拟视口，不等同于真实 iPhone/Safari 兼容性验证。

## REA 证据

REA 6.8.0 页面捕获：
`ev_90226fcb850787ae4aba2882c2effee885e98bd8193c59e329b665aabf525338`

REA JavaScript 分析：
`ev_8bc6ee09910ec7405e123a3502138e99bb2938991d0f9d69d0a8d1584e18ff9f`

完整证据保存在父目录 `evidence/`；便携包不包含 53 MB 的分析图，也不依赖它运行。
