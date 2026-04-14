import { useEffect } from 'react'
import { BRAND_DESCRIPTION, BRAND_NAME } from '@utils/brand'

interface SeoMetaOptions {
  title?: string
  description?: string
  path?: string
  imagePath?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

function setMetaTag(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', url)
}

export function useSeoMeta({
  title,
  description = BRAND_DESCRIPTION,
  path,
  imagePath = '/icons/icon-512.png',
  type = 'website',
  noIndex = false,
}: SeoMetaOptions = {}) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const pageTitle = title ? `${title} | ${BRAND_NAME}` : BRAND_NAME
    const url = `${window.location.origin}${path ?? `${window.location.pathname}${window.location.search}`}`
    const image = imagePath.startsWith('http') ? imagePath : `${window.location.origin}${imagePath}`

    setMetaTag('name', 'description', description)
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    setMetaTag('name', 'application-name', BRAND_NAME)
    setMetaTag('name', 'apple-mobile-web-app-title', BRAND_NAME)

    setMetaTag('property', 'og:title', pageTitle)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', type)
    setMetaTag('property', 'og:site_name', BRAND_NAME)
    setMetaTag('property', 'og:url', url)
    setMetaTag('property', 'og:image', image)

    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', pageTitle)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', image)

    setCanonical(url)
  }, [description, imagePath, noIndex, path, title, type])
}
