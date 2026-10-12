import React, {useEffect} from 'react'

export default function CheckMark(props) {
  useEffect(() => {
    let initValue = props.default;
    if(props.default === undefined) {
        initValue = "false";
    }
    // Set the default values or the values from the localStorage for the checkMarks
    if(localStorage.getItem(props.id) === null) {
        localStorage.setItem(props.id, initValue);
    }
    // A disabled option is shown as off, but the saved choice is kept for when it is enabled again
    document.getElementById(props.id).checked = !props.disabled && (localStorage.getItem(props.id) === "true"); // Cool trick, huh?
  })

  const handleCheckMarked = (e) => {
    // Mark the checkbox as checked
    localStorage.setItem(props.id, e.target.checked);
  }

  return (
    <label className="character-checkbox-element" key={props.id} title={props.disabled ? props.disabledReason : undefined}>
        <input type="checkbox"
            id={props.id}
            className={"character-checkbox-input " + props.class}
            disabled={props.disabled}
            onChange={handleCheckMarked} />
        <div className="character-checkbox-content toggle-content">
            <span className="toggle-switch" aria-hidden="true"></span>
            <p>{props.characterText}</p>
        </div>
    </label>
  )
}
