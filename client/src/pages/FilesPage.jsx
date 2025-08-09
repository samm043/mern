import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';
import { Link } from 'wouter';

export default function FilesPage() {
  const { data: files, isLoading, error } = useQuery({
    queryKey: ['/api/files'],
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
        <div className="text-red-800">Failed to load files: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
        <Link data-testid="button-upload-file" href="/upload">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Upload New File
          </button>
        </Link>
      </div>

      {files?.length === 0 ? (
        <div data-testid="no-files-message" className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
          <p className="text-gray-500 mb-4">Upload your first Excel file to start creating charts</p>
          <Link href="/upload">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Upload File
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files?.map((file) => (
            <div key={file.id} data-testid={`file-card-${file.id}`} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 18h12V6l-4-4H4v16z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate" title={file.originalName}>
                        {file.originalName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {file.sheets.length} sheet{file.sheets.length !== 1 ? 's' : ''} • {file.rowCount.toLocaleString()} rows
                      </p>
                      <p className="text-sm text-gray-500">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-xs text-gray-400">
                    Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Sheets:</p>
                  <div className="flex flex-wrap gap-1">
                    {file.sheets.slice(0, 3).map((sheet, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {sheet}
                      </span>
                    ))}
                    {file.sheets.length > 3 && (
                      <span className="text-xs text-gray-500">+{file.sheets.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex space-x-2">
                  <Link data-testid={`button-create-chart-${file.id}`} href={`/charts/create?fileId=${file.id}`}>
                    <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                      Create Chart
                    </button>
                  </Link>
                  <Link data-testid={`button-view-details-${file.id}`} href={`/files/${file.id}`}>
                    <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}