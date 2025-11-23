import { useCartStore } from '@/stores/useCartStore';
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col } from "antd";
import { useTranslation } from "react-i18next";
import CartItem from "./CartItem";

const ListItemSection = () => {
  const { t } = useTranslation("common");
  const { items, clearCart } = useCartStore();

  return (
    <Col xs={24} lg={16}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-base sm:text-lg font-semibold">
          {t("cart.cartItems")}
        </span>
        <Button
          type="text"
          danger
          onClick={clearCart}
          disabled={items.length === 0}
          size="small"
          className="text-xs sm:text-sm"
        >
          <DeleteOutlined /> {t("cart.clearCart")}
        </Button>
      </div>

      {items.map((item) => (
        <CartItem key={item.vaccine.id} item={item} />
      ))}
    </Col>
  );
};

export default ListItemSection;
