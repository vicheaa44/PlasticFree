import { Btn } from '../components/Btn'
import { PageHeader } from '../components/PageHeader'
import { useLanguage } from '../i18n/LanguageContext'

export function NotFoundPage() {
  const { t } = useLanguage()
  return (
    <PageHeader eyebrow="404" title={t.notFound.title} sub={t.notFound.body}>
      <Btn to="/" variant="blue">
        {t.common.backHome}
      </Btn>
    </PageHeader>
  )
}
