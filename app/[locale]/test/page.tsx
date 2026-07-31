"use client";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  function handleClick() {
    alert("Hello world!");
  } 
  return(

 <>
 <Button className="bg-blue-500 w-40" onClick={handleClick}>Click</Button>
 </>
  )
}