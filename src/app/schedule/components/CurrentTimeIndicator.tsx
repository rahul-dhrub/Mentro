interface CurrentTimeIndicatorProps {
  currentTime: Date;
}

export default function CurrentTimeIndicator({ currentTime }: CurrentTimeIndicatorProps) {
  const calculatePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    
    // Calculate position relative to 12AM (midnight) start
    const totalMinutes = hours * 60 + minutes;
    const position = (totalMinutes / 60) * 60; // 60px per hour
    
    return Math.max(0, position);
  };

  const formatCurrentTime = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const position = calculatePosition();

  return (
    <div 
      className="absolute left-20 right-0 z-10"
      style={{ top: `${position}px` }}
    >
      <div className="flex items-center">
        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mr-2 shadow-sm">
          {formatCurrentTime()}
        </div>
        <div className="flex-1 h-0.5 bg-red-500"></div>
      </div>
    </div>
  );
} 