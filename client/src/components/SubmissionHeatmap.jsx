import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import axios from 'axios';
import { motion } from 'framer-motion';

const SubmissionHeatmap = ({ userId }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/submissions/heatmap/${userId}`
        );
        
        // Transform data for react-calendar-heatmap
        const transformedData = response.data.map(item => ({
          date: new Date(item.date).toISOString().split('T')[0],
          count: item.count
        }));
        
        setHeatmapData(transformedData);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-[#1E1E2E] p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">📊 Activity Heatmap</h3>
        <div className="animate-pulse bg-gray-700 h-32 rounded"></div>
      </div>
    );
  }

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#1E1E2E] p-6 rounded-xl shadow-lg"
    >
      <h3 className="text-xl font-bold text-white mb-4">📊 Submission Activity</h3>
      <div className="heatmap-container">
        <CalendarHeatmap
          startDate={oneYearAgo}
          endDate={today}
          values={heatmapData}
          classForValue={(value) => {
            if (!value || value.count === 0) {
              return 'color-empty';
            }
            if (value.count === 1) return 'color-scale-1';
            if (value.count === 2) return 'color-scale-2'; 
            if (value.count === 3) return 'color-scale-3';
            return 'color-scale-4';
          }}
          tooltipDataAttrs={(value) => {
            if (!value || !value.date) return {};
            return {
              'data-tip': `${value.count || 0} submissions on ${value.date}`,
            };
          }}
          showWeekdayLabels={true}
        />
      </div>
      
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-900"></div>
          <div className="w-3 h-3 rounded-sm bg-green-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
          <div className="w-3 h-3 rounded-sm bg-green-300"></div>
        </div>
        <span>More</span>
      </div>

      <style jsx>{`
        .heatmap-container .react-calendar-heatmap {
          width: 100%;
        }
        
        .heatmap-container .react-calendar-heatmap .color-empty {
          fill: #374151;
        }
        
        .heatmap-container .react-calendar-heatmap .color-scale-1 {
          fill: #064e3b;
        }
        
        .heatmap-container .react-calendar-heatmap .color-scale-2 {
          fill: #059669;
        }
        
        .heatmap-container .react-calendar-heatmap .color-scale-3 {
          fill: #10b981;
        }
        
        .heatmap-container .react-calendar-heatmap .color-scale-4 {
          fill: #34d399;
        }
        
        .heatmap-container .react-calendar-heatmap text {
          fill: #9ca3af;
          font-size: 12px;
        }
        
        .heatmap-container .react-calendar-heatmap .react-calendar-heatmap-month-label {
          font-size: 12px;
        }
        
        .heatmap-container .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
          font-size: 10px;
        }
      `}</style>
    </motion.div>
  );
};

export default SubmissionHeatmap;
