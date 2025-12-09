import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { changeLanguage } from '../../../i18n';

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸', code: 'EN' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', code: 'VI' },
];

const LanguageSelect = () => {
  const currentLang = typeof window !== 'undefined' ? localStorage.getItem('lang') || 'vi' : 'vi';
  const activeLang = languages.find((l) => l.value === currentLang) || languages[1];

  const items = languages.map((lang) => ({
    key: lang.value,
    label: (
      <div className="flex items-center gap-2 min-w-[100px]">
        <span className="text-lg">{lang.flag}</span>
        <span
          className={`font-medium ${lang.value === currentLang ? 'text-blue-600' : 'text-slate-700'}`}
        >
          {lang.label}
        </span>
      </div>
    ),
    onClick: () => changeLanguage(lang.value),
  }));

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors border border-transparent hover:border-slate-200">
        <GlobalOutlined className="text-slate-500 text-lg" />
        <span className="text-sm font-semibold text-slate-700">{activeLang.code}</span>
      </div>
    </Dropdown>
  );
};

export default LanguageSelect;
