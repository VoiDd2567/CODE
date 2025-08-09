import Header from "../../components/Header/Header"
import "./teapot.css"
import { useTranslation } from "react-i18next"

const Teapot = () =>{
    const {t} = useTranslation()

    return(<div>
        <Header />
        <div className="teapot">
        {t("teapot")}
        </div>
    </div>)
}

export default Teapot;