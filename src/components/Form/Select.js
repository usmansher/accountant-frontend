// Select.js
import React from 'react'
import { useField, ErrorMessage } from 'formik'

const Select = ({ label, ...props }) => {
  const [field, meta] = useField(props)
  return (
    <div>
      <label htmlFor={props.id || props.name}>{label}</label>
      <select {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
      <ErrorMessage name={props.name} component="div" className="error" />
    </div>
  )
}

export default Select
