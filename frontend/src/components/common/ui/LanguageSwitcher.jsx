import { Select } from 'antd';
import { changeLanguage } from '../../../i18n';

const { Option } = Select;

const languages = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
];

const LanguageSelect = () => {
  const currentLang = typeof window !== 'undefined' ? localStorage.getItem('lang') || 'vi' : 'vi';

  return (
    <Select
      defaultValue={currentLang}
      style={{ width: 80 }}
      onChange={(value) => changeLanguage(value)}
      optionLabelProp="label"
    >
      {languages.map((lang) => (
        <Option key={lang.value} value={lang.value} label={`${lang.label}`}>
          <span>{`${lang.label}`}</span>
        </Option>
      ))}
    </Select>
  );
};

export default LanguageSelect;
