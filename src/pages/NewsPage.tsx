import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, Tag, ArrowRight, Newspaper } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import MainLayout from '../components/MainLayout';

const categories = ['Tất cả', 'Thông báo', 'Sự kiện', 'Tin tức ngành', 'Giải thưởng', 'Công nghệ'];

const allNews = [
  {
    id: 1,
    date: '15/02/2025',
    category: 'Thông báo',
    title: 'Hùng Thủy mở rộng tuyến vận chuyển đến Nhật Bản và Hàn Quốc',
    desc: 'Công ty Vận tải Cảng biển Hùng Thủy chính thức triển khai tuyến vận chuyển mới đến Nhật Bản và Hàn Quốc từ tháng 3/2025, đánh dấu bước ngoặt quan trọng trong chiến lược mở rộng quốc tế.',
    img: 'https://images.unsplash.com/photo-1634638025184-9ab3d47c8b74?w=600&q=80',
    featured: true,
  },
  {
    id: 2,
    date: '05/02/2025',
    category: 'Công nghệ',
    title: 'Ra mắt hệ thống quản lý container thông minh phiên bản 2.0',
    desc: 'Nền tảng quản lý kho bãi container hoàn toàn mới với công nghệ AI, giúp tối ưu hóa quy trình vận hành và giảm 30% chi phí, đồng thời nâng cao độ chính xác theo dõi lên 99.9%.',
    img: 'https://images.unsplash.com/photo-1761195696590-3490ea770aa1?w=600&q=80',
    featured: true,
  },
  {
    id: 3,
    date: '20/01/2025',
    category: 'Giải thưởng',
    title: 'Hùng Thủy nhận giải "Doanh nghiệp Logistics xuất sắc 2024"',
    desc: 'Vinh dự nhận giải thưởng từ Hiệp hội Logistics Việt Nam vì những đóng góp xuất sắc trong phát triển ngành vận tải biển và logistics quốc gia trong năm 2024.',
    img: 'https://images.unsplash.com/photo-1769697263718-c25efb356ff5?w=600&q=80',
    featured: false,
  },
  {
    id: 4,
    date: '10/01/2025',
    category: 'Sự kiện',
    title: 'Hội nghị khách hàng thường niên 2025 tại TP. Hồ Chí Minh',
    desc: 'Hội nghị khách hàng thường niên 2025 của Hùng Thủy quy tụ hơn 300 đối tác và khách hàng, tổng kết năm 2024 và công bố kế hoạch chiến lược cho giai đoạn 2025-2027.',
    img: 'https://images.unsplash.com/photo-1756113820523-e3155455e3a6?w=600&q=80',
    featured: false,
  },
  {
    id: 5,
    date: '28/12/2024',
    category: 'Tin tức ngành',
    title: 'Xu hướng logistics xanh - Hùng Thủy tiên phong trong chuyển đổi bền vững',
    desc: 'Hùng Thủy công bố lộ trình Net Zero 2040, với cam kết giảm 50% lượng khí thải carbon vào năm 2030 thông qua điện khí hóa đội tàu và tối ưu hóa tuyến đường vận chuyển.',
    img: 'https://images.unsplash.com/photo-1769144256181-698b8f807066?w=600&q=80',
    featured: false,
  },
  {
    id: 6,
    date: '15/12/2024',
    category: 'Thông báo',
    title: 'Khai trương kho bãi container mới tại Long An, mở rộng năng lực 2000 TEU',
    desc: 'Kho bãi container thứ 3 của Hùng Thủy tại Long An chính thức đi vào hoạt động với tổng diện tích 5 hecta, sức chứa 2000 TEU, trang bị hệ thống cẩu nâng và giám sát tự động.',
    img: 'https://images.unsplash.com/photo-1763325088554-529181f76960?w=600&q=80',
    featured: false,
  },
];

export default function NewsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const filtered = allNews.filter(n => {
    const matchCat = activeCategory === 'Tất cả' || n.category === activeCategory;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.filter(n => n.featured);
  const regular = filtered.filter(n => !n.featured);

  return (
    <MainLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-blue-200 rounded-full text-sm font-semibold mb-6">
              <Newspaper className="w-4 h-4" />
              Tin tức & Sự kiện
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Tin tức Hùng Thủy</h1>
            <p className="text-blue-200 text-xl max-w-2xl mx-auto">
              Cập nhật thông tin mới nhất về hoạt động, sự kiện và tin tức ngành logistics của chúng tôi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-100 sticky top-16 lg:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-blue-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured */}
          {featured.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-900 rounded-full" />
                Tin nổi bật
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featured.map((news, i) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <ImageWithFallback
                        src={news.img}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-blue-900 text-white text-xs font-semibold rounded-full">
                          {news.category}
                        </span>
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-full">
                          Nổi bật
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {news.date}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{news.desc}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 group-hover:gap-2 transition-all">
                        Đọc thêm <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regular News */}
          {regular.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-400 rounded-full" />
                Tin tức khác
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regular.map((news, i) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <ImageWithFallback
                        src={news.img}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-900 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {news.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {news.date}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{news.desc}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                        Đọc thêm <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Không tìm thấy tin tức phù hợp</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
