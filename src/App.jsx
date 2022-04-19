import { useState } from "react"
import { EquirectangularMap, SphereMap } from "./WorldMap"

function App() {
  const [date, setDate] = useState(new Date())
  return (
    <div>
      <input type="datetime-local" value={date} onChange={e => setDate(new Date(e.target.value))}></input>
      <SphereMap date={date} />
      <EquirectangularMap date={date} />
    </div>
  )
}

export default App
