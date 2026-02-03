/**
 * =============================================================================
 * 首页 (Home Page)
 * =============================================================================
 *
 * 📌 功能：
 *    - 展示核桃瀑布流列表
 *    - 支持按品种筛选
 *    - 从 API 加载数据（支持刷新和新增）
 *
 * =============================================================================
 */

"use client";

import AboutPage from "@/components/AboutPage";
import CategoryNav, { SortOrder } from "@/components/CategoryNav";
import Header from "@/components/Header";
import UploadPage from "@/components/UploadPage";
import WalnutCard from "@/components/WalnutCard";
import WalnutDetailModal from "@/components/WalnutDetailModal";
import { CATEGORIES } from "@/constants";
import { Walnut } from "@/types";
import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  // --- 视图状态 ---
  const [currentView, setCurrentView] = useState<
    "gallery" | "about" | "upload"
  >("gallery");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedWalnut, setSelectedWalnut] = useState<Walnut | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- 管理员连击逻辑 ---
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // 初始化管理员状态
  useEffect(() => {
    const savedAdmin = localStorage.getItem("walnut_admin") === "true";
    if (savedAdmin) setIsAdmin(true);
  }, []);

  const handleAdminToggle = () => {
    const now = Date.now();
    if (now - lastClickTime < 3000) {
      const newCount = clickCount + 1;
      if (newCount >= 5) {
        const nextAdminState = !isAdmin;
        setIsAdmin(nextAdminState);
        localStorage.setItem("walnut_admin", String(nextAdminState));
        toast.success(nextAdminState ? "进入管理员模式" : "退出管理员模式");
        setClickCount(0);
      } else {
        setClickCount(newCount);
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  };

  // --- 数据状态 ---
  const [walnuts, setWalnuts] = useState<Walnut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");

  // 分页配置
  const PAGE_SIZE = 12;

  // 无限滚动触发器
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 防止重复请求的标志
  const isLoadingRef = useRef(false);

  // =============================================================================
  // 数据加载
  // =============================================================================

  /**
   * 从 API 加载核桃数据
   * @param isLoadMore 是否为加载更多（追加到现有数据）
   */
  const fetchWalnuts = useCallback(
    async (isLoadMore = false) => {
      // 防止重复请求
      if (isLoadMore && isLoadingRef.current) {
        return;
      }

      try {
        if (isLoadMore) {
          isLoadingRef.current = true;
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          setWalnuts([]);
          setHasMore(true);
        }
        setError(null);

        const skip = isLoadMore ? walnuts.length : 0;
        const response = await fetch(
          `/api/walnuts?limit=${PAGE_SIZE}&skip=${skip}&sort=${sortOrder}`,
        );
        if (!response.ok) {
          throw new Error("加载数据失败");
        }

        const result = await response.json();
        const newData = result.data || [];

        if (isLoadMore) {
          setWalnuts((prev) => [...prev, ...newData]);
        } else {
          setWalnuts(newData);
        }

        // 判断是否还有更多数据
        if (newData.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("加载数据失败:", err);
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    [walnuts.length, PAGE_SIZE, sortOrder],
  );

  // sortOrder 变化时重新加载
  useEffect(() => {
    fetchWalnuts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  // 初始加载
  useEffect(() => {
    fetchWalnuts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==============================================================================
  // 无限滚动 IntersectionObserver
  // =============================================================================

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        // 使用 ref 判断是否正在加载，避免重复请求
        if (
          first.isIntersecting &&
          hasMore &&
          !isLoadingRef.current &&
          !isLoading
        ) {
          fetchWalnuts(true);
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, fetchWalnuts]);

  // =============================================================================
  // 筛选逻辑
  // =============================================================================

  const filteredWalnuts = useMemo(() => {
    if (selectedCategory === "all") return walnuts;
    return walnuts.filter((w) => w.variety === selectedCategory);
  }, [selectedCategory, walnuts]);

  // 手动分列 - 避免 CSS columns 在添加新元素时重排
  const columnedWalnuts = useMemo(() => {
    const cols: Walnut[][] = [[], [], []];
    filteredWalnuts.forEach((walnut, index) => {
      cols[index % 3].push(walnut);
    });
    return cols;
  }, [filteredWalnuts]);

  // =============================================================================
  // 导航处理
  // =============================================================================

  const handleNavigateHome = () => {
    setCurrentView("gallery");
    setSelectedWalnut(null);
  };

  const handleNavigateAbout = () => {
    setCurrentView("about");
  };

  const handleNavigateUpload = () => {
    setCurrentView("upload");
  };

  /**
   * 开启编辑视图
   */
  const handleEditWalnut = () => {
    // 直接切换到编辑视图，弹窗会因为 currentView 条件自动隐藏
    setCurrentView("upload");
  };

  /**
   * 保存成功后的回调
   * - 将新数据添加到列表顶部或更新现有数据
   * - 返回首页
   */
  const handleSaveWalnut = (newWalnut: Walnut) => {
    setWalnuts((prev) => {
      const index = prev.findIndex((w) => w.id === newWalnut.id);
      if (index > -1) {
        const next = [...prev];
        next[index] = newWalnut;
        return next;
      }
      return [newWalnut, ...prev];
    });
    setCurrentView("gallery");
    setSelectedWalnut(null);
  };

  /**
   * 删除核桃
   */
  const handleDeleteWalnut = async () => {
    if (!selectedWalnut) return;

    try {
      const response = await fetch(`/api/walnuts/${selectedWalnut.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      setWalnuts((prev) => prev.filter((w) => w.id !== selectedWalnut.id));
      toast.success("删除成功");
      setSelectedWalnut(null);
    } catch (error) {
      toast.error("删除失败");
      console.error(error);
    }
  };

  // =============================================================================
  // 渲染
  // =============================================================================

  return (
    <div className="min-h-screen bg-paper font-serif text-ink selection:bg-stone-200">
      <Header
        onNavigateHome={handleNavigateHome}
        onNavigateAbout={handleNavigateAbout}
        onNavigateUpload={handleNavigateUpload}
        currentView={currentView}
        isAdmin={isAdmin}
      />

      <main className="pb-24">
        {currentView === "gallery" && (
          <>
            <CategoryNav
              categories={CATEGORIES}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
              sortOrder={sortOrder}
              onSortChange={(newOrder) => {
                if (newOrder !== sortOrder) {
                  setSortOrder(newOrder);
                }
              }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
              {/* 加载状态 */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                  <Loader2 className="w-8 h-8 mb-4 animate-spin" />
                  <p className="text-sm tracking-widest">加载中...</p>
                </div>
              )}

              {/* 错误状态 */}
              {error && !isLoading && (
                <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchWalnuts(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded text-sm"
                  >
                    重试
                  </button>
                </div>
              )}

              {/* 空状态 */}
              {!isLoading && !error && filteredWalnuts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-lg tracking-widest font-light">暂无藏品</p>
                  <p className="text-xs mt-2 opacity-50">No collection found</p>
                </div>
              )}

              {/* 瀑布流列表 - 手动分列避免重排 */}
              {!isLoading && !error && filteredWalnuts.length > 0 && (
                <>
                  {/* 移动端: 1列 */}
                  <div className="flex flex-col md:hidden">
                    {filteredWalnuts.map((walnut) => (
                      <WalnutCard
                        key={walnut.id}
                        data={walnut}
                        onClick={setSelectedWalnut}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                  {/* 中屏及以上: 2-3列 */}
                  <div className="hidden md:flex gap-8">
                    {columnedWalnuts.map((column, colIndex) => (
                      <div
                        key={colIndex}
                        className={`flex-1 flex flex-col ${colIndex === 2 ? "hidden lg:flex" : ""}`}
                      >
                        {column.map((walnut) => (
                          <WalnutCard
                            key={walnut.id}
                            data={walnut}
                            onClick={setSelectedWalnut}
                            isAdmin={isAdmin}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 加载更多触发器 */}
              {!isLoading && filteredWalnuts.length > 0 && (
                <div ref={loadMoreRef} className="flex justify-center py-12">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-stone-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm tracking-widest">
                        加载更多...
                      </span>
                    </div>
                  ) : hasMore ? (
                    <span className="text-xs text-stone-300 tracking-widest">
                      向下滚动加载更多
                    </span>
                  ) : (
                    <span className="text-xs text-stone-300 tracking-widest">
                      — 已加载全部 —
                    </span>
                  )}
                </div>
              )}

              {/* 页脚装饰 */}
              <div className="mt-24 flex justify-center opacity-30">
                <div
                  className="w-16 h-16 border border-stone-800 rounded-sm flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform"
                  onClick={handleAdminToggle}
                >
                  <span className="writing-vertical-rl text-xs font-bold tracking-widest">
                    核桃雅集
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === "about" && <AboutPage />}

        {currentView === "upload" && (
          <UploadPage
            onCancel={handleNavigateHome}
            onSave={handleSaveWalnut}
            initialData={selectedWalnut || undefined}
          />
        )}
      </main>

      {/* 详情弹窗 - 仅在 gallery 视图下显示 */}
      {selectedWalnut && currentView === "gallery" && (
        <WalnutDetailModal
          walnut={selectedWalnut}
          isAdmin={isAdmin}
          onClose={() => setSelectedWalnut(null)}
          onEdit={handleEditWalnut}
          onDelete={handleDeleteWalnut}
        />
      )}
    </div>
  );
}
