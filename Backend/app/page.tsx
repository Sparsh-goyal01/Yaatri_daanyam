export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🙏 Welcome to Yaatri Backend API</h1>
      <p>Version: 1.0.0</p>
      <p>Status: Running</p>
      
      <h2>📋 Available Endpoints</h2>
      <ul>
        <li><strong>GET /api/sankalps</strong> - Fetch all spiritual intentions</li>
        <li><strong>GET /api/circuits?sankalpId=2</strong> - Fetch pilgrimage routes</li>
        <li><strong>GET /api/circuits/[id]/muhurats</strong> - Fetch auspicious dates</li>
        <li><strong>POST /api/bookings</strong> - Create new booking</li>
        <li><strong>GET /api/bookings/[id]</strong> - Retrieve booking</li>
        <li><strong>PATCH /api/bookings/[id]</strong> - Update booking</li>
        <li><strong>POST /api/bookings/[id]/submit</strong> - Finalize booking</li>
      </ul>

      <h2>📚 Documentation</h2>
      <p>See README.md for detailed API documentation and curl examples.</p>

      <h2>🚀 Getting Started</h2>
      <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
{`# Run dev server
npm run dev

# View database
npm run db:studio

# Run migrations
npm run db:migrate`}
      </pre>
    </div>
  );
}
