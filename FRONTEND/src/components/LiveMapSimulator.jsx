import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Bike, Clock, ShieldCheck } from 'lucide-react';

const LiveMapSimulator = ({ order, currentStatus, socket }) => {
  const [progress, setProgress] = useState(order?.deliveryCoordinates?.progressPercent || 35);

  useEffect(() => {
    if (order?.deliveryCoordinates?.progressPercent) {
      setProgress(order.deliveryCoordinates.progressPercent);
    }
  }, [order]);

  // Adjust progress automatically when status changes
  useEffect(() => {
    if (currentStatus === 'Delivered') {
      setProgress(100);
    } else if (currentStatus === 'Out for Delivery' && progress < 40) {
      setProgress(60);
    } else if (currentStatus === 'Preparing' && progress < 20) {
      setProgress(25);
    }
  }, [currentStatus]);

  // Simulated live driver movement
  const handleSimulateStep = () => {
    const nextProgress = Math.min(100, progress + 15);
    setProgress(nextProgress);
    if (socket && order?._id) {
      socket.emit('sendDriverLocation', {
        orderId: order._id,
        lat: 12.9716,
        lng: 77.5946,
        progressPercent: nextProgress
      });
    }
  };

  // Compute bike SVG position along an S-curve path
  const t = progress / 100;
  // Bezier curve points: P0=(40, 160), P1=(140, 50), P2=(260, 250), P3=(360, 100)
  // Approximate coordinates for scooter positioning
  const bikeX = 40 + t * 320;
  const bikeY = 160 - Math.sin(t * Math.PI) * 70 + Math.sin(t * 2 * Math.PI) * 20;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative border border-slate-700">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* Header Info */}
      <div className="relative z-10 flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Bike className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider text-orange-400 font-bold">Live GPS Tracking</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <h4 className="text-base font-bold text-white">
              {progress >= 100 ? 'Order Arrived!' : `${Math.max(5, Math.round((100 - progress) * 0.35))} mins away`}
            </h4>
          </div>
        </div>

        <button
          onClick={handleSimulateStep}
          disabled={progress >= 100}
          className="text-xs bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold px-3 py-1.5 rounded-full transition shadow-md active:scale-95"
        >
          {progress >= 100 ? 'Delivered' : 'Simulate Partner Movement ➔'}
        </button>
      </div>

      {/* Interactive Map Visual (SVG Canvas) */}
      <div className="relative z-10 w-full h-56 bg-slate-950/60 rounded-2xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 400 240" className="w-full h-full">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Road Network Background Lines */}
          <path d="M 10 70 L 390 70" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
          <path d="M 10 180 L 390 180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
          <path d="M 120 10 L 120 230" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
          <path d="M 280 10 L 280 230" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />

          {/* Delivery Route Path */}
          <path
            d="M 50 160 C 130 70, 240 240, 350 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 50 160 C 130 70, 240 240, 350 100"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="6 6"
            className="animate-pulse"
          />

          {/* Restaurant Pin */}
          <g transform="translate(50, 160)">
            <circle r="14" fill="#f97316" filter="url(#glow)" />
            <circle r="7" fill="#ffffff" />
            <text x="0" y="30" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">
              {order?.restaurant?.name ? order.restaurant.name.slice(0, 12) : 'Restaurant'}
            </text>
          </g>

          {/* Customer Home Pin */}
          <g transform="translate(350, 100)">
            <circle r="14" fill="#10b981" filter="url(#glow)" />
            <circle r="7" fill="#ffffff" />
            <text x="0" y="30" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
              Home
            </text>
          </g>

          {/* Moving Delivery Partner Marker */}
          <g transform={`translate(${bikeX}, ${bikeY})`} style={{ transition: 'all 0.6s ease-out' }}>
            {/* Pulsing Beacon Ring */}
            <circle r="18" fill="#f97316" opacity="0.3" className="animate-ping" />
            <circle r="14" fill="#f97316" filter="url(#glow)" />
            <circle r="11" fill="#0f172a" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10">🛵</text>
          </g>
        </svg>

        {/* Live Status Badge overlay on Map */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center space-x-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Contactless Safe Delivery In Progress</span>
        </div>
      </div>

      {/* Progress Bar & Stages */}
      <div className="relative z-10 mt-4">
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-medium">
          <span>Kitchen Pick-up</span>
          <span className={progress >= 50 ? 'text-orange-400 font-bold' : ''}>On Transit</span>
          <span className={progress >= 95 ? 'text-emerald-400 font-bold' : ''}>Your Doorstep</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMapSimulator;

