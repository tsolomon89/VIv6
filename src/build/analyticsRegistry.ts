/**
 * Analytics Registry - GTM Code Injection
 * 
 * Generates the proper GTM code snippets for injection into the build output.
 * Each brand/domain can have its own GTM Container ID.
 */

export interface AnalyticsConfig {
    gtmId?: string;          // GTM Container ID (e.g., 'GTM-XXXXXXX')
    gaId?: string;           // Google Analytics 4 Measurement ID (e.g., 'G-XXXXXXXXXX')
    fbPixelId?: string;      // Facebook Pixel ID
    customScripts?: string[]; // Custom script URLs to inject
}

/**
 * Generate GTM head snippet
 * Should be placed as high in the <head> as possible
 */
export function generateGTMHead(gtmId: string, dataLayerName: string = 'dataLayer'): string {
    if (!gtmId || !gtmId.startsWith('GTM-')) {
        console.warn(`Invalid GTM ID: ${gtmId}`);
        return '';
    }
    
    const dlParam = dataLayerName !== 'dataLayer' ? `&l=${dataLayerName}` : '';
    
    return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','${dataLayerName}','${gtmId}');</script>
<!-- End Google Tag Manager -->`;
}

/**
 * Generate GTM body (noscript) snippet
 * Should be placed immediately after the opening <body> tag
 */
export function generateGTMBody(gtmId: string): string {
    if (!gtmId || !gtmId.startsWith('GTM-')) {
        return '';
    }
    
    return `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
}

/**
 * Generate GA4 script tag
 */
export function generateGA4(gaId: string): string {
    if (!gaId || !gaId.startsWith('G-')) {
        return '';
    }
    
    return `<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}');
</script>
<!-- End Google Analytics 4 -->`;
}

/**
 * Generate Facebook Pixel script
 */
export function generateFBPixel(fbPixelId: string): string {
    if (!fbPixelId) {
        return '';
    }
    
    return `<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${fbPixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1"/></noscript>
<!-- End Facebook Pixel -->`;
}

/**
 * Generate all analytics head scripts for a given config
 */
export function generateAnalyticsHead(config: AnalyticsConfig): string {
    const parts: string[] = [];
    
    // GTM goes first (highest priority for loading)
    if (config.gtmId) {
        parts.push(generateGTMHead(config.gtmId));
    }
    
    // GA4 (standalone, if not using GTM for it)
    if (config.gaId && !config.gtmId) {
        parts.push(generateGA4(config.gaId));
    }
    
    // FB Pixel
    if (config.fbPixelId) {
        parts.push(generateFBPixel(config.fbPixelId));
    }
    
    // Custom scripts
    if (config.customScripts?.length) {
        for (const url of config.customScripts) {
            parts.push(`<script src="${url}" async></script>`);
        }
    }
    
    return parts.filter(Boolean).join('\n');
}

/**
 * Generate all analytics body scripts (noscript fallbacks)
 */
export function generateAnalyticsBody(config: AnalyticsConfig): string {
    const parts: string[] = [];
    
    if (config.gtmId) {
        parts.push(generateGTMBody(config.gtmId));
    }
    
    return parts.filter(Boolean).join('\n');
}
