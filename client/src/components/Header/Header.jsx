import { useState, useContext, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { LanguageContext } from "../LanguageContext/LanguageContext"
import { UserContext } from "../UserContext";
import "./header.css";
import logo from "../../pictures/logo.png";
import account_image from "../../pictures/account_icon.png"

function Header() {
  const { t, i18n } = useTranslation();

  const { lng, setLng } = useContext(LanguageContext);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [redirectToCourses, setRedirectToCourses] = useState(false);
  const [redirectToCodeEditor, setRedirectToCodeEditor] = useState(false);
  const [redirectToProfile, setRedirectToProfile] = useState(false)
  const [isLngOpen, setIsLngOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const loginLabel = useRef(null);
  const accountName = useRef(null);
  const account = useRef(null);

  const { user } = useContext(UserContext);
  useEffect(() => {
    if (loginLabel.current && account.current) {
      if (user) {
        loginLabel.current.hidden = true;
        account.current.hidden = false;
        if (user.name) {
          accountName.current.innerText = user.name;
        }
        else {
          accountName.current.innerText = user.username;
        }
      } else {
        loginLabel.current.hidden = false;
        account.current.hidden = true;
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

  if (redirectToCourses) {
    return <Navigate to="/my-courses" replace />;
  }

  return (
    <header>
      <div className="header__logo">
        <img src={logo} alt="Logo" />
      </div>
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
        <div className="header__item" onClick={() => { setRedirectToCodeEditor(true) }}>{t("editor")}</div>
        <div className="header__item" ref={loginLabel} onClick={() => { setRedirectToLogin(true) }}>{t("login")} </div>
        <div className="header__account-wrap" ref={account}>
          <div className="header__account" onClick={() => { setIsAccountOpen(!isAccountOpen) }}>
            <div className="header__account-name" ref={accountName}></div>
            <div className="header__account-icon"><img src={account_image} alt="Account" className="header__account-image" /></div>
          </div>
          {isAccountOpen && (
            <div className="header__account-menu">
              <div onClick={() => { setRedirectToProfile(true) }}>{t("settings")}</div>
              <div onClick={() => { setRedirectToCourses(true) }}>{t("courses")}</div>
              <div onClick={logout}>{t("logout")}</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
