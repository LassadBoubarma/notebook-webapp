import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SiteLanguageSwitcher({ size = 'md' }) {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const cls =
    size === 'sm'
      ? 'db-lang-select db-lang-select-sm'
      : 'db-lang-select';

  return (
    <label className="db-lang-wrap">
      <span className="db-lang-label">{t('site.language')}</span>
      <select
        className={cls}
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">{t('site.language.en')}</option>
        <option value="pt">{t('site.language.pt')}</option>
      </select>
    </label>
  );
}
