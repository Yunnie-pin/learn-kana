import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NotFound.css';
import { useLanguage } from './i18n';

const NotFound = () => {
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();
  const customTitle = location.state?.title || t('notFoundTitle');
  const customMessage = location.state?.message || t('notFoundMessage');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    const redirectTimeout = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  const handleRedirectNow = () => {
    navigate('/');
  };

  return (
    <div className="container">
      <h1 className="heading">{customTitle}</h1>
      <p className="paragraph">{customMessage}</p>
      <p className="paragraphBelow">{t('notFoundRedirecting', { seconds: countdown })}</p>
      <button className="button" onClick={handleRedirectNow}>{t('notFoundRedirectNow')}</button>
    </div>
  );
};

export default NotFound;