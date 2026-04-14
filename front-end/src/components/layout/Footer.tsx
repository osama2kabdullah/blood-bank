export function Footer() {
  const year = new Date().getFullYear()

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
      <p>
        {year} Blood Bank Bangaldesh
      </p>
      <p>
        Developed by{' '}
        <a
          href="https://www.linkedin.com/in/md-abdullah-9121b5228"
          target="_blank"
          rel="noopener noreferrer"
        >
          Osama Abdullah
        </a>
      </p>
    </footer>
  )
}
