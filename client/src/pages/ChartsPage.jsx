import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';
import { Link } from 'wouter';

export default function ChartsPage() {
  const { data: charts, isLoading, error } = useQuery({
    queryKey: ['/api/charts'],
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
        <div className="text-red-800">Failed to load charts: {error.message}</div>
      </div>
    );
  }

  const getChartIcon = (chartType) => {
    switch (chartType) {
      case 'bar':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'line':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'pie':
      case 'doughnut':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        );
      case 'scatter':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="19" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="5" r="2"/>
            <circle cx="8" cy="8" r="2"/>
            <circle cx="16" cy="16" r="2"/>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Charts</h1>
        <Link data-testid="button-create-new-chart" href="/files">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create New Chart
          </button>
        </Link>
      </div>

      {charts?.length === 0 ? (
        <div data-testid="no-charts-message" className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No charts created yet</h3>
          <p className="text-gray-500 mb-4">Upload Excel files and create your first chart to visualize your data</p>
          <div className="space-x-2">
            <Link href="/upload">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Upload File
              </button>
            </Link>
            <Link href="/files">
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                Browse Files
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts?.map((chart) => (
            <div key={chart.id} data-testid={`chart-card-${chart.id}`} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      chart.is3D ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      <div className={
                        chart.is3D ? 'text-purple-600' : 'text-green-600'
                      }>
                        {getChartIcon(chart.chartType)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate" title={chart.title}>
                        {chart.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {chart.is3D ? '3D ' : ''}{chart.chartType} chart
                      </p>
                      {chart.is3D && (
                        <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                          3D
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>X-Axis:</span>
                    <span className="font-medium">{chart.xAxis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Y-Axis:</span>
                    <span className="font-medium">{chart.yAxis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sheet:</span>
                    <span className="font-medium">{chart.sheetName}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    Created {new Date(chart.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Link data-testid={`button-view-chart-${chart.id}`} href={`/charts/${chart.id}`}>
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                      View Chart
                    </button>
                  </Link>
                  <button
                    data-testid={`button-download-chart-${chart.id}`}
                    onClick={() => {
                      // TODO: Implement download functionality
                      console.log('Download chart:', chart.id);
                    }}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Statistics */}
      {charts?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chart Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div data-testid="total-charts-stat" className="text-2xl font-bold text-blue-600">
                {charts.length}
              </div>
              <div className="text-sm text-gray-600">Total Charts</div>
            </div>
            <div className="text-center">
              <div data-testid="3d-charts-stat" className="text-2xl font-bold text-purple-600">
                {charts.filter(c => c.is3D).length}
              </div>
              <div className="text-sm text-gray-600">3D Charts</div>
            </div>
            <div className="text-center">
              <div data-testid="bar-charts-stat" className="text-2xl font-bold text-green-600">
                {charts.filter(c => c.chartType === 'bar').length}
              </div>
              <div className="text-sm text-gray-600">Bar Charts</div>
            </div>
            <div className="text-center">
              <div data-testid="pie-charts-stat" className="text-2xl font-bold text-orange-600">
                {charts.filter(c => c.chartType === 'pie' || c.chartType === 'doughnut').length}
              </div>
              <div className="text-sm text-gray-600">Pie Charts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}