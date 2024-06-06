import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {BehaviorSubject} from 'rxjs'

export default function App() {
  console.log('<App/>')
  const [countA, setCountA] = useSignal(0)
  const [countB, setCountB] = useSignal(0)

  return (
    <div className="App">
      <button onClick={() => setCountA(countA.ref.current + 1)}>A</button>
      <Display count={countA} name="A" />

      <hr />

      <button onClick={() => setCountB(countB.ref.current + 1)}>B</button>
      <Display count={countB} name="B" />
    </div>
  )
}

function Display({count, name}) {
  console.log(`<Display${name} count={${count()}}/>`)
  return <span>{count()}</span>
}

// =======================================================================

function useSignal<T>(value: T) {
  const snapshot = useRef<T>(value)
  const signal = useRef<BehaviorSubject<T>>()
  signal.current = useMemo(() => new BehaviorSubject(value), [])

  const signalValue = useCallback(
    () => useSignalValue(signal.current, value),
    []
  ) as (() => T) & {ref: MutableRefObject<T>}

  signalValue.ref = snapshot

  useEffect(() => {
    const sub = signal.current.subscribe(v => (snapshot.current = v))

    return () => {
      sub.unsubscribe()
    }
  }, [])

  const setter = (v?: T) => signal.current.next(v)

  return [signalValue, setter] as const
}

function useSignalValue<T>(signal: BehaviorSubject<T>, snapshot: T) {
  const [state, setState] = useState(snapshot)

  useEffect(() => {
    const s = signal.subscribe(setState)

    return () => {
      s.unsubscribe()
    }
  }, [signal])

  return state
}
