import React from 'react'
import { useLocation } from 'react-router-dom'
import InGameCharacterShowAndInput from '../components/InGameCharacterShowAndInput'

export default function InGame() {
  // Every navigation to the game (Play again, Try Problematics...) has a new
  // location key, which starts a fresh game instead of keeping the old state
  const location = useLocation();
  return (
    <>
      <div className='in-game-container'>
        <InGameCharacterShowAndInput key={location.key} />
      </div>
    </>
  )
}
