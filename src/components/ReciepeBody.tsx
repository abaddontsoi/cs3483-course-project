import { IReciepe } from "../ReciepeContent";

export const ReciepeBody = ({ reciepe }: { reciepe: IReciepe }) => {
    const r: IReciepe = reciepe;
    return (<>
        <div className="recipe-body">
            <div className="left-col">
                {r?.image && <img className="main-image" src={r.image} alt={r.title} />}

                <div className="ingredients">
                    <h3>預備食材</h3>
                    {r?.servings && <div className="meta">👥 {r.servings}</div>}
                    <ul>
                        {r?.ingredients?.map((ing, idx) => (
                            <li key={idx}>{ing}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div>
                <h1
                    style={{
                        fontSize: "56px",
                        fontWeight: "700",
                        margin: "0",
                        lineHeight: "0.95"
                    }}
                >{r?.title}</h1>

                <div className="cook-steps">
                    <h4>料理步驟</h4>
                    {r?.time && <div className="time">⏲ {r.time}</div>}
                    <ol>
                        {r?.steps?.map((s, i) => (
                            <li key={i}>
                                <span className="step-num">{i + 1}</span>
                                <div>{s}</div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    </>);
};
