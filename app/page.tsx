"use client";

import { useState } from "react";

import { IReciepe, reciepe } from "@/src/ReciepeContent";
import { ReciepeBody } from "@/src/components/ReciepeBody";
import { ReciepeSelection } from "@/src/components/ReciepeSelection";


export default function Home() {

  const [currentReciepe, setCurrentReciepe] = useState<IReciepe>();

  return (<>
    <section className="recipe-root">
      <ReciepeSelection reciepeList={reciepe} setCurrentReciepe={setCurrentReciepe} />
      <ReciepeBody reciepe={currentReciepe || reciepe[0]} />
    </section>
  </>);
}
