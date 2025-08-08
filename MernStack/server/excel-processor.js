const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExcelProcessor {
  static processExcelFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheets = {};
      const sheetNames = workbook.SheetNames;
      let totalRowCount = 0;

      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0] || [];
          const dataRows = jsonData.slice(1);
          
          sheets[sheetName] = {
            headers: headers.filter(header => header !== undefined && header !== ''),
            data: dataRows.filter(row => row.some(cell => cell !== undefined && cell !== '')),
            rowCount: dataRows.length
          };
          
          totalRowCount += dataRows.length;
        }
      });

      return {
        sheets,
        sheetNames,
        totalRowCount,
        columns: Object.keys(sheets).reduce((acc, sheetName) => {
          acc[sheetName] = sheets[sheetName].headers;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw new Error('Failed to process Excel file');
    }
  }

  static extractChartData(filePath, sheetName, xAxis, yAxis, limit = 1000) {
    try {
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Sheet must have at least a header row and one data row');
      }

      const headers = jsonData[0];
      const xIndex = headers.indexOf(xAxis);
      const yIndex = headers.indexOf(yAxis);

      if (xIndex === -1) {
        throw new Error(`Column "${xAxis}" not found in sheet`);
      }
      if (yIndex === -1) {
        throw new Error(`Column "${yAxis}" not found in sheet`);
      }

      const dataRows = jsonData.slice(1, limit + 1); // Limit data for performance
      const chartData = {
        labels: [],
        datasets: [{
          label: `${yAxis} vs ${xAxis}`,
          data: [],
          backgroundColor: [],
          borderColor: [],
        }]
      };

      // Generate colors
      const colors = this.generateColors(dataRows.length);

      dataRows.forEach((row, index) => {
        const xValue = row[xIndex];
        const yValue = row[yIndex];

        if (xValue !== undefined && yValue !== undefined && yValue !== '') {
          chartData.labels.push(String(xValue));
          chartData.datasets[0].data.push(Number(yValue) || 0);
          chartData.datasets[0].backgroundColor.push(colors[index % colors.length].bg);
          chartData.datasets[0].borderColor.push(colors[index % colors.length].border);
        }
      });

      return chartData;
    } catch (error) {
      console.error('Error extracting chart data:', error);
      throw error;
    }
  }

  static generate3DChartData(filePath, sheetName, xAxis, yAxis, zAxis = null, limit = 1000) {
    try {
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Sheet must have at least a header row and one data row');
      }

      const headers = jsonData[0];
      const xIndex = headers.indexOf(xAxis);
      const yIndex = headers.indexOf(yAxis);
      const zIndex = zAxis ? headers.indexOf(zAxis) : -1;

      if (xIndex === -1) {
        throw new Error(`Column "${xAxis}" not found in sheet`);
      }
      if (yIndex === -1) {
        throw new Error(`Column "${yAxis}" not found in sheet`);
      }
      if (zAxis && zIndex === -1) {
        throw new Error(`Column "${zAxis}" not found in sheet`);
      }

      const dataRows = jsonData.slice(1, limit + 1);
      const chartData = [];

      dataRows.forEach((row, index) => {
        const xValue = row[xIndex];
        const yValue = row[yIndex];
        const zValue = zIndex !== -1 ? row[zIndex] : index;

        if (xValue !== undefined && yValue !== undefined) {
          chartData.push({
            x: Number(xValue) || 0,
            y: Number(yValue) || 0,
            z: Number(zValue) || 0,
            label: String(xValue)
          });
        }
      });

      return chartData;
    } catch (error) {
      console.error('Error generating 3D chart data:', error);
      throw error;
    }
  }

  static generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137.508) % 360; // Golden angle approximation
      const bg = `hsla(${hue}, 70%, 60%, 0.6)`;
      const border = `hsla(${hue}, 70%, 50%, 1)`;
      colors.push({ bg, border });
    }
    return colors;
  }

  static generateSummaryStats(filePath, sheetName) {
    try {
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        return { error: 'Insufficient data for analysis' };
      }

      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);
      const stats = {};

      headers.forEach((header, index) => {
        if (header) {
          const columnData = dataRows.map(row => row[index]).filter(val => val !== undefined && val !== '');
          const numericData = columnData.map(val => Number(val)).filter(val => !isNaN(val));

          stats[header] = {
            totalValues: columnData.length,
            numericValues: numericData.length,
            uniqueValues: new Set(columnData).size,
          };

          if (numericData.length > 0) {
            stats[header].min = Math.min(...numericData);
            stats[header].max = Math.max(...numericData);
            stats[header].avg = numericData.reduce((a, b) => a + b, 0) / numericData.length;
            stats[header].sum = numericData.reduce((a, b) => a + b, 0);
          }
        }
      });

      return {
        sheetName,
        totalRows: dataRows.length,
        totalColumns: headers.length,
        columnStats: stats
      };
    } catch (error) {
      console.error('Error generating summary stats:', error);
      throw error;
    }
  }

  static validateChartInputs(sheetData, xAxis, yAxis) {
    if (!sheetData || !sheetData.headers) {
      throw new Error('Invalid sheet data');
    }

    if (!sheetData.headers.includes(xAxis)) {
      throw new Error(`Column "${xAxis}" not found in sheet`);
    }

    if (!sheetData.headers.includes(yAxis)) {
      throw new Error(`Column "${yAxis}" not found in sheet`);
    }

    if (sheetData.data.length === 0) {
      throw new Error('No data rows found in sheet');
    }

    return true;
  }
}

module.exports = ExcelProcessor;