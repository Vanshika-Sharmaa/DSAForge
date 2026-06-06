import GraphVisualizer from '../components/GraphVisualizer'

export default function GraphPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <GraphVisualizer />
    </div>
  )
}
