import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ArrowRight, ArrowUpRight, CircleCheck, TriangleAlert, RotateCcw } from 'lucide-react'
import PulseTrace from './PulseTrace'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const QUESTIONS = [
  { id: 'A1_Score', text: "I often notice small sounds when others do not.", agreeCounts: true },
  { id: 'A2_Score', text: "I usually concentrate more on the whole picture, rather than the small details.", agreeCounts: false },
  { id: 'A3_Score', text: "I find it easy to do more than one thing at once.", agreeCounts: false },
  { id: 'A4_Score', text: "If there is an interruption, I can switch back to what I was doing very quickly.", agreeCounts: false },
  { id: 'A5_Score', text: "I find it easy to 'read between the lines' when someone is talking to me.", agreeCounts: false },
  { id: 'A6_Score', text: "I know how to tell if someone listening to me is getting bored.", agreeCounts: false },
  { id: 'A7_Score', text: "When I'm reading a story, I find it difficult to work out the characters' intentions.", agreeCounts: true },
  { id: 'A8_Score', text: "I like to collect information about categories of things.", agreeCounts: true },
  { id: 'A9_Score', text: "I find it easy to work out what someone is thinking or feeling just by looking at their face.", agreeCounts: false },
  { id: 'A10_Score', text: "I find it difficult to work out people's intentions.", agreeCounts: true },
]

const LIKERT = [
  { label: 'Definitely Agree', agree: true },
  { label: 'Slightly Agree', agree: true },
  { label: 'Slightly Disagree', agree: false },
  { label: 'Definitely Disagree', agree: false },
]

const ETHNICITIES = ['White-European', 'Asian', 'Black', 'Hispanic', 'Latino', 'Middle Eastern', 'South Asian', 'Pasifika', 'Others']
const RELATIONS = ['Self', 'Parent', 'Relative', 'Health care professional', 'Others']

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

function RadialDial({ pct, color }) {
  const r = 70
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" className="radial-dial">
      <circle cx="90" cy="90" r={r} className="dial-track" />
      <motion.circle
        cx="90" cy="90" r={r}
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        transform="rotate(-90 90 90)"
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * pct) / 100 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
      <text x="90" y="86" textAnchor="middle" className="dial-pct">{pct}%</text>
      <text x="90" y="106" textAnchor="middle" className="dial-caption">LIKELIHOOD</text>
    </svg>
  )
}

