import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { gameApi } from "../services/api";
import Skeleton from "../components/Skeleton";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  type: string;
  owned: boolean;
  equipped?: boolean;
  value?: string;
}

const ShopPage: React.FC = () => {
  const { user, login } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const { toast, showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [shopRes, statusRes] = await Promise.all([
        gameApi.getShopItems(),
        gameApi.getStatus()
      ]);
      setItems(shopRes.data);
      setCoins(statusRes.data.coins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBuy = async (itemId: string) => {
    try {
      const res = await gameApi.buyItem(itemId);
      // 更新用户金币
      if (user) {
        const updatedUser = { ...user, coins: res.data.newCoins, inventory: res.data.inventory };
        login(localStorage.getItem('token') || '', updatedUser);
      }
      showToast(res.message || "购买成功！");
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "购买失败", "error");
    }
  };

  const handleEquip = async (item: ShopItem) => {
    try {
      let itemType = '';
      let itemValue = '';
      if (item.type === 'avatarFrames') { itemType = 'avatarFrame'; itemValue = item.value || item.id; }
      else if (item.type === 'themeColors') { itemType = 'theme'; itemValue = item.value || item.id; }

      if (!itemType) return;

      const res = await gameApi.useItem({ itemType, itemValue });
      // 更新用户状态
      if (user) {
        const updatedUser: any = { ...user, inventory: res.data.inventory };
        if (itemType === 'avatarFrame') updatedUser.activeFrame = res.data.activeFrame;
        if (itemType === 'theme') updatedUser.activeTheme = res.data.activeTheme;
        login(localStorage.getItem('token') || '', updatedUser);
        // 切换主题需要刷新样式
        if (itemType === 'theme') {
          document.documentElement.setAttribute('data-theme', res.data.activeTheme || 'default');
        }
      }
      showToast(res.message || "装备切换成功！");
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "操作失败", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <Skeleton type="text" count={1} className="h-8 w-32 mb-4" />
        <Skeleton type="card" count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Toast toast={toast} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">金币商店</h1>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-xl text-sm font-medium">
          余额: {coins}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 flex flex-col items-center text-center"
          >
            <span className="text-3xl mb-2">{item.icon}</span>
            <h3 className="font-semibold text-sm text-gray-800">{item.name}</h3>
            <p className="text-xs text-gray-400 mt-1 mb-3">{item.description}</p>
            {item.owned ? (
              <div className="flex gap-1.5">
                <span className="text-xs text-accent-600 font-medium px-3 py-1.5 bg-accent-50 rounded-lg">
                  已拥有
                </span>
                {(item.type === 'avatarFrames' || item.type === 'themeColors') && (
                  <button
                    onClick={() => handleEquip(item)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${item.equipped ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-brand-100'}`}
                  >
                    {item.equipped ? '卸下' : '装备'}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleBuy(item.id)}
                disabled={coins < item.price}
                className={"px-4 py-2 rounded-xl text-xs font-medium transition-all " + (coins >= item.price ? "bg-brand-500 text-white hover:bg-brand-600 shadow-soft" : "bg-gray-100 text-gray-400 cursor-not-allowed")}
              >
                {item.price} 购买
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
