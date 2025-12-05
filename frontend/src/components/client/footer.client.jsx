import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  TwitterOutlined,
} from '@ant-design/icons';
import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500"></div>
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Description */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <SafetyCertificateOutlined className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">SafeVax</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              {t('footer.protecting')}
              <br />
              Empowering global health through secure, transparent blockchain technology.
            </p>
            <div className="flex gap-4">
              {[TwitterOutlined, FacebookOutlined, LinkedinOutlined, InstagramOutlined].map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:-translate-y-1"
                  >
                    <Icon />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 md:col-span-4">
            <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
              Solutions
            </h3>
            <ul className="space-y-4">
              {['Individual', 'Healthcare', 'Government', 'Travel'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-[1px] bg-blue-400 transition-all duration-300"></span>
                    {t(`footer.for${item}`, item)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 md:col-span-4">
            <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
              Company
            </h3>
            <ul className="space-y-4">
              {['About', 'Careers', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-[1px] bg-blue-400 transition-all duration-300"></span>
                    {t(
                      `footer.${item.toLowerCase() === 'about' ? 'aboutUs' : item.toLowerCase() === 'privacy' ? 'privacyPolicy' : item.toLowerCase() === 'terms' ? 'termsOfService' : item.toLowerCase()}`,
                      item
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4 md:col-span-4">
            <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
              Stay Updated
            </h3>
            <p className="text-slate-400 mb-4 text-sm">
              Subscribe to our newsletter for the latest health updates and blockchain news.
            </p>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Enter your email"
                className="h-12 bg-slate-800 border-slate-700 text-white placeholder-slate-500 hover:border-blue-500 focus:border-blue-500 rounded-lg"
              />
              <Button
                type="primary"
                className="h-12 bg-blue-600 hover:bg-blue-500 border-none rounded-lg font-semibold shadow-lg shadow-blue-600/20"
                icon={<SendOutlined />}
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} SafeVax Blockchain. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
