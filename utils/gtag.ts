const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages?hl=ko
export const pageview = (url: URL | string) => {
    if (process.env.NODE_ENV !== 'development') {
        window.gtag('config', GA_TRACKING_ID as string, {
            page_path: url
        });
    }
};

type gtagEvent = {
    action: string;
    category: string;
    label: string;
    value: number;
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events?hl=ko
export const event = ({ action, category, label, value }: gtagEvent) => {
    if (process.env.NODE_ENV !== 'development') {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
};
