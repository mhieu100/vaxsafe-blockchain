import { useCartStore } from '@/stores/useCartStore';
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TopCartSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { totalQuantity } = useCartStore();

  return (
    <div className="flex justify-between items-center gap-2 sm:gap-4 mb-4">
      <span className="mb-0 text-lg sm:text-xl">
        <span className="hidden sm:inline">
          {t("cart.title")} ({totalQuantity()} {t("cart.items")})
        </span>
        <span className="sm:hidden">
          {t("cart.title")} ({totalQuantity()})
        </span>
      </span>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/vaccine")}
        className="flex-shrink-0"
      >
        <span className="hidden sm:inline">{t("cart.continueShopping")}</span>
        <span className="sm:hidden">{t("cart.back")}</span>
      </Button>
    </div>
  );
};

export default TopCartSection;
