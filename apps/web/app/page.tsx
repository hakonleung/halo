import { Navbar } from '../components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            background: 'linear-gradient(135deg, #131722 0%, #1e222d 100%)',
            color: 'white',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '800px' }}>
            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #2196f3, #21cbf3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Halo 股票分析平台
            </h1>
            <p
              style={{
                fontSize: '1.25rem',
                color: '#9598a1',
                marginBottom: '2rem',
                lineHeight: '1.6',
              }}
            >
              专业的A股数据分析工具，为投资者提供实时行情、技术分析和智能决策支持
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginTop: '3rem',
              }}
            >
              <div
                style={{
                  background: 'rgba(33, 150, 243, 0.1)',
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(33, 150, 243, 0.2)',
                }}
              >
                <h3 style={{ color: '#2196f3', marginBottom: '1rem' }}>实时行情</h3>
                <p style={{ color: '#d1d4dc' }}>获取A股市场实时股价、成交量等关键数据</p>
              </div>

              <div
                style={{
                  background: 'rgba(76, 175, 80, 0.1)',
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                }}
              >
                <h3 style={{ color: '#4caf50', marginBottom: '1rem' }}>技术分析</h3>
                <p style={{ color: '#d1d4dc' }}>专业的K线图表和技术指标分析工具</p>
              </div>

              <div
                style={{
                  background: 'rgba(255, 152, 0, 0.1)',
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 152, 0, 0.2)',
                }}
              >
                <h3 style={{ color: '#ff9800', marginBottom: '1rem' }}>智能推荐</h3>
                <p style={{ color: '#d1d4dc' }}>基于大数据分析的投资建议和风险提示</p>
              </div>
            </div>

            <div style={{ marginTop: '3rem', color: '#9598a1' }}>
              <p>立即登录开始您的投资分析之旅</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
