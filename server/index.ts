import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat';
import engineRouter from './routes/engine';

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('⚠️  ANTHROPIC_API_KEY is not set. Chat will not work.');
  console.error('   Set it with: export ANTHROPIC_API_KEY=sk-ant-...');
}

app.use(cors());
app.use(express.json());

app.use('/api', chatRouter);
app.use('/api', engineRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
  });
});

app.listen(PORT, () => {
  console.log(`AI Rack server listening on http://localhost:${PORT}`);
});
