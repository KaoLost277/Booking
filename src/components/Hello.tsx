//import { useState } from 'react'
import {useParams} from 'react-router-dom'

function Hello() {
    const { id } = useParams<{ id: string }>();
  return (
    <>
  
       <h1>Hello Kao ID{id}</h1>
     
    </>
  )
}

export default Hello
