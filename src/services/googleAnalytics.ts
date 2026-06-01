/**
 * Google Analytics 4 (GA4) Integration Service for GAMES HOME
 * Dynamically loads and handles client-side event & pageview tracking.
 */

// Declare gtag types on window safe from TypeScript compilation issues
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-0T0XPWEYE9';

/**
 * Retrieves or lazily creates a persistent unique anonymous client ID.
 * This guarantees unique visitor telemetry in Google Analytics even when users are not logged in or signed up.
 */
function getOrCreateAnonymousId(): string {
  try {
    let anonId = localStorage.getItem('ga_anonymous_client_id');
    if (!anonId) {
      // Create a cryptographically random, high-entropy fallback guest ID
      const randomSegment = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      anonId = `guest_${randomSegment}`;
      localStorage.setItem('ga_anonymous_client_id', anonId);
    }
    return anonId;
  } catch (e) {
    // Fallback if localStorage is disabled in iframe sandbox or iOS private browsing mode
    return `guest_temp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }
}

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

    const anonymousId = getOrCreateAnonymousId();

    // Configure standard startup commands
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: false, // We'll trigger page views manually and precisely via React state router
      cookie_flags: 'max-age=7200;Secure;SameSite=None', // Secure and iframe friendly cookie settings
      user_id: anonymousId, // Start off identifying as the unique persistent device guest ID
      user_properties: {
        user_status: 'anonymous_visitor',
        platform: 'PWA Web App'
      }
    });

    // Create the async script element
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;

    // Append to document head
    document.head.appendChild(script);
    console.log(`📊 Google Analytics: Successfully initialized Gtag container with ID ${MEASUREMENT_ID} (Device Guest ID: ${anonymousId})`);
  } catch (error) {
    console.warn('📊 Google Analytics: Initialization error:', error);
  }
}

/**
 * Dynamically binds authentic user credentials to Google Analytics on login,
 * or gracefully detaches on logout reverting back to anonymous device id.
 */
export function setGAUser(user: any): void {
  if (!MEASUREMENT_ID || !window.gtag) return;

  try {
    if (user) {
      // User is authenticated
      window.gtag('config', MEASUREMENT_ID, {
        user_id: user.uid,
        user_properties: {
          user_status: 'registered_user',
          email_domain: user.email ? user.email.split('@')[1] : 'unknown',
          auth_provider: user.providerId || 'firebase'
        }
      });
      
      // Also track an explicit auth session upgrade event
      window.gtag('event', 'login_authenticated', {
        event_category: 'Authentication',
        event_label: user.uid
      });
      
      console.log(`📊 Google Analytics: Upgraded tracking context to registered user: ${user.uid}`);
    } else {
      // User is logged out or visiting as a guest
      const anonymousId = getOrCreateAnonymousId();
      window.gtag('config', MEASUREMENT_ID, {
        user_id: anonymousId,
        user_properties: {
          user_status: 'anonymous_visitor'
        }
      });
      console.log(`📊 Google Analytics: Set tracking context to anonymous guest: ${anonymousId}`);
    }
  } catch (error) {
    console.warn('📊 Google Analytics: Failed to set user context:', error);
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
      page_title: title || `${pageName.toUpperCase()} | GAMES HOME`,
      page_location: `${window.location.origin}/#${pageName}`,
      page_path: `/#${pageName}`,
      send_to: MEASUREMENT_ID
    });
  } catch (error) {
    console.warn('📊 Google Analytics: Failed to track page view:', error);
  }
}

/**
 * Tracks interactive user events (clicks, downloads, creators, codes etc.)
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
