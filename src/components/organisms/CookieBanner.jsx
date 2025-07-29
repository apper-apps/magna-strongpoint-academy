import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { cookieBannerService } from '@/services/api/cookieBannerService';
import { consentLogService } from '@/services/api/consentLogService';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [bannerConfig, setBannerConfig] = useState(null);
  const [consentConfig, setConsentConfig] = useState(null);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    loadConfiguration();
    checkConsentStatus();
  }, []);

  const loadConfiguration = async () => {
    try {
      const [bannerData, consentData] = await Promise.all([
        cookieBannerService.getAll(),
        consentLogService.getAll()
      ]);
      
      setBannerConfig(bannerData[0] || null);
      setConsentConfig(consentData[0] || null);
    } catch (error) {
      console.error('Error loading cookie banner configuration:', error);
    }
  };

  const checkConsentStatus = () => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  };

  const handleAcceptAll = async () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    
    if (consentConfig?.is_logging_enabled) {
      await logConsent(consentData);
    }
    
    setIsVisible(false);
  };

  const handleRejectAll = async () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    
    if (consentConfig?.is_logging_enabled) {
      await logConsent(consentData);
    }
    
    setIsVisible(false);
  };

  const handleSavePreferences = async () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    
    if (consentConfig?.is_logging_enabled) {
      await logConsent(consentData);
    }
    
    setShowPreferences(false);
    setIsVisible(false);
  };

  const logConsent = async (consentData) => {
    try {
      await consentLogService.create({
        Name: `Consent - ${new Date().toISOString()}`,
        is_logging_enabled: true,
        consent_details: JSON.stringify(consentData)
      });
    } catch (error) {
      console.error('Error logging consent:', error);
    }
  };

  const getPalette = () => {
    if (!bannerConfig?.palette) {
      return { primary: "#0046FF", text: "#FFFFFF" };
    }
    
    try {
      return JSON.parse(bannerConfig.palette);
    } catch {
      return { primary: "#0046FF", text: "#FFFFFF" };
    }
  };

  const getButtons = () => {
    if (!bannerConfig?.buttons) {
      return [
        { label: "허용", action: "accept_all" },
        { label: "설정", action: "open_preferences" }
      ];
    }
    
    try {
      return JSON.parse(bannerConfig.buttons);
    } catch {
      return [
        { label: "허용", action: "accept_all" },
        { label: "설정", action: "open_preferences" }
      ];
    }
  };

  const palette = getPalette();
  const buttons = getButtons();
  const isBottomSticky = bannerConfig?.style === 'bottom_sticky';

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ y: isBottomSticky ? 100 : -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: isBottomSticky ? 100 : -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed ${isBottomSticky ? 'bottom-0' : 'top-0'} left-0 right-0 z-50 p-4`}
            style={{ backgroundColor: palette.primary }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1" style={{ color: palette.text }}>
                  <p className="text-sm sm:text-base">
                    이 웹사이트는 사용자 경험을 개선하고 서비스를 제공하기 위해 쿠키를 사용합니다. 
                    계속 사용하시면 쿠키 사용에 동의하는 것으로 간주됩니다.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  {buttons.map((button, index) => (
                    <Button
                      key={index}
                      variant={button.action === 'accept_all' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (button.action === 'accept_all') {
                          handleAcceptAll();
                        } else if (button.action === 'reject_all') {
                          handleRejectAll();
                        } else if (button.action === 'open_preferences') {
                          setShowPreferences(true);
                        }
                      }}
                      className={button.action !== 'accept_all' ? 'border-white text-white hover:bg-white hover:text-gray-900' : ''}
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cookie Preferences Modal */}
          <AnimatePresence>
            {showPreferences && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50"
                onClick={() => setShowPreferences(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        쿠키 설정
                      </h2>
                      <button
                        onClick={() => setShowPreferences(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ApperIcon name="X" size={20} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Necessary Cookies */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            필수 쿠키
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            웹사이트 기본 기능을 위해 필요한 쿠키입니다.
                          </p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={true}
                            disabled
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            분석 쿠키
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            웹사이트 사용량을 분석하여 서비스를 개선하는데 사용됩니다.
                          </p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      {/* Marketing Cookies */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            마케팅 쿠키
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            개인화된 광고를 제공하는데 사용됩니다.
                          </p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      {/* Functional Cookies */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            기능 쿠키
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            향상된 기능과 개인화를 제공하는데 사용됩니다.
                          </p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={preferences.functional}
                            onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={() => setShowPreferences(false)}
                        className="flex-1"
                      >
                        취소
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSavePreferences}
                        className="flex-1"
                      >
                        설정 저장
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;