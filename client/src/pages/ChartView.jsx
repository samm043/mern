import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '../lib/queryClient';
import { useLocation } from 'wouter';
import { useRef } from 'react';
import ChartViewer from '../components/ChartViewer';

export default function ChartView({ params }) {
  const chartId = params.id;
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const chartRef = useRef();

  const { data: chart, isLoading, error } = useQuery({
    queryKey: ['/api/charts', chartId],
    queryFn: getQueryFn(),
    enabled: !!chartId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/charts/${chartId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/charts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setLocation('/charts');
    },
  });

  const downloadChart = () => {
    if (!chartRef.current || !chart) return;

    if (chart.is3D) {
      // For 3D charts, we would need to implement WebGL screenshot functionality
      alert('3D chart download is not yet implemented. Please use your browser\'s screenshot function.');
      return;
    }

    // For 2D charts, use Chart.js built-in functionality
    const canvas = chartRef.current.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${chart.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      link.href = url;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !chart) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">
          {error?.message || 'Chart not found'}
        </div>
        <button
          onClick={() => setLocation('/charts')}
          className="text-blue-600 hover:underline"
        >
          Back to Charts
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this chart? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <button
              data-testid="button-back-to-charts"
              onClick={() => setLocation('/charts')}
              className="hover:text-gray-700"
            >
              ← Back to Charts
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{chart.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="capitalize">{chart.is3D ? '3D ' : ''}{chart.chartType} Chart</span>
            <span>•</span>
            <span>Sheet: {chart.sheetName}</span>
            <span>•</span>
            <span>Created {new Date(chart.createdAt).toLocaleDateString()}</span>
            {chart.is3D && (
              <>
                <span>•</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                  3D
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            data-testid="button-download-chart"
            onClick={downloadChart}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            Download
          </button>
          <button
            data-testid="button-delete-chart"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Chart Display */}
      <div className="bg-white rounded-lg shadow p-6">
        <div ref={chartRef}>
          <ChartViewer chart={chart} />
        </div>
      </div>

      {/* Chart Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chart Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Chart Type:</span>
              <span className="font-medium capitalize">{chart.is3D ? '3D ' : ''}{chart.chartType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">X-Axis:</span>
              <span className="font-medium">{chart.xAxis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Y-Axis:</span>
              <span className="font-medium">{chart.yAxis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sheet Name:</span>
              <span className="font-medium">{chart.sheetName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Points:</span>
              <span className="font-medium">
                {chart.is3D 
                  ? chart.chartData?.length || 0
                  : chart.chartData?.labels?.length || 0
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{new Date(chart.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Sample</h2>
          {chart.is3D ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">3D Data Points (showing first 5):</div>
              <div className="space-y-1 text-sm">
                {chart.chartData?.slice(0, 5).map((point, index) => (
                  <div key={index} data-testid={`data-point-${index}`} className="flex justify-between border-b border-gray-100 pb-1">
                    <span>{point.label}</span>
                    <span>({point.x}, {point.y}, {point.z})</span>
                  </div>
                ))}
                {chart.chartData?.length > 5 && (
                  <div className="text-xs text-gray-500 pt-1">
                    ... and {chart.chartData.length - 5} more points
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Data Points (showing first 5):</div>
              <div className="space-y-1 text-sm">
                {chart.chartData?.labels?.slice(0, 5).map((label, index) => (
                  <div key={index} data-testid={`data-point-${index}`} className="flex justify-between border-b border-gray-100 pb-1">
                    <span>{label}</span>
                    <span>{chart.chartData.datasets?.[0]?.data?.[index] || 0}</span>
                  </div>
                ))}
                {(chart.chartData?.labels?.length || 0) > 5 && (
                  <div className="text-xs text-gray-500 pt-1">
                    ... and {(chart.chartData?.labels?.length || 0) - 5} more points
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Chart Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Available Actions:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Download chart as PNG image</li>
              <li>• Delete chart permanently</li>
              <li>• View chart in fullscreen</li>
              {chart.is3D && <li>• Rotate and zoom 3D visualization</li>}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Tips:</h4>
            <ul className="space-y-1 text-blue-700">
              {chart.is3D ? (
                <>
                  <li>• Click and drag to rotate the 3D view</li>
                  <li>• Use mouse wheel to zoom in/out</li>
                  <li>• Right-click and drag to pan</li>
                </>
              ) : (
                <>
                  <li>• Hover over data points for details</li>
                  <li>• Click legend items to toggle visibility</li>
                  <li>• Right-click to access browser options</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {deleteMutation.error && (
        <div data-testid="delete-error" className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Failed to delete chart: {deleteMutation.error.message}</div>
        </div>
      )}
    </div>
  );
}