function Landing({ onStart, modelInfo }) {
  const best = modelInfo?.comparison?.find(m => m.model === modelInfo.best_model)
  const idlePulse = [null, 1, 0, 1, null, 0, 1, null, 1, 0]

  return (
    <motion.div className="view landing" {...fadeUp}>
      <div className="badge"><Activity size={13} /> AQ-10 SCREENING ENGINE</div>

      <h1 className="hero-title">
        Ten questions.<br />
        <em>Four models</em> reading the signal.
      </h1>

      <p className="hero-sub">
        Behavioural screening for Autism Spectrum Disorder, scored live by four
        machine learning models trained side-by-side — Logistic Regression, SVM,
        Random Forest, and KNN. Not a diagnosis, but a well-informed first read.
      </p>

      <div className="hero-trace">
        <PulseTrace values={idlePulse} height={110} idle />
      </div>

      <button className="btn-primary" onClick={onStart}>
        Start screening <ArrowRight size={17} />
      </button>

      {best && (
        <div className="stat-row">
          <div className="stat-chip">
            <span className="stat-chip-label">Top model</span>
            <span className="stat-chip-value">{modelInfo.best_model}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-label">CV accuracy</span>
            <span className="stat-chip-value mono">{(best.cv_mean_accuracy * 100).toFixed(1)}%</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-label">Recall</span>
            <span className="stat-chip-value mono">{(best.recall * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      <p className="footnote">
        Screening only — always follow up with a licensed clinician for a formal evaluation.
      </p>
    </motion.div>
  )
}

function Questionnaire({ answers, setAnswers, demo, setDemo, onSubmit }) {
  const traceValues = QUESTIONS.map(q => answers[q.id] === undefined ? null : answers[q.id])
  const answeredCount = Object.keys(answers).length
  const allAnswered = QUESTIONS.every(q => answers[q.id] !== undefined)
  const demoValid = demo.age && demo.gender

  return (
    <motion.div className="view questionnaire" {...fadeUp}>
      <div className="trace-header">
        <PulseTrace values={traceValues} height={90} />
        <span className="trace-count mono">{answeredCount}/10 answered</span>
      </div>

      <div className="badge">SECTION 1</div>
      <h2 className="section-title">Answer as it generally applies to you</h2>

      <div className="question-list">
        {QUESTIONS.map((q, idx) => (
          <div className="question-card" key={q.id}>
            <span className="q-number mono">{String(idx + 1).padStart(2, '0')}</span>
            <div className="q-body">
              <p className="q-text">{q.text}</p>
              <div className="q-options">
                {LIKERT.map(opt => {
                  const scored = opt.agree === q.agreeCounts ? 1 : 0
                  const selected = answers[q.id] === scored
                  return (
                    <button
                      key={opt.label}
                      className={`q-option ${selected ? 'selected' : ''}`}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: scored }))}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="badge">SECTION 2</div>
      <h2 className="section-title">A little background</h2>

      <div className="demo-grid">
        <label className="field">
          <span>Age</span>
          <input type="number" min="1" max="120" value={demo.age}
            onChange={e => setDemo(prev => ({ ...prev, age: e.target.value }))} />
        </label>
        <label className="field">
          <span>Gender</span>
          <select value={demo.gender} onChange={e => setDemo(prev => ({ ...prev, gender: e.target.value }))}>
            <option value="">Select</option>
            <option value="f">Female</option>
            <option value="m">Male</option>
          </select>
        </label>
        <label className="field">
          <span>Ethnicity</span>
          <select value={demo.ethnicity} onChange={e => setDemo(prev => ({ ...prev, ethnicity: e.target.value }))}>
            {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Completing this as</span>
          <select value={demo.relation} onChange={e => setDemo(prev => ({ ...prev, relation: e.target.value }))}>
            {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="field field-toggle">
          <span>Jaundice at birth</span>
          <div className="toggle-pair">
            <button className={demo.jaundice === 'yes' ? 'on' : ''} onClick={() => setDemo(p => ({ ...p, jaundice: 'yes' }))}>Yes</button>
            <button className={demo.jaundice === 'no' ? 'on' : ''} onClick={() => setDemo(p => ({ ...p, jaundice: 'no' }))}>No</button>
          </div>
        </label>
        <label className="field field-toggle">
          <span>Family history of autism</span>
          <div className="toggle-pair">
            <button className={demo.austim === 'yes' ? 'on' : ''} onClick={() => setDemo(p => ({ ...p, austim: 'yes' }))}>Yes</button>
            <button className={demo.austim === 'no' ? 'on' : ''} onClick={() => setDemo(p => ({ ...p, austim: 'no' }))}>No</button>
          </div>
        </label>
      </div>

      <button className="btn-primary btn-block" disabled={!allAnswered || !demoValid} onClick={onSubmit}>
        {allAnswered && demoValid ? <>See results <ArrowRight size={17} /></> : `Answer all 10 questions to continue`}
      </button>
    </motion.div>
  )
}

function ResultView({ result, answers, onRestart, modelInfo }) {
  const pct = Math.round(result.probability * 100)
  const likely = result.prediction.toLowerCase().includes('detected')
  const color = likely ? 'var(--coral)' : 'var(--mint)'
  const traceValues = QUESTIONS.map(q => answers[q.id])

  return (
    <motion.div className="view result" {...fadeUp}>
      <div className="badge">SCREENING COMPLETE</div>
      <h2 className="section-title result-title">
        {likely ? <TriangleAlert size={26} color={color} /> : <CircleCheck size={26} color={color} />}
        {result.prediction}
      </h2>

      <div className="result-top">
        <RadialDial pct={pct} color={color} />
        <div className="result-facts">
          <div className="fact"><span>Model used</span><strong>{result.model_used}</strong></div>
          <div className="fact"><span>Probability</span><strong className="mono">{pct}%</strong></div>
          <div className="fact"><span>Clinical threshold</span><strong className="mono">≥ 6 / 10</strong></div>
        </div>
      </div>

      <div className="result-trace-wrap">
        <PulseTrace values={traceValues} height={90} color={color} />
      </div>

      <p className="disclaimer">{result.disclaimer}</p>

      {modelInfo && (
        <div className="comparison-block">
          <div className="badge">MODEL COMPARISON <ArrowUpRight size={12} /></div>
          <table>
            <thead><tr><th>Model</th><th>CV Acc.</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead>
            <tbody>
              {modelInfo.comparison.map(m => (
                <tr key={m.model} className={m.model === modelInfo.best_model ? 'best' : ''}>
                  <td>{m.model}{m.model === modelInfo.best_model && <span className="best-tag">best</span>}</td>
                  <td className="mono">{(m.cv_mean_accuracy * 100).toFixed(1)}%</td>
                  <td className="mono">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="mono">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="mono">{(m.f1 * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="btn-secondary" onClick={onRestart}><RotateCcw size={15} /> Run another screening</button>
    </motion.div>
  )
}

export default function App() {
  const [stage, setStage] = useState('landing')
  const [answers, setAnswers] = useState({})
  const [demo, setDemo] = useState({ age: '', gender: '', ethnicity: 'White-European', relation: 'Self', jaundice: 'no', austim: 'no' })
  const [result, setResult] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/model-info`).then(r => r.json()).then(setModelInfo).catch(() => setError('connect'))
  }, [])

  const submit = async () => {
    setLoading(true); setError(null)
    try {
      const payload = { ...answers, age: Number(demo.age), gender: demo.gender, ethnicity: demo.ethnicity, jaundice: demo.jaundice, austim: demo.austim, relation: demo.relation }
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('failed')
      setResult(await res.json())
      setStage('result')
      window.scrollTo(0, 0)
    } catch { setError('predict') } finally { setLoading(false) }
  }

  const restart = () => { setAnswers({}); setResult(null); setStage('landing'); window.scrollTo(0, 0) }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="brand"><Activity size={16} /> ASD·PULSE</span>
        <span className="brand-sub">Multi-model behavioural screening</span>
      </header>

      {error === 'connect' && (
        <div className="banner-error">Can't reach the API at {API_BASE}. Start it with <code>uvicorn backend.main:app --reload</code>.</div>
      )}

      <AnimatePresence mode="wait">
        {stage === 'landing' && <Landing key="landing" onStart={() => setStage('questions')} modelInfo={modelInfo} />}
        {stage === 'questions' && <Questionnaire key="questions" answers={answers} setAnswers={setAnswers} demo={demo} setDemo={setDemo} onSubmit={submit} />}
        {loading && <motion.div key="loading" className="view loading-view" {...fadeUp}><Activity className="spin" size={22} /> Scoring across four models…</motion.div>}
        {stage === 'result' && !loading && <ResultView key="result" result={result} answers={answers} onRestart={restart} modelInfo={modelInfo} />}
      </AnimatePresence>

      {error === 'predict' && <div className="banner-error">Something went wrong. Please try again.</div>}

      <footer className="app-footer">Logistic Regression · SVM · Random Forest · KNN — compared on the AQ-10 Adult dataset</footer>
    </div>
  )
}
