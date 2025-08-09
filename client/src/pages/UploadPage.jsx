import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export default function UploadPage() {
  const [location, setLocation] = useLocation();
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        e.target.value = '';
      }
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('excelFile', file);
    uploadMutation.mutate(formData);
  };

  const handleCreateChart = (fileId) => {
    setLocation(`/charts/create?fileId=${fileId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Excel File</h1>
        <p className="text-gray-600">Upload your Excel files to start creating charts and analyzing data</p>
      </div>

      {!uploadResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span data-testid="button-select-file">Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        data-testid="input-file-upload"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">Excel files (.xlsx, .xls) up to 10MB</p>
                </div>
              </div>

              {file && (
                <div data-testid="selected-file-info" className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 18h12V6l-4-4H4v16z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">{file.name}</p>
                      <p className="text-xs text-blue-700">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {uploadMutation.error && (
              <div data-testid="upload-error" className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="text-red-800">{uploadMutation.error.message}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploadMutation.isPending}
              data-testid="button-upload"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploadMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Upload File'
              )}
            </button>
          </form>
        </div>
      )}

      {uploadResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Successful!</h2>
              <p className="text-gray-600">Your file has been processed and is ready for analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-1">Total Sheets</h3>
              <p data-testid="upload-summary-sheets" className="text-2xl font-bold text-blue-600">{uploadResult.summary.totalSheets}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-1">Total Rows</h3>
              <p data-testid="upload-summary-rows" className="text-2xl font-bold text-green-600">{uploadResult.summary.totalRows.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-900 mb-1">File Size</h3>
              <p data-testid="upload-summary-size" className="text-2xl font-bold text-purple-600">{(uploadResult.file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sheet Details</h3>
            <div className="space-y-3">
              {Object.entries(uploadResult.sheets).map(([sheetName, sheetData]) => (
                <div key={sheetName} data-testid={`sheet-info-${sheetName}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{sheetName}</h4>
                    <span className="text-sm text-gray-500">{sheetData.rowCount} rows</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">Columns ({sheetData.headers.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {sheetData.headers.slice(0, 6).map((header, index) => (
                        <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {header}
                        </span>
                      ))}
                      {sheetData.headers.length > 6 && (
                        <span className="text-xs text-gray-500">+{sheetData.headers.length - 6} more</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => handleCreateChart(uploadResult.file.id)}
              data-testid="button-create-chart"
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              Create Chart
            </button>
            <button
              onClick={() => {
                setFile(null);
                setUploadResult(null);
              }}
              data-testid="button-upload-another"
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Upload Tips</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Supported formats: .xlsx and .xls files
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Maximum file size: 10MB
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Ensure your Excel file has proper column headers
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Multiple sheets are supported and will be processed separately
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Your file will be securely stored and only accessible to you
          </li>
        </ul>
      </div>
    </div>
  );
}