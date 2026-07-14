import NavBar from './core/navbar'

/**
 * Shell - Shared layout wrapper for Home and CaseStudy routes
 *
 * Provides:
 * - Background and chrome
 * - Bottom dock with NavBar
 * - Container with @container context
 * - Swappable header slot
 */
export default function Shell({ header, children, isExpanded = false, preventScroll = false, isHome = false }) {
  return (
    <div className={`shell ${preventScroll ? 'shell--no-scroll' : ''}`}>
      <div className="shell__bg" aria-hidden="true" />

      {/* Bottom dock */}
      <nav className="shell__dock" aria-label="Site navigation">
        <NavBar />
      </nav>

      {/* Main container with @container context */}
      <main
        className={`shell__container ${isExpanded ? 'shell__container--expanded' : 'shell__container--compact'}`}
      >
        {/* Header slot - swaps between bio (Home) and controls (CaseStudy) */}
        {header && (
          <header className="shell__header">
            {header}
          </header>
        )}

        {/* Content area */}
        <div className={`shell__content ${isHome ? 'shell__content--home' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
