import { useState, useEffect } from "react";
import start_arrow from "../../../pictures/start_arrow.png"
import end_arrow from "../../../pictures/end_arrow.png"
import arrow_next from "../../../pictures/arrow_next.png"
import arrow_prev from "../../../pictures/arrow_prev.png"

const PageHandeler = ({ setPage, pageAmount, nowPage }) => {
    const [pagesPool, setPagesPool] = useState([nowPage + 1])
    const [manyPages, setManyPages] = useState(false)
    const [choose, setChoose] = useState(null)

    useEffect(() => {
        changePool();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nowPage])

    const changePage = (val = 0, to = null) => {
        if (to !== null && typeof to === "number") {
            if (to < 0) {
                setPage(0)
            } else if (to >= pageAmount) {
                setPage(pageAmount - 1)
            } else {
                setPage(to)
            }
        }
        else if (nowPage + val >= 0 && nowPage + val < pageAmount) {
            setPage(nowPage + val)
        }
    }

    const changePool = () => {
        if (pageAmount > 3) {
            setManyPages(true)
            setPagesPool([nowPage + 1])
        } else if (pageAmount > 1) {
            let newPages = []
            for (let i = 0; i < pageAmount; i++) {
                newPages.push(i + 1)
            }
            setPagesPool(newPages)
        }
    }

    return (
        <div className="page_handeler">
            {nowPage != 0 && manyPages && (<a className="page_handeler-button"><img src={start_arrow} alt="" onClick={() => changePage(0, 0)} /></a>)}
            <a className="page_handeler-button"><img src={arrow_prev} alt="" onClick={() => changePage(-1)} /></a>
            {nowPage != 0 && (choose == "start" ?
                (<div className="page_handeler-input-wrapper">
                    <input
                        type="number"
                        className="page_handeler-input"
                        placeholder=""
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const pageNum = parseInt(e.target.value);
                                if (!isNaN(pageNum)) {
                                    changePage(0, pageNum - 1);
                                    setChoose(null);
                                }
                            }
                        }}
                        onBlur={() => setChoose(null)}
                    />
                </div>) :
                (<a href="" className="page_handeler-choosePage" onClick={() => setChoose("start")} >...</a>))}
            <div className="page_handeler-pages">{pagesPool.map((page) => {
                return (
                    <div className={`page_handeler-page ${page === nowPage + 1 ? "active" : ""}`}>{page}</div>
                )
            })}</div>
            {nowPage != pageAmount - 1 && (choose == "end" ?
                (<div className="page_handeler-input-wrapper">
                    <input
                        type="number"
                        className="page_handeler-input"
                        placeholder=""
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const pageNum = parseInt(e.target.value);
                                if (!isNaN(pageNum)) {
                                    changePage(0, pageNum - 1);
                                    setChoose(null);
                                }
                            }
                        }}
                        onBlur={() => setChoose(null)}
                    />
                </div>) :
                (<a href="" className="page_handeler-choosePage" onClick={() => setChoose("end")}>...</a>))}
            <a className="page_handeler-button"><img src={arrow_next} alt="" onClick={() => changePage(1)} /></a>
            {nowPage != pageAmount - 1 && manyPages && (<a className="page_handeler-button"><img src={end_arrow} alt="" onClick={() => changePage(0, pageAmount - 1)} /></a>)}
        </div>
    )
}

export default PageHandeler;