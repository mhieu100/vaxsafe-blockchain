import {
  TwitterOutlined,
  LinkedinOutlined,
  GithubOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <SafetyCertificateOutlined className="text-blue-600 text-xl mr-2" />
              <span className="text-lg font-bold text-gray-900">SafeVax</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              {t('footer.protecting')}
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <TwitterOutlined />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <LinkedinOutlined />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <GithubOutlined />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              {t('footer.solutions')}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/individual"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.forIndividuals')}
                </Link>
              </li>
              <li>
                <Link
                  to="/healthcare"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.forHealthcare')}
                </Link>
              </li>
              <li>
                <Link
                  to="/government"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.forGovernment')}
                </Link>
              </li>
              <li>
                <Link
                  to="/travel"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.forTravel')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              {t('footer.resources')}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/docs"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.documentation')}
                </Link>
              </li>
              <li>
                <Link
                  to="/api"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.api')}
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.support')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              {t('footer.company')}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.careers')}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {t('footer.termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">{t('footer.copyright')}</p>
          <div className="mt-4 md:mt-0">
            <p className="text-xs text-gray-500">{t('footer.slogan')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
