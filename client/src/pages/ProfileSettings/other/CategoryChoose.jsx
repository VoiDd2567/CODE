import { useState } from "react";
import "./categoryChoose.css"
import { useTranslation } from "react-i18next";

const CategoryChoose = ({ setOpenedWindow }) => {
    const { t } = useTranslation();
    const categories = ["general", "class", "security", "payment", "delAccount"];
    const [activeCategory, setActiveCategory] = useState("general");

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        setOpenedWindow(category)
    }

    return (<div className="category_choose">
        <div className="category_choose-main">
            <div className="category_choose-selector">
                {categories.map(category => (
                    <div key={category}
                        style={{ color: category === "delAccount" ? "red" : "black", height: category === "payment" ? "8vh" : "5vh" }}
                        className={`category_choose-selector-item ${activeCategory === category ? "active" : ""}`}
                        onClick={() => handleCategoryClick(category)}>{t(category)}</div>
                ))}
            </div>
        </div>
    </div>)
}

export default CategoryChoose;