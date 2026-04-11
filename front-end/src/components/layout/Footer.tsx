export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--cds-ui-03)',
        padding: 'var(--cds-spacing-05) var(--cds-spacing-07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 'var(--cds-label-01-font-size)',
        color: 'var(--cds-text-02)',
      }}
    >
      <span>CF React Boilerplate — Production-ready for Cloudflare Pages</span>
      <span>v{__APP_VERSION__}</span>
    </footer>
  )
}
