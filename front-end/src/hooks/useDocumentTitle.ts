import { useEffect } from 'react'
import { BRAND_NAME } from '@utils/brand'

const APP_NAME = BRAND_NAME

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME
    return () => { document.title = APP_NAME }
  }, [title])
}
