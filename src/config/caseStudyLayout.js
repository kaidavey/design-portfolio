/**
 * Case Study Layout Configuration
 */

export const CASE_STUDY_LAYOUT = {
  // Compact mode (with gray container at bottom)
  compact: {
    // Gray container width as percentage of viewport
    containerWidth: '90%',

    // Maximum width for the gray container (set to null for no max)
    containerMaxWidth: '950px',

    // Gray container height as percentage of viewport
    containerHeight: '87vh', // ~87% of viewport height from Paper design

    // Content width as percentage of container (content inside gray box)
    contentWidthPercent: '90%',

    // Vertical padding for content blocks inside gray container
    contentPaddingTop: '40px',
    contentPaddingBottom: '40px',
  },

  // Expanded mode (no gray container)
  expanded: {
    // Content width as percentage of viewport
    contentWidth: '60%',

    // Maximum width for content blocks
    contentMaxWidth: '907px', // Set to null or change to adjust max-width
  },
}
