import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer";
import "./mainPage.css"
import github from "../../pictures/github-logo.png"
import { useTranslation } from "react-i18next";

const MainPage = () => {
    const { t } = useTranslation();

    return (<div>
        <Header />
        <main className="main_page">
            <h1 className="main_page-h">{t("main_page_head")}</h1>
            <p className="main_page-p">{t("main_page_text")}</p>
            <p className="main_page-p">Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta maiores et placeat a iusto libero consequatur ullam asperiores cumque corporis, minima deleniti, mollitia eligendi totam id quas dolorem maxime ea.</p>
            <div className="gh_link-wrap">
                <a className="main_page-gh_link" href="https://github.com/VoiDd2567/CODE">{t("ling_for_github")}</a>
                <img src={github} alt="" />
            </div>
        </main>
        <Footer />
    </div>)
}

export default MainPage 