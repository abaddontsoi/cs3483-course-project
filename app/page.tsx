"use client";

import { useEffect, useState } from "react";

import { IReciepe, getReciepe } from "@/src/ReciepeContent";
import { ReciepeBody } from "@/src/components/ReciepeBody";
import { ReciepeSelection } from "@/src/components/ReciepeSelection";


export default function Home() {

  const [reciepeList, setReciepeList] = useState<IReciepe[]>([]);
  const [currentReciepe, setCurrentReciepe] = useState<IReciepe>();

  useEffect(() => {
    const fetchReciepe = async () => {
      const reciepeData = await getReciepe();
      setReciepeList(reciepeData);
      if (reciepeData.length > 0) {
        setCurrentReciepe(reciepeData[0]);
      }
    }
    fetchReciepe();
  }, [])

  return (<>
    <section className="recipe-root">
      <ReciepeSelection reciepeList={reciepeList} setCurrentReciepe={setCurrentReciepe} />
      {currentReciepe && <ReciepeBody reciepe={currentReciepe} />}
    </section>
  </>);
}
