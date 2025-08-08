import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: getQueryFn(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Failed to load dashboard stats: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link data-testid="button-upload-new" href="/upload">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Upload New File
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p data-testid="stat-total-files" className="text-2xl font-semibold text-gray-900">{stats?.totalFiles || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Charts</p>
              <p data-testid="stat-total-charts" className="text-2xl font-semibold text-gray-900">{stats?.totalCharts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rows</p>
              <p data-testid="stat-total-rows" className="text-2xl font-semibold text-gray-900">{stats?.totalRows?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p data-testid="stat-total-users" className="text-2xl font-semibold text-gray-900">{stats?.adminStats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Files */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Files</h2>
          </div>
          <div className="p-6">
            {stats?.recentFiles?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentFiles.map((file, index) => (
                  <div key={file.id} data-testid={`recent-file-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 18h12V6l-4-4H4v16z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                        <p className="text-xs text-gray-500">{file.rowCount} rows • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link data-testid={`link-view-file-${index}`} href={`/files/${file.id}`}>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div data-testid="no-recent-files" className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No files uploaded yet</p>
                <Link href="/upload">
                  <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">Upload your first file</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Charts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Charts</h2>
          </div>
          <div className="p-6">
            {stats?.recentCharts?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentCharts.map((chart, index) => (
                  <div key={chart.id} data-testid={`recent-chart-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{chart.title}</p>
                        <p className="text-xs text-gray-500">{chart.chartType} • {new Date(chart.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link data-testid={`link-view-chart-${index}`} href={`/charts/${chart.id}`}>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div data-testid="no-recent-charts" className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No charts created yet</p>
                <Link href="/files">
                  <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">Create your first chart</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Types Distribution */}
      {stats?.chartTypes && Object.keys(stats.chartTypes).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chart Types Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.chartTypes).map(([type, count]) => (
              <div key={type} data-testid={`chart-type-${type}`} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Stats */}
      {user?.role === 'admin' && stats?.adminStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Overview (Admin)</h2>
            <Link data-testid="link-admin-panel" href="/admin">
              <button className="text-purple-600 hover:text-purple-800 text-sm">View Admin Panel</button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div data-testid="admin-stat-users" className="text-2xl font-bold text-purple-600">{stats.adminStats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div data-testid="admin-stat-active-users" className="text-2xl font-bold text-green-600">{stats.adminStats.activeUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div data-testid="admin-stat-system-files" className="text-2xl font-bold text-blue-600">{stats.adminStats.totalSystemFiles}</div>
              <div className="text-sm text-gray-600">System Files</div>
            </div>
            <div className="text-center">
              <div data-testid="admin-stat-system-charts" className="text-2xl font-bold text-orange-600">{stats.adminStats.totalSystemCharts}</div>
              <div className="text-sm text-gray-600">System Charts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}