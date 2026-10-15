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

## 2. 内网看板服务器

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

现有看板必须运行、dist 必须为 contract 7、数据库必须使用验证证书的 PostgreSQL TLS 配置。该脚本不安装或修改原看板，不执行数据库迁移，不修改 Nginx 或重启人员 API。

新增 `omni-daq-overview-publish.service` 为只运行一次的任务，`omni-daq-overview-publish.timer` 每次结束约 60 秒后再次运行，开机自动恢复。一次任务从数据库读取真实数据、过滤公开字段并向 `https://daq.omni-intel.cn/api/internal/overview` 推送。公网站点的 HTTPS 接口需可从内网访问；两端系统时钟应正常同步。

## 3. 验证后才算上线完成

内网安装脚本必须输出 `Fresh aggregate delivered to public DAQ`。否则查看：

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

等待约一分钟后再次检查，`updatedAt` 应前进，`stale` 为 false。浏览器访问 `/products/neural-data` 核对数据，点击“了解更多”应显示“系统升级中，敬请期待”；原官网导航、联系表单正常。

首次同步前页面会显示等待数据提示；不会把演示或过期静态数值冒充最新数据。超过三分钟未收到有效更新时显示更新失败提示并保留最后数据。存储文件为公网 `/var/lib/omni-daq-overview/latest.json`，不位于公开资源目录。POST 签名过期、内容变动、未知密钥均被拒绝，旧统计不能覆盖新统计。

## 停用与回退

只停用新增推送：在内网执行 `systemctl disable --now omni-daq-overview-publish.timer`，不影响原看板。公网数据随后会标记更新失败。

官网回退应使用部署前记录的已验证 Git 提交，重新安装依赖、构建并重启原 `omni-daq.service`。保留原环境文件。无需变更数据库或人员服务；新增 drop-in 和私有汇总文件可先保留，避免丢失回退后的排查信息。
