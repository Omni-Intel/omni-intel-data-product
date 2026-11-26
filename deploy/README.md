# DAQ 公网发布

官网始终部署在 `101.96.206.209:/var/www/omni-intel-data-product`，由 `omni-daq.service` 管理，端口 3100。`172.16.2.11` 仅运行汇总推送任务，网页不迁移到内网。公网无法直连内网是已验证的现状，因此采用内网向公网 HTTPS 推送，不新增内网对公网监听端口。

## 1. 公网 DAQ 服务器

在公网服务器以 root 执行。保留当前服务器专有环境文件，不用本机 `.env.local` 覆盖。

```bash
cd /var/www/omni-intel-data-product
git status --short
git pull --ff-only origin main &&
pnpm install --frozen-lockfile &&
pnpm test &&
pnpm run build &&
bash deploy/prepare-daq.sh &&
systemctl restart omni-daq.service
```

如 `git status` 有服务器本地修改，先保留并处理这些修改；不要强制重置。准备脚本只新增 `omni-daq.service.d/overview.conf`，不会覆盖原服务或原环境配置。

脚本生成 `/etc/omni-daq-overview/publish.key`，只在首次创建，重跑不会换密钥。通过自己的安全文件传输工具将该文件复制到内网服务器，例如 `/root/daq-publish.key`。不要在聊天、Git、公开网页或日志中粘贴其内容。它只用于汇总推送签名，与原看板登录和数据库凭据无关。

## 2. 内网看板服务器（当前 Docker Compose）

当前生产看板和推送任务由 `/srv/omni/dashboard/compose.yaml` 管理。`overview-publisher` 和 `overview-publisher-scheduler` 必须复用 `web` 的只读应用挂载 `./app/dashboard`、容器工作目录和专用数据库隧道端口。`OMNI_DASHBOARD_DIR` 要与工作目录相同。发布前用临时任务验证读取及汇总结果，发布时只重建推送调度容器。更新看板应用挂载或替换宿主发布目录时，要同步重建发布任务，确保两个进程加载同一份构建。

```bash
cd /srv/omni/dashboard
docker compose --profile jobs run --rm --no-deps -T overview-publisher
docker compose up -d --no-deps --force-recreate overview-publisher-scheduler
docker compose logs --tail 15 overview-publisher-scheduler
```

2026-11-26 切换时保留了原 Compose 配置 `/srv/omni/dashboard/compose.yaml.before-daq-sync.wNCZ1bxk`，以及公网原构建 `/var/www/.omni-daq-sync.z8aAID52/dist.previous`。

以下为历史 systemd 安装方式，当前 Docker Compose 生产环境应使用上面的配置。

将随本次更新提供的 `omni-daq-publisher.tar.gz` 上传至 `172.16.2.11` 的 `/root`。包仅含推送代码及安装脚本，不含数据库配置、密钥或真实数据。也可在公网仓库目录生成同样的包：

```bash
tar -czf /root/omni-daq-publisher.tar.gz \
  server/public-overview.mjs server/published-overview.mjs \
  server/overview-service.mjs server/publish-overview.mjs \
  deploy/install-publisher.sh
```

内网服务器以 root 执行：

```bash
mkdir -p /root/omni-daq-publisher
tar -xzf /root/omni-daq-publisher.tar.gz -C /root/omni-daq-publisher
cd /root/omni-daq-publisher
bash deploy/install-publisher.sh /root/daq-publish.key
```

脚本读取现有 `omni-dashboard-intra.service` 的运行用户和实际工作目录，复用 `/etc/omni-dashboard-intra/credentials.env`，不会复制这些数据库/业务凭据到公网。若实际名称或环境文件已更换，可使用第三、第四参数：

```bash
bash deploy/install-publisher.sh /root/daq-publish.key 实际看板.service /绝对路径/credentials.env
```

现有看板必须运行、`dist` 必须为 contract 7 且支持 QC 字段投影，数据库必须使用验证证书的 PostgreSQL TLS 配置。该脚本不安装或修改原看板，不执行数据库迁移，不修改 Nginx 或重启人员 API。

安装器会显式设置推送程序各级目录的访问权限，并以实际服务账号逐个检查脚本可读性与语法，检查通过后才安装服务单元。

新增 `omni-daq-overview-publish.service` 为只运行一次的任务，`omni-daq-overview-publish.timer` 每次结束约 60 秒后再次运行，开机自动恢复。一次任务从数据库读取真实数据、过滤公开字段并向 `https://daq.omni-intel.cn/api/internal/overview` 推送。公网站点的 HTTPS 接口需可从内网访问；两端系统时钟应正常同步。

全量读取使用只读事务，单条数据库查询最多 30 秒，推送服务总期限为 75 秒（含数据库连接、汇总和 HTTPS 推送）。日志保留 SQLSTATE / 网络错误代码，不输出凭据或原始记录。出现 `57014` 表示查询被取消，应结合实际查询耗时排查数据库负载、锁等待及执行计划；健康检查成功只代表简单连接可用，不能证明全量统计查询已成功。

## 3. 验证后才算上线完成

当前 Compose 调度器应持续输出 `Aggregate synchronized`，其中时间戳应前进。历史 systemd 安装脚本成功时输出 `Fresh aggregate delivered to public DAQ`，旧部署可用以下命令排查：

```bash
systemctl status omni-daq-overview-publish.service --no-pager
systemctl list-timers omni-daq-overview-publish.timer --no-pager
journalctl -u omni-daq-overview-publish.service -n 15 --no-pager
```

公网服务器执行：

```bash
curl -fsS https://daq.omni-intel.cn/api/public-overview | node -e '
let text=""; process.stdin.on("data",chunk=>text+=chunk);
process.stdin.on("end",()=>{const d=JSON.parse(text); console.log({updatedAt:d.updatedAt,selectedDate:d.selectedDate,stale:d.sourceRefreshFailed}); if(d.sourceRefreshFailed)process.exitCode=1;});'
```

等待约一分钟后再次检查，`updatedAt` 应前进，`stale` 为 false。浏览器访问 `/products/neural-data`，与主看板在同一日期、无筛选、使用通道小时的视图核对。公开页「质量通过率」与主看板顶部共用 `usableRate`；旧快照没有该字段时显示 `—`。点击“了解更多”应显示“系统升级中，敬请期待”；原官网导航、联系表单正常。

首次同步前页面会显示等待数据提示；不会把演示或过期静态数值冒充最新数据。超过三分钟未收到有效更新时显示更新失败提示并保留最后数据。存储文件为公网 `/var/lib/omni-daq-overview/latest.json`，不位于公开资源目录。POST 签名过期、内容变动、未知密钥均被拒绝，旧统计不能覆盖新统计。

## 停用与回退

只停用新增推送：在内网执行 `systemctl disable --now omni-daq-overview-publish.timer`，不影响原看板。公网数据随后会标记更新失败。

官网回退应使用部署前记录的已验证 Git 提交，重新安装依赖、构建并重启原 `omni-daq.service`。保留原环境文件。无需变更数据库或人员服务；新增 drop-in 和私有汇总文件可先保留，避免丢失回退后的排查信息。
