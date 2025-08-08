import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '../lib/queryClient';
import { useLocation } from 'wouter';
import ChartViewer from '../components/ChartViewer';

export default function ChartCreate() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Get fileId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const fileId = urlParams.get('fileId');
  
  const [formData, setFormData] = useState({
    title: '',
    chartType: 'bar',
    xAxis: '',
    yAxis: '',
    zAxis: '',
    sheetName: '',
    is3D: false
  });
  
  const [previewChart, setPreviewChart] = useState(null);

  // Fetch file details
  const { data: fileData, isLoading: fileLoading } = useQuery({
    queryKey: ['/api/files', fileId],
    queryFn: getQueryFn(),
    enabled: !!fileId,
  });

  const createChartMutation = useMutation({
    mutationFn: async (chartData) => {
      return await apiRequest('POST', '/api/charts', chartData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/charts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setLocation(`/charts/${data.chart.id}`);
    },
  });

  const previewMutation = useMutation({
    mutationFn: async (previewData) => {
      return await apiRequest('POST', '/api/charts', { ...previewData, title: 'Preview Chart' });
    },
    onSuccess: (data) => {
      setPreviewChart(data.chart);
    },
  });

  useEffect(() => {
    if (fileData?.sheets && Object.keys(fileData.sheets).length > 0) {
      const firstSheet = Object.keys(fileData.sheets)[0];
      const firstSheetData = fileData.sheets[firstSheet];
      
      setFormData(prev => ({
        ...prev,
        sheetName: firstSheet,
        xAxis: firstSheetData.headers[0] || '',
        yAxis: firstSheetData.headers[1] || '',
        zAxis: firstSheetData.headers[2] || '',
      }));
    }
  }, [fileData]);

  if (!fileId) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">No file selected for chart creation</div>
        <button
          onClick={() => setLocation('/files')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Browse Files
        </button>
      </div>
    );
  }

  if (fileLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">File not found or access denied</div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setPreviewChart(null); // Clear preview when form changes
  };

  const handlePreview = () => {
    if (formData.sheetName && formData.xAxis && formData.yAxis) {
      previewMutation.mutate({
        fileId: parseInt(fileId),
        ...formData,
      });
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a chart title');
      return;
    }
    
    createChartMutation.mutate({
      fileId: parseInt(fileId),
      ...formData,
    });
  };

  const currentSheetData = fileData.sheets[formData.sheetName];
  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', supports3D: true },
    { value: 'line', label: 'Line Chart', supports3D: false },
    { value: 'pie', label: 'Pie Chart', supports3D: false },
    { value: 'scatter', label: 'Scatter Plot', supports3D: true },
    { value: 'doughnut', label: 'Doughnut Chart', supports3D: false },
  ];

  const selectedChartType = chartTypes.find(type => type.value === formData.chartType);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Chart</h1>
        <p className="text-gray-600">File: {fileData.file.originalName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter chart title"
                data-testid="input-chart-title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sheet
              </label>
              <select
                value={formData.sheetName}
                onChange={(e) => handleInputChange('sheetName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="select-sheet"
              >
                {Object.keys(fileData.sheets).map(sheetName => (
                  <option key={sheetName} value={sheetName}>
                    {sheetName} ({fileData.sheets[sheetName].data.length} rows)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <select
                value={formData.chartType}
                onChange={(e) => {
                  const newType = e.target.value;
                  const typeInfo = chartTypes.find(t => t.value === newType);
                  handleInputChange('chartType', newType);
                  if (!typeInfo.supports3D) {
                    handleInputChange('is3D', false);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="select-chart-type"
              >
                {chartTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedChartType?.supports3D && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is3D"
                  checked={formData.is3D}
                  onChange={(e) => handleInputChange('is3D', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  data-testid="checkbox-3d"
                />
                <label htmlFor="is3D" className="ml-2 block text-sm text-gray-700">
                  Enable 3D visualization
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X-Axis (Horizontal)
              </label>
              <select
                value={formData.xAxis}
                onChange={(e) => handleInputChange('xAxis', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="select-x-axis"
              >
                <option value="">Select X-Axis</option>
                {currentSheetData?.headers.map(header => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Y-Axis (Vertical)
              </label>
              <select
                value={formData.yAxis}
                onChange={(e) => handleInputChange('yAxis', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="select-y-axis"
              >
                <option value="">Select Y-Axis</option>
                {currentSheetData?.headers.map(header => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            {formData.is3D && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Z-Axis (Depth) - Optional
                </label>
                <select
                  value={formData.zAxis}
                  onChange={(e) => handleInputChange('zAxis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="select-z-axis"
                >
                  <option value="">Select Z-Axis (Optional)</option>
                  {currentSheetData?.headers.map(header => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {createChartMutation.error && (
              <div data-testid="create-chart-error" className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="text-red-800">{createChartMutation.error.message}</div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handlePreview}
                disabled={!formData.sheetName || !formData.xAxis || !formData.yAxis || previewMutation.isPending}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                data-testid="button-preview-chart"
              >
                {previewMutation.isPending ? 'Generating Preview...' : 'Preview Chart'}
              </button>
              
              <button
                type="submit"
                disabled={!formData.title.trim() || !formData.sheetName || !formData.xAxis || !formData.yAxis || createChartMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                data-testid="button-create-chart"
              >
                {createChartMutation.isPending ? 'Creating Chart...' : 'Create Chart'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Preview</h3>
          
          {previewChart ? (
            <ChartViewer chart={previewChart} />
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">Configure your chart and click "Preview" to see how it will look</p>
              </div>
            </div>
          )}

          {previewMutation.error && (
            <div data-testid="preview-error" className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-800">{previewMutation.error.message}</div>
            </div>
          )}
        </div>
      </div>

      {/* Data Preview */}
      {currentSheetData && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview ({formData.sheetName})</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {currentSheetData.headers.map((header, index) => (
                    <th
                      key={index}
                      className={`px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        header === formData.xAxis || header === formData.yAxis || header === formData.zAxis
                          ? 'bg-blue-100 text-blue-700'
                          : ''
                      }`}
                    >
                      {header}
                      {header === formData.xAxis && <span className="ml-1 text-blue-600">(X)</span>}
                      {header === formData.yAxis && <span className="ml-1 text-blue-600">(Y)</span>}
                      {header === formData.zAxis && <span className="ml-1 text-blue-600">(Z)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSheetData.data.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {currentSheetData.headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-4 py-2 whitespace-nowrap text-sm text-gray-900 ${
                          header === formData.xAxis || header === formData.yAxis || header === formData.zAxis
                            ? 'bg-blue-50'
                            : ''
                        }`}
                      >
                        {row[colIndex] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {currentSheetData.data.length > 5 && (
              <div className="text-sm text-gray-500 text-center py-2">
                Showing 5 of {currentSheetData.data.length} rows
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}