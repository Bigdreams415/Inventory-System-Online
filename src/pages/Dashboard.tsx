import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const { 
    summary, 
    salesTrend, 
    categories,   
    lowStockProducts, 
    loading, 
    error, 
    refreshDashboard 
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 my-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">Error loading dashboard</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={refreshDashboard}
            className="mt-3 sm:mt-0 sm:ml-4 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const salesTrendData = {
    labels: salesTrend?.labels || [],
    datasets: [
      {
        label: 'Revenue',
        data: salesTrend?.revenue || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Profit',
        data: salesTrend?.profit || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };

  const salesTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return '₦' + value.toLocaleString('en-NG');
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const categoryData = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        data: categories.map(cat => cat.revenue),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
          '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }
    ]
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          usePointStyle: true,
          font: {
            size: 10
          }
        },
      },
    },
    cutout: '55%',
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 md:p-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Real-time analytics and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <button 
            onClick={refreshDashboard}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Today's Revenue</h3>
            <span className="text-lg sm:text-xl">💰</span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 mt-1 sm:mt-2">
            {formatCurrency(summary?.todayRevenue || 0)}
          </p>
          <p className={`text-xs mt-1 ${summary?.revenueChange && summary.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary?.revenueChange && summary.revenueChange >= 0 ? '↑' : '↓'} 
            {Math.abs(summary?.revenueChange || 0)}% from yesterday
          </p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Total Products</h3>
            <span className="text-lg sm:text-xl">📦</span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mt-1 sm:mt-2">{summary?.totalProducts || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{summary?.totalCategories || 0} categories</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Low Stock</h3>
            <span className="text-lg sm:text-xl">⚠️</span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 mt-1 sm:mt-2">{summary?.lowStockCount || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Need restocking</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Today's Orders</h3>
            <span className="text-lg sm:text-xl">📋</span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 mt-1 sm:mt-2">{summary?.todayOrders || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{summary?.todayItemsSold || 0} items sold</p>
        </div>
      </div>

      {/* Charts Section - Stack on Mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Sales Trend (7 Days)</h3>
          </div>
          <div className="h-60 sm:h-72 md:h-80">
            {salesTrend && salesTrend.labels.length > 0 ? (
              <Bar data={salesTrendData} options={salesTrendOptions} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <div className="text-3xl sm:text-4xl mb-2">📊</div>
                  <p className="text-sm sm:text-base">No sales data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Categories - Mobile Optimized */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Revenue by Category</h3>
          </div>
          <div className="h-60 sm:h-72 md:h-80">
            {categories.length > 0 ? (
              <div className="flex flex-col h-full">
                {/* Chart on top for mobile, side by side for larger screens */}
                <div className="h-32 sm:h-40 md:h-48 mb-4">
                  <Doughnut data={categoryData} options={categoryOptions} />
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2 max-h-32 sm:max-h-40 md:max-h-48">
                    {categories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div 
                            className="w-2 h-2 sm:w-3 sm:h-3 rounded flex-shrink-0"
                            style={{
                              backgroundColor: categoryData.datasets[0].backgroundColor[index]
                            }}
                          ></div>
                          <span className="text-gray-700 truncate text-xs sm:text-sm">{category.name}</span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-semibold text-xs sm:text-sm">{formatCurrency(category.revenue)}</div>
                          <div className="text-gray-500 text-xs">{category.count} products</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <div className="text-3xl sm:text-4xl mb-2">📦</div>
                  <p className="text-sm sm:text-base">No category data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Stack on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Stock Worth */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Total Stock Worth</h3>
            <span className="text-xs sm:text-sm text-gray-500">Inventory Value</span>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center py-3 sm:py-4">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">💰</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">
                {formatCurrency(summary?.totalStockWorth || 0)}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Total investment in inventory
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-center">
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium">Products</div>
                <div className="text-base sm:text-lg font-bold text-blue-700">{summary?.totalProducts || 0}</div>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 font-medium">Categories</div>
                <div className="text-base sm:text-lg font-bold text-green-700">{summary?.totalCategories || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Low Stock Alert</h3>
            <span className="text-xs sm:text-sm text-gray-500">{lowStockProducts.length} products</span>
          </div>
          <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate text-xs sm:text-sm">{product.name}</div>
                    <div className="text-gray-600 truncate text-xs">{product.category}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-semibold text-orange-600 text-xs sm:text-sm">{product.stock} left</div>
                    <div className="text-gray-500 text-xs">{formatCurrency(product.sell_price)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <div className="text-3xl sm:text-4xl mb-2">✅</div>
                <p className="text-sm sm:text-base">All products well stocked</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Quick Actions</h3>
          <div className="space-y-2 sm:space-y-3">
            <button 
              onClick={() => window.location.href = '/inventory'}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <span>➕</span>
              <span>Add New Product</span>
            </button>
            <button 
              onClick={() => window.location.href = '/pos'}
              className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <span>🛒</span>
              <span>Start New Sale</span>
            </button>
            <button 
              onClick={() => window.location.href = '/sales'}
              className="w-full bg-purple-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <span>📊</span>
              <span>View Sales Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;