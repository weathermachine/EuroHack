import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useUIStore } from '../../stores/uiStore';
import { StrudelRepl } from '../Repl/StrudelRepl';
import HydraCanvas from '../Viz/HydraCanvas';
import ChatInterface from '../Chat/ChatInterface';
import SampleBrowser from '../SampleBrowser/SampleBrowser';
import styles from './PanelLayout.module.css';

export default function PanelLayout() {
  const vizFullscreen = useUIStore((s) => s.vizFullscreen);
  const setActivePanel = useUIStore((s) => s.setActivePanel);

  return (
    <div className={styles.layout}>
      <PanelGroup direction="vertical">
        {/* Top: Code + Viz */}
        <Panel defaultSize={75} minSize={30}>
          <PanelGroup direction="horizontal">
            {!vizFullscreen && (
              <>
                <Panel defaultSize={55} minSize={20}>
                  <div
                    className={`${styles.panel} panel-border`}
                    onClick={() => setActivePanel('code')}
                  >
                    <div className={styles.panelHeader}>Code</div>
                    <StrudelRepl />
                  </div>
                </Panel>
                <PanelResizeHandle
                  className={`${styles.resizeHandle} ${styles.resizeHandleHorizontal}`}
                />
              </>
            )}
            <Panel defaultSize={vizFullscreen ? 100 : 45} minSize={20}>
              <div
                className={`${styles.panel} panel-border`}
                onClick={() => setActivePanel('viz')}
              >
                <div className={styles.panelHeader}>Viz</div>
                <HydraCanvas />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle
          className={`${styles.resizeHandle} ${styles.resizeHandleVertical}`}
        />

        {/* Bottom: Chat + Sample Browser */}
        <Panel defaultSize={25} minSize={15}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize={70} minSize={30}>
              <div
                className={`${styles.panel} panel-border`}
                onClick={() => setActivePanel('chat')}
              >
                <div className={styles.panelHeader}>Chat</div>
                <ChatInterface />
              </div>
            </Panel>
            <PanelResizeHandle
              className={`${styles.resizeHandle} ${styles.resizeHandleHorizontal}`}
            />
            <Panel defaultSize={30} minSize={15}>
              <div className={`${styles.panel} panel-border`}>
                <div className={styles.panelHeader}>Samples</div>
                <SampleBrowser />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
