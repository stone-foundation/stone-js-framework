import { Reveal } from '../components/ui/Reveal'
import { JSX, useEffect, useState } from 'react'

interface ConsoleLine { who: 'agent' | 'stone', msg: string }

/** The looping agent ⟷ app exchange shown in the console. */
const SCRIPT: ConsoleLine[] = [
  { who: 'agent', msg: 'tools/list' },
  { who: 'stone', msg: 'stone_routes · stone_app · stone_search · stone_docs' },
  { who: 'agent', msg: 'stone_routes' },
  { who: 'stone', msg: 'GET /tasks (Tasks.list) · POST /tasks (Tasks.create)' },
  { who: 'agent', msg: 'stone_concept { id: "continuum" }' },
  { who: 'stone', msg: '"An application is not an artefact. It is an act."' }
]

/**
 * The animated agent console: an AI agent consuming a Stone.js app over MCP,
 * and querying the framework's own knowledge, in a loop.
 */
function AgentConsole (): JSX.Element {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(SCRIPT.length)
      return
    }
    const timer = setInterval(() => {
      setCount((current) => current >= SCRIPT.length ? 0 : current + 1)
    }, 1400)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      <div className='synapse' aria-hidden='true'>
        <span className='node'>agent · llm</span>
        <span className='wire'><span className='pulse' /><span className='pulse back' /></span>
        <span className='node stone'>stone.js app</span>
      </div>
      <div className='console' role='img' aria-label='An AI agent calling a Stone.js application over MCP'>
        <div className='cbar'><i /><i /><i /></div>
        <div className='clines'>
          {SCRIPT.slice(0, count).map((line, i) => (
            <div key={`${i}-${line.msg}`} className={`cl ${line.who}`}>
              <span className='who'>{line.who === 'agent' ? 'agent →' : 'stone ←'}</span>
              <span className='msg'>{line.msg}</span>
            </div>
          ))}
          <span className='caret' />
        </div>
      </div>
    </div>
  )
}

/**
 * Agent-native: the framework's flagship differentiator, staged large.
 */
export function Agents (): JSX.Element {
  return (
    <div className='agents' id='agents'>
      <div className='wrap'>
        <div className='grid'>
          <Reveal>
            <p className='eyebrow'><span className='psi'>ψ</span>Agent-native</p>
            <h2>Your domain, observable by machines.</h2>
            <p className='muted' style={{ marginTop: 16, fontSize: 18 }}>
              Agents are the next execution context, and Stone.js treats them as first-class:
              the agent that builds your app, and the agent that calls it.
            </p>
            <div className='agent-offer'>
              <div className='offer'>
                <p className='t'>@stone-js/mcp-dev</p>
                <p>One command, <code>stone mcp</code>, serves your coding agent the framework's map and a live, read-only view of your app: concepts, modules, routes, config, plus Agent Skills. Consulted in real time, no package scanning, no guessing.</p>
              </div>
              <div className='offer'>
                <p className='t'>@stone-js/mcp <span style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6 }}>coming</span></p>
                <p>Expose your running domain to AI agents as MCP tools, the same domain your REST API serves, without touching a handler. The MCP equivalent of your REST API.</p>
              </div>
            </div>
            <p className='quote'>
              “The LLM masters the <em>context</em>.<br />
              You master the <em>domain</em>.<br />
              Together, you ship.”
            </p>
          </Reveal>
          <Reveal>
            <AgentConsole />
          </Reveal>
        </div>
      </div>
    </div>
  )
}
