/**
 * Google Analytics 4 (GA4) Integration Service for Gamers Genge
 * Dynamically loads and handles client-side event & pageview tracking.
 */

// Declare gtag types on window safe from TypeScript compilation issues
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-VS3CFLSWEZ';

/**
 * Initializes the Google Analytics 4 tag dynamically in the head if MEASUREMENT_ID exists.
 */
export function initGoogleAnalytics(): void {
  if (!MEASUREMENT_ID) {
    console.log('📊 Google Analytics: No VITE_GA_MEASUREMENT_ID found in environment. Running in offline/no-tracking mode.');
    return;
  }

  try {
    // Avoid double installation
    if (document.getElementById('google-analytics-script')) {
      return;
    }

    // Create the global dataLayer and gtag handler
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      if (window.dataLayer) {
        window.dataLayer.push(args);
      }
    };

    // Configure standard startup commands
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: false, // We'll trigger page views manually and precisely via React state router
      cookie_flags: 'max-age=7200;Secure;SameSite=None' // Secure and iframe friendlycookie settings
    });

    // Create the async script element
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;

    // Append to document head
    document.head.appendChild(script);
    console.log(`📊 Google Analytics: Successfully initialized Gtag container with ID ${MEASUREMENT_ID}`);
  } catch (error) {
    console.warn('📊 Google Analytics: Initialization error:', error);
  }
}

/**
 * Tracks custom pageviews precisely whenever navigation tabs are switched inside the single-page Router.
 * @param pageName The logical name of the page/tab (e.g., 'home', 'chat', 'details')
 * @param title Optional title of the sub-view
 */
export function trackGAPageView(pageName: string, title?: string): void {
  if (!MEASUREMENT_ID || !window.gtag) return;

  try {
    window.gtag('event', 'page_view', {
      page_title: title || `${pageName.toUpperCase()} | Gamers Genge`,
      page_location: `${window.location.origin}/#${pageName}`,
      page_path: `/#${pageName}`,
      send_to: MEASUREMENT_ID
    });
  } catch (error) {
    console.warn('📊 Google Analytics: Failed to track page view:', error);
  }
}

/**
 * Tracks interactive user events (clicks, buttons, creators, codes etc.)
 * @param action Name of action (e.g. 'Button Click', 'Created Kijiwe', 'Room Code Posted')
 * @param category Broad categorization (e.g. 'Engagement', 'Matchmaking', 'Community')
 * @param label Descriptive value detail (e.g. game title, kijiwe name)
 * @param value Incremental numeric value
 */
export function trackGAEvent(action: string, category: string, label?: string, value?: number): void {
  if (!MEASUREMENT_ID || !window.gtag) return;

  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  } catch (error) {
    console.warn('📊 Google Analytics: Failed to track custom event:', error);
  }
}
