---
name: Institutional Reliability
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#43474f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#291c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#433000'
  on-tertiary-container: '#c49400'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffdf9e'
  tertiary-fixed-dim: '#fabd00'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

This design system is built for an institutional environment where clarity, authority, and accessibility are paramount. The brand personality is grounded in the reliability of a public sector undertaking, favoring a **Corporate/Modern** aesthetic that prioritizes functional efficiency over decorative flair. 

The visual language utilizes a structured, high-contrast framework to ensure that healthcare providers and patients can navigate complex information without cognitive load. The design avoids trendy consumer-grade effects, opting instead for a stable, systematic layout that evokes trust and officiality. Large touch targets, clear information hierarchy, and a restrained use of color ensure the interface remains accessible to a diverse user base, including elderly patients and busy medical staff.

## Colors

The palette is anchored by **Dark Blue (#003366)**, representing the stability and authority of the institution. This color is used for primary actions, navigation headers, and critical UI anchors. **White (#FFFFFF)** serves as the primary surface color to maintain a "clinical" and clean feel.

**Gold (#FFC107)** is utilized sparingly as an accent color for status indicators, highlighting active states, or drawing attention to critical alerts without the alarming nature of red. The neutral palette consists of cool grays to define borders and background regions, ensuring sufficient contrast for readability and meeting WCAG 2.1 AA standards for accessibility.

## Typography

The typography system relies exclusively on **Inter** to leverage its exceptional legibility and systematic weight distribution. The hierarchy is strictly enforced to differentiate between administrative data (labels) and patient information (body).

- **Headlines:** Use Semi-Bold to Bold weights to anchor page sections.
- **Data Tables:** Use `body-sm` for high-density information to maximize visible data points.
- **Labels:** Use `label-caps` for table headers and form field captions to provide a professional, organized look.
- **Line Height:** Maintain generous leading (1.5x for body) to ensure readability for users with visual impairments.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop to ensure data-heavy tables and forms remain legible and don't stretch excessively on ultrawide monitors. A 12-column grid is used with 24px gutters to create distinct separation between functional modules.

On mobile devices, the layout transitions to a single-column fluid flow with 16px side margins. Spacing is strictly based on an 8px scale, ensuring consistent alignment of form elements and card components. Horizontal padding in tables should be minimized to allow for more data columns, while vertical padding in buttons and inputs should remain large (12px - 16px) to accommodate touch interactions in a clinical environment.

## Elevation & Depth

To maintain a formal and trustworthy appearance, this design system avoids heavy drop shadows. Instead, it utilizes **Low-contrast outlines** and subtle tonal layering:

- **Level 0 (Background):** Light gray (#F8F9FA) to ground the UI.
- **Level 1 (Cards/Surfaces):** Pure white with a 1px solid border (#E9ECEF).
- **Level 2 (Dropdowns/Modals):** A very soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) is used only to indicate temporary overlays.

This "flat-plus" approach ensures the interface feels like an official document rather than a consumer app, emphasizing structural integrity over visual depth.

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding provides a modern touch without sacrificing the professional and serious tone required for a government hospital system. 

- **Inputs and Buttons:** Use 4px corner radius.
- **Cards and Containers:** Use 8px (`rounded-lg`) for larger structural elements.
- **Strictness:** Avoid pill-shaped or circular buttons (except for icons) to maintain a rigid, systematic feel.

## Components

### Buttons
- **Primary:** Solid #003366 background with White text. Bold, rectangular with 4px radius.
- **Secondary:** Transparent background with #003366 border and text.
- **Actionable:** Gold (#FFC107) text is only used for high-priority secondary warnings or toggle states.

### Cards
- Standardized containers with 1px light gray borders. 
- Header areas of cards should have a subtle background tint (#F1F3F5) to separate the title from the content.

### Tables (Critical)
- **Header:** Dark Blue text on a very light gray background.
- **Rows:** Alternating zebra stripes for readability.
- **Cell Padding:** 12px vertical padding to ensure clear separation of patient records.

### Input Fields
- Outlined style with a 1px border. 
- Focus state uses a 2px Dark Blue border.
- Error states use a clear #D32F2F red with supporting helper text.

### Chips/Status Indicators
- Rectangular with slight rounding. 
- Use semantic colors: Green for "Discharged/Stable", Gold for "Pending/Observation", and Dark Blue for "Admitted".

### Navigation
- A persistent left-hand sidebar or top-fixed header using the Primary Dark Blue color to establish the "Official Header" throughout the experience.