import './messages.css';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div 
        className="messages-page bg-gray-100 overflow-hidden" 
        style={{ 
          height: '100vh', 
          width: '100vw', 
          margin: 0, 
          padding: 0,
          position: 'fixed',
          top: 0,
          left: 0
        }}
      >
        {children}
      </div>
    </>
  );
} 