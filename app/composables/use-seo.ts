export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  ogType?: 'website' | 'article' | 'game' | 'profile'
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  canonicalUrl?: string
  structuredData?: Record<string, any>
  robots?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

export const useSEO = () => {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  
  // Default SEO values for the PnutGo app
  const defaultSEO: SEOConfig = {
    title: 'PnutGo - Location-Based Companion Hunting Game',
    description: 'Discover and capture magical companions in the real world with PnutGo. An immersive location-based mobile game featuring interactive maps, daily quests, and achievement badges.',
    keywords: [
      'PnutGo',
      'location-based game',
      'companion hunting',
      'mobile game',
      'augmented reality',
      'GPS game',
      'real world gaming',
      'quest system',
      'achievement badges',
      'interactive map',
      'companion collection',
      'daily challenges'
    ],
    ogType: 'game',
    twitterCard: 'summary_large_image',
    ogImage: '/pnutgo-og-image.jpg',
    robots: 'index, follow',
    author: 'PnutGo Team'
  }

  const setSEO = (config: SEOConfig) => {
    const seoConfig = { ...defaultSEO, ...config }
    
    // Build complete title
    const fullTitle = seoConfig.title === defaultSEO.title 
      ? seoConfig.title 
      : `${seoConfig.title} | PnutGo`

    // Get current URL for canonical and OG URL
    const currentUrl = `${runtimeConfig.public.baseUrl || 'https://pnutgo.com'}${route.fullPath}`
    const canonicalUrl = seoConfig.canonicalUrl || currentUrl

    // Set head meta tags
    useHead({
      title: fullTitle,
      meta: [
        { name: 'description', content: seoConfig.description },
        { name: 'keywords', content: seoConfig.keywords?.join(', ') },
        { name: 'author', content: seoConfig.author },
        { name: 'robots', content: seoConfig.robots },
        
        // Open Graph
        { property: 'og:title', content: fullTitle },
        { property: 'og:description', content: seoConfig.description },
        { property: 'og:type', content: seoConfig.ogType },
        { property: 'og:url', content: currentUrl },
        { property: 'og:image', content: seoConfig.ogImage },
        { property: 'og:image:alt', content: `${seoConfig.title} - PnutGo` },
        { property: 'og:site_name', content: 'PnutGo' },
        { property: 'og:locale', content: 'en_US' },
        
        // Twitter Card
        { name: 'twitter:card', content: seoConfig.twitterCard },
        { name: 'twitter:title', content: fullTitle },
        { name: 'twitter:description', content: seoConfig.description },
        { name: 'twitter:image', content: seoConfig.ogImage },
        { name: 'twitter:site', content: '@PnutGo' },
        { name: 'twitter:creator', content: '@PnutGo' },
        
        // Additional meta tags
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#3B82F6' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'PnutGo' },
        
        // Article specific meta tags
        ...(seoConfig.publishedTime ? [{ property: 'article:published_time', content: seoConfig.publishedTime }] : []),
        ...(seoConfig.modifiedTime ? [{ property: 'article:modified_time', content: seoConfig.modifiedTime }] : []),
      ],
      link: [
        { rel: 'canonical', href: canonicalUrl },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
      script: seoConfig.structuredData ? [
        {
          type: 'application/ld+json',
          children: JSON.stringify(seoConfig.structuredData)
        }
      ] : []
    })
  }

  const createGameStructuredData = (additionalData?: Record<string, any>) => {
    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: 'PnutGo',
      description: 'A location-based companion hunting game where players explore the real world to discover and capture magical companions.',
      applicationCategory: 'Game',
      operatingSystem: ['iOS', 'Android', 'Web'],
      gameLocation: 'Real World',
      genre: ['Adventure', 'Augmented Reality', 'Location-based'],
      playMode: 'SinglePlayer',
      gamePlatform: ['Mobile', 'Web'],
      publisher: {
        '@type': 'Organization',
        name: 'PnutGo Team'
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '1250',
        bestRating: '5',
        worstRating: '1'
      },
      features: [
        'Real-time location tracking',
        'Interactive companion collection',
        'Daily quest system',
        'Achievement badges',
        'Social features',
        'Augmented reality elements'
      ]
    }

    return { ...baseStructuredData, ...additionalData }
  }

  const createBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string, url: string }>) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    }
  }

  const createOrganizationStructuredData = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'PnutGo',
      url: runtimeConfig.public.baseUrl || 'https://pnutgo.com',
      logo: `${runtimeConfig.public.baseUrl || 'https://pnutgo.com'}/logo.png`,
      description: 'Creating immersive location-based gaming experiences that blend the digital and real worlds.',
      sameAs: [
        'https://twitter.com/PnutGo',
        'https://facebook.com/PnutGo',
        'https://instagram.com/PnutGo'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-PNUTGO',
        contactType: 'Customer Service',
        availableLanguage: 'English'
      }
    }
  }

  const createFAQStructuredData = (faqs: Array<{ question: string, answer: string }>) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  }

  const createWebPageStructuredData = (additionalData?: Record<string, any>) => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: route.meta.title || defaultSEO.title,
      description: route.meta.description || defaultSEO.description,
      url: `${runtimeConfig.public.baseUrl || 'https://pnutgo.com'}${route.fullPath}`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'PnutGo',
        url: runtimeConfig.public.baseUrl || 'https://pnutgo.com'
      },
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'ReadAction',
        target: `${runtimeConfig.public.baseUrl || 'https://pnutgo.com'}${route.fullPath}`
      }
    }

    return { ...baseData, ...additionalData }
  }

  return {
    setSEO,
    createGameStructuredData,
    createBreadcrumbStructuredData,
    createOrganizationStructuredData,
    createFAQStructuredData,
    createWebPageStructuredData,
    defaultSEO
  }
}