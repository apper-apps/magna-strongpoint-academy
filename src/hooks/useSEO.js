import { useState, useEffect } from 'react';
import { seoDefaultsService } from '@/services/api/seoDefaultsService';
import { schemaMarkupService } from '@/services/api/schemaMarkupService';

export const useSEO = () => {
  const [seoDefaults, setSeoDefaults] = useState(null);
  const [schemaMarkup, setSchemaMarkup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSEOData();
  }, []);

  const loadSEOData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [seoData, schemaData] = await Promise.all([
        seoDefaultsService.getAll(),
        schemaMarkupService.getAll()
      ]);
      
      setSeoDefaults(seoData[0] || null);
      setSchemaMarkup(schemaData[0] || null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading SEO data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePageSEO = (pageTitle, pageDescription, pageImage) => {
    if (!seoDefaults) return;

    // Update title
    const fullTitle = pageTitle + (seoDefaults.title_suffix || '');
    document.title = fullTitle;
    
    // Update meta tags
    const titleElement = document.getElementById('dynamic-title');
    if (titleElement) titleElement.textContent = fullTitle;
    
    const descElement = document.getElementById('dynamic-description');
    if (descElement) descElement.setAttribute('content', pageDescription || seoDefaults.meta_description || '');
    
    const ogTitleElement = document.getElementById('dynamic-og-title');
    if (ogTitleElement) ogTitleElement.setAttribute('content', fullTitle);
    
    const ogDescElement = document.getElementById('dynamic-og-description');
    if (ogDescElement) ogDescElement.setAttribute('content', pageDescription || seoDefaults.meta_description || '');
    
    const ogImageElement = document.getElementById('dynamic-og-image');
    if (ogImageElement) ogImageElement.setAttribute('content', pageImage || seoDefaults.og_image || '/images/og-default.png');
    
    const twitterTitleElement = document.getElementById('dynamic-twitter-title');
    if (twitterTitleElement) twitterTitleElement.setAttribute('content', fullTitle);
    
    const twitterDescElement = document.getElementById('dynamic-twitter-description');
    if (twitterDescElement) twitterDescElement.setAttribute('content', pageDescription || seoDefaults.meta_description || '');
    
    const twitterImageElement = document.getElementById('dynamic-twitter-image');
    if (twitterImageElement) twitterImageElement.setAttribute('content', pageImage || seoDefaults.og_image || '/images/og-default.png');
  };

  const updateStructuredData = (data) => {
    if (!schemaMarkup) return;

    const structuredDataElement = document.getElementById('structured-data');
    if (structuredDataElement) {
      const baseSchema = {
        "@context": "https://schema.org",
        "@type": schemaMarkup.type || "Course",
        "provider": {
          "@type": "Organization",
          "name": schemaMarkup.provider || "JuntaeSchool"
        }
      };
      
      const mergedSchema = { ...baseSchema, ...data };
      structuredDataElement.textContent = JSON.stringify(mergedSchema, null, 2);
    }
  };

  return {
    seoDefaults,
    schemaMarkup,
    loading,
    error,
    updatePageSEO,
    updateStructuredData,
    loadSEOData
  };
};