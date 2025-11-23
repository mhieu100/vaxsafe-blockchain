import { Card, Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="rounded-2xl shadow-lg">
          <Result
            icon={<ShoppingCartOutlined className="text-blue-600 text-6xl" />}
            title="Checkout Page - Coming Soon"
            subTitle="Tính năng thanh toán đang được phát triển. Vui lòng quay lại sau."
            extra={[
              <Button type="primary" key="cart" onClick={() => navigate("/cart")}>
                Back to Cart
              </Button>,
              <Button key="vaccine" onClick={() => navigate("/vaccine")}>
                {t("header.vaccines")}
              </Button>,
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
