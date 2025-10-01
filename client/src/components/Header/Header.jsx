import { useState, useContext, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { LanguageContext } from "../LanguageContext/LanguageContext"
import { UserContext } from "../UserContext";
import "./header.css";
import logo from "../../pictures/logo.png";

const developer_mode = true;

function Header() {
  const { t, i18n } = useTranslation();

  const { lng, setLng } = useContext(LanguageContext);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [redirectToCodeEditor, setRedirectToCodeEditor] = useState(false);
  const [redirectToCourseEditor, setRedirectToCourseEditor] = useState(false);
  const [redirectToCourses, setRedirectToCourses] = useState(false);
  const [redirectToClass, setRedirectToClass] = useState(false)
  const [redirectToProfile, setRedirectToProfile] = useState(false)
  const [isLngOpen, setIsLngOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [pageMode, setPageMode] = useState("teacher");
  const [logged, setLogged] = useState(false)
  const loginLabel = useRef(null);
  const account = useRef(null);

  const { user } = useContext(UserContext);
  useEffect(() => {
    if (loginLabel.current && account.current) {
      if (user) {
        setLogged(true)
        loginLabel.current.hidden = true;
        account.current.style.display = "flex";
      } else {
        setLogged(false)
        loginLabel.current.hidden = false;
        account.current.style.display = "none";
      }
    }
  }, [user, lng, isLngOpen]);


  const changeLng = (lng) => {
    const newLng = lng;
    setLng(newLng);
    i18n.changeLanguage(newLng);
    setIsLngOpen(false);

    fetch('https://localhost:3001/api/user/lng', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lng }),
    })

  };

  const logout = () => {
    fetch('https://localhost:3001/api/auth/logout', {
      method: 'GET',
      credentials: 'include',
    }).then(async res => {
      if (!res.ok) {
        const errorData = await res.text();
        alert(errorData)
        throw new Error(`Error ${res.status}`);
      } else {
        window.location.reload();
      }
    }).catch(error => {
      console.error('ERROR with sending data', error);
    });
  }

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  if (redirectToCodeEditor) {
    return <Navigate to="/code-editor" replace />;
  }

  if (redirectToProfile) {
    return <Navigate to="/profile-settings" replace />;
  }

  if (redirectToCourseEditor) {
    return <Navigate to="/course-editor" replace />;
  }

  if (redirectToCourses) {
    return <Navigate to="/courses" replace />;
  }

  if (redirectToClass) {
    return <Navigate to="/class/12312" replace />;
  }

  const handleSwitchClick = () => {
    if (pageMode === "student") {
      setPageMode("teacher");
    } else {
      setPageMode("student");
    }
  }

  return (
    <header>
      <div className="header__logo">
        <img src={logo} alt="Logo" />
      </div>
      {developer_mode && (
        <div className="switch-wrap">
          <div className="dev-mode">{pageMode}</div>
          <label className="switch">
            <input type="checkbox" onClick={() => handleSwitchClick()} />
            <span className="slider"></span>
          </label>
        </div>)
      }
      <div className="header__item-list">
        <div className="header__lng-change-wrap">
          <div className="header__item header__lng" id="lngButton" onClick={() => { setIsLngOpen(!isLngOpen); }}>
            {isLngOpen ? "▼" : "►"} {lng.toUpperCase()}
          </div>
          {isLngOpen && (
            <div className="header__lng-menu">
              <div onClick={() => changeLng("eng")}>English</div>
              <div onClick={() => changeLng("est")}>Eesti</div>
            </div>
          )}
        </div>
        {logged && (
          <>
            {pageMode === "student" && (
              <div className="header__item" onClick={() => setRedirectToCodeEditor(true)}>
                {t("editor")}
              </div>
            )}
            {pageMode === "teacher" && (
              <div className="header__item" onClick={() => setRedirectToClass(true)}>
                {t("classes")}
              </div>
            )}
            <div className="header__item" onClick={() => { setRedirectToCourses(true) }}>{t("courses")}</div>
          </>
        )}
        <div className="header__item" ref={loginLabel} onClick={() => { setRedirectToLogin(true) }}>{t("login")} </div>
        <div className="header__account-wrap" ref={account}>
          <div className="header_menu_draw" onClick={() => { setIsAccountOpen(!isAccountOpen) }}>
            {isAccountOpen ? (
              <div className="cross"></div>
            ) : (
              <div className="menu-lines">
                <div className="menu-line"></div>
                <div className="menu-line"></div>
                <div className="menu-line"></div>
              </div>
            )}
          </div>
          {isAccountOpen && (
            <div className="header__account-menu">
              <div onClick={() => { setRedirectToProfile(true) }}>{t("settings")}</div>
              {pageMode === "teacher" && (<div onClick={() => setRedirectToCourseEditor(true)}>{t("course_editor")}</div>)}
              <div style={{ "color": "#c62522ff" }} onClick={logout}>{t("logout")}</div>
            </div>
          )}
        </div>
      </div>
    </header >
  );
}

export default Header;
