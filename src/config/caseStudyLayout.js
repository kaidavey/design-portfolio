/**
 * Case Study Layout Configuration
 *
 * Based on Paper design (1512×1150 artboard):
 * - Container: 1048px × 715px
 * - Positioned at y=196px from top (allowing breadcrumbs at y=57px)
 * - Centered horizontally with vertical offset of -21.5px from center
 */

export const CASE_STUDY_LAYOUT = {
  // Compact mode (floating centered container)
  compact: {
    // Gray container responsive width (1048px / 1512px = 69.3%)
    containerWidth: '60vw',

    // Maximum width for the gray container
    containerMaxWidth: '1048px',

    // Gray container responsive height (715px / 1150px = 62.2%)
    containerHeight: '75vh',

    // Maximum height for the gray container
    containerMaxHeight: '715px',

    // Vertical offset from center as percentage of viewport height (-21.5px / 1150px = -1.87vh)
    // Negative = shift up, positive = shift down
    containerVerticalOffset: '10vh',

    // Border radius for all corners (60px from your specification)
    containerBorderRadius: '60px',

    // Border width
    containerBorderWidth: '2px',

    // Border color
    containerBorderColor: '#D8D8D8',

    // Background color (with alpha for blur effect)
    containerBackgroundColor: 'rgba(242, 242, 242, 0.8)',

    // Backdrop blur amount
    containerBackdropBlur: '8px',

    // Box shadow
    containerBoxShadow:
      'rgba(255, 255, 255, 0.5) -2px 2px 0px inset, rgba(0, 0, 0, 0.04) 0px 10px 20px',

    // Padding inside the container (content fills remaining space after padding)
    // From Paper design: (1048px - 884px content) / 2 = 82px horizontal padding
    contentPaddingTop: '80px',
    contentPaddingRight: '90px',
    contentPaddingBottom: '90px',
    contentPaddingLeft: '90px',

    // Gap between content blocks (Paper design shows 40px gap)
    contentGap: '40px',
  },

  // Expanded mode (no gray container)
  expanded: {
    // Content width as percentage of viewport
    contentWidth: '60%',

    // Maximum width for content blocks
    contentMaxWidth: '907px',
  },
}
