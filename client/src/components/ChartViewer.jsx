import { useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

// 3D Chart Component
function Chart3D({ data, chartType, title }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const maxValue = Math.max(...data.map(d => d.y));
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  if (chartType === '3d-bar') {
    return (
      <>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <OrbitControls />
        
        {data.map((point, index) => {
          const height = (point.y / maxValue) * 5;
          const xPos = (index - data.length / 2) * 1.5;
          
          return (
            <group key={index}>
              <mesh
                ref={index === 0 ? meshRef : null}
                position={[xPos, height / 2, 0]}
              >
                <boxGeometry args={[0.8, height, 0.8]} />
                <meshStandardMaterial color={colors[index % colors.length]} />
              </mesh>
              <Text
                position={[xPos, -0.5, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.3}
                color="black"
                anchorX="center"
                anchorY="middle"
              >
                {point.label}
              </Text>
            </group>
          );
        })}
        
        <Text
          position={[0, 6, 0]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      </>
    );
  }

  if (chartType === '3d-scatter') {
    return (
      <>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <OrbitControls />
        
        {data.map((point, index) => (
          <mesh
            key={index}
            position={[
              (point.x / maxValue) * 5 - 2.5,
              (point.y / maxValue) * 5 - 2.5,
              (point.z / maxValue) * 5 - 2.5
            ]}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={colors[index % colors.length]} />
          </mesh>
        ))}
        
        <Text
          position={[0, 6, 0]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      </>
    );
  }

  return null;
}

export default function ChartViewer({ chart, className = "" }) {
  const canvasRef = useRef();
  const chartInstance = useRef();

  useEffect(() => {
    if (!chart || chart.is3D) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new ChartJS(ctx, {
      type: chart.chartType,
      data: chart.chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chart.title,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: chart.chartType !== 'pie',
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: chart.chartType !== 'pie' ? {
          x: {
            display: true,
            title: {
              display: true,
              text: chart.xAxis
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: chart.yAxis
            },
            beginAtZero: true
          }
        } : undefined,
        ...chart.chartOptions
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chart]);

  if (!chart) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-gray-500">No chart data available</div>
      </div>
    );
  }

  if (chart.is3D) {
    return (
      <div className={`h-96 w-full ${className}`} data-testid="chart-3d-viewer">
        <Canvas camera={{ position: [5, 5, 5] }}>
          <Chart3D 
            data={chart.chartData} 
            chartType={chart.chartType} 
            title={chart.title}
          />
        </Canvas>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} data-testid="chart-2d-viewer">
      <canvas 
        ref={canvasRef}
        className="w-full h-96"
        style={{ maxHeight: '400px' }}
      />
    </div>
  );
}