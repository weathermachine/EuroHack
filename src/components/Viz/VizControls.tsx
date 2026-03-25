import { useVizStore } from '@/stores/vizStore';
import { SHADER_PRESETS } from './shaderPresets';
import styles from './VizControls.module.css';

export default function VizControls() {
  const selectedShader = useVizStore(s => s.selectedShader);
  const setSelectedShader = useVizStore(s => s.setSelectedShader);

  const categories = [...new Set(SHADER_PRESETS.map(p => p.category))];

  return (
    <div className={styles.controls}>
      <select
        className={styles.select}
        value={selectedShader}
        onChange={e => setSelectedShader(e.target.value)}
      >
        {categories.map(cat => (
          <optgroup key={cat} label={cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}>
            {SHADER_PRESETS.filter(p => p.category === cat).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
