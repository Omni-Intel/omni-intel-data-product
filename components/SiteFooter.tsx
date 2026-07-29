export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <span>© {new Date().getFullYear()} 全域智能 / Omni-Intelligence</span>
        <a
          className="site-footer__filing"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          粤ICP备2026043468号-1
        </a>
      </div>
    </footer>
  );
}
