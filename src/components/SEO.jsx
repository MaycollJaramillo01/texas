import { Helmet } from "react-helmet-async";
import { SITE_URL, buildBreadcrumbJsonLd, seoDefaults } from "../data/company";

/**
 * Per-page SEO. Renders into <head> via react-helmet-async.
 * Includes title, meta description, canonical, OG, Twitter, breadcrumbs.
 */
export default function SEO({
  title,
  description,
  keywords,
  path = "/",
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  type = "website",
  noindex = false,
  breadcrumbs,
  jsonLd,
  modifiedTime = "2026-06-10",
}) {
  const fullTitle = title ? `${title} | ${seoDefaults.siteName}` : seoDefaults.defaultTitle;
  const fullDescription = description || seoDefaults.defaultDescription;
  const fullKeywords = keywords || seoDefaults.keywords.join(", ");
  const canonical = `${SITE_URL}${path}`;
  const ogImage = encodeURI(image || seoDefaults.defaultImage);
  const ogImageAlt = imageAlt || seoDefaults.defaultImageAlt;
  const jsonLdItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content={seoDefaults.author} />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en-US" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
      />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      {imageWidth && <meta property="og:image:width" content={String(imageWidth)} />}
      {imageHeight && <meta property="og:image:height" content={String(imageHeight)} />}
      <meta property="og:site_name" content={seoDefaults.siteName} />
      <meta property="og:locale" content={seoDefaults.locale} />
      <meta property="og:updated_time" content={modifiedTime} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {/* Breadcrumb structured data */}
      {breadcrumbs && (
        <script type="application/ld+json">
          {JSON.stringify(buildBreadcrumbJsonLd(breadcrumbs))}
        </script>
      )}

      {/* Optional extra structured data per page */}
      {jsonLdItems.map((item) => (
        <script key={item["@id"] || item.name || item["@type"]} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
