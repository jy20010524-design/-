import React from 'react';
// CRITICAL FIX: This import registers the necessary Chart.js components (scales, legends, etc.)
// Without it, opening the chart causes a white screen crash.
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import { X, TrendingUp } from 'lucide-react';
import { DailyRecord } from '../types';

interface ChartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DailyRecord[];
}

export const ChartsModal: React.FC<ChartsModalProps> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  // Process data to ensure visualization works well even with little data
  let processedHistory = [...history];

  // If we have exactly 1 record (e.g. first day), prepend a "zero" start point
  // so the user sees a line going up from 0 to their current score.
  if (processedHistory.length === 1) {
    try {
      const currentStr = processedHistory[0].date;
      // Safe parsing of YYYY-MM-DD to avoid timezone issues with new Date(string)
      const parts = currentStr.split('-').map(Number);
      if (parts.length === 3) {
          // Construct date at noon to be safe against DST/Timezone shifts
          const dateObj = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
          dateObj.setDate(dateObj.getDate() - 1);
          
          const y = dateObj.getFullYear();
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const d = String(dateObj.getDate()).padStart(2, '0');
          const prevDateStr = `${y}-${m}-${d}`;

          processedHistory.unshift({
            date: prevDateStr,
            pointsEarned: 0,
            moneySpent: 0
          });
      }
    } catch (e) {
      console.error("Date parsing error in charts", e);
    }
  }

  // Take last 30 days
  const displayHistory = processedHistory.slice(-30);
  
  const labels = displayHistory.map(h => h.date.slice(5)); // MM-DD
  const pointsData = displayHistory.map(h => h.pointsEarned);
  const spentData = displayHistory.map(h => h.moneySpent);

  const data = {
    labels,
    datasets: [
      {
        label: '每日积分',
        data: pointsData,
        borderColor: '#9CAD9F', // brand-500 (Sage)
        backgroundColor: 'rgba(156, 173, 159, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#9CAD9F',
        pointRadius: 4,
      },
      {
        label: '每日消费',
        data: spentData,
        borderColor: '#D99F99', // accent-500 (Dusty Pink)
        backgroundColor: 'rgba(217, 159, 153, 0.0)',
        borderDash: [6, 6],
        tension: 0.4,
        pointBackgroundColor: '#D99F99',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: {
            family: "'Quicksand', sans-serif",
            size: 12
          },
          color: '#8C8C8C'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#5E5E5E',
        bodyColor: '#5E5E5E',
        borderColor: '#E6EBE8',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        boxPadding: 4,
        titleFont: { family: "'Quicksand', sans-serif" },
        bodyFont: { family: "'Quicksand', sans-serif" },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F4F6F5',
        },
        ticks: {
          font: { family: "'Quicksand', sans-serif" },
          color: '#8C8C8C'
        },
        border: { display: false }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { family: "'Quicksand', sans-serif" },
          color: '#8C8C8C'
        },
        border: { display: false }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh] border-4 border-white">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-50/50 shrink-0">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={24} className="text-brand-500" />
            趋势统计
          </h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex-1 min-h-[300px] relative">
          {processedHistory.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm flex-col gap-2">
              <div className="bg-gray-100 p-4 rounded-full">
                <TrendingUp size={32} className="opacity-30" />
              </div>
              <p>暂无数据，请先完成一个挑战吧！</p>
            </div>
          ) : (
            <Line data={data} options={options} />
          )}
        </div>
      </div>
    </div>
  );
};