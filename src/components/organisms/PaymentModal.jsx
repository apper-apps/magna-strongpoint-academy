import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { membershipService } from "@/services/api/membershipService";

const PaymentModal = ({ plan, onSuccess, onClose }) => {
  const [step, setStep] = useState(1); // 1: payment method, 2: payment details, 3: processing
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
    bankAccount: "",
    phoneNumber: ""
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await membershipService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      toast.error("결제 방법을 불러오는 중 오류가 발생했습니다.");
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      const result = await membershipService.validatePromoCode(promoCode);
      setDiscount(result);
      toast.success(result.message);
    } catch (err) {
      toast.error(err.message);
      setDiscount(null);
    }
  };

  const calculateFinalPrice = () => {
    let finalPrice = plan.price;
    
    if (discount) {
      if (discount.type === "percentage") {
        finalPrice = finalPrice * (1 - discount.discount / 100);
      } else {
        finalPrice = Math.max(0, finalPrice - discount.discount);
      }
    }
    
    return Math.round(finalPrice);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (paymentMethod === "card") {
      if (!formData.cardNumber || formData.cardNumber.length < 16) {
        toast.error("올바른 카드 번호를 입력해주세요.");
        return false;
      }
      if (!formData.expiryDate || !formData.cvv || !formData.holderName) {
        toast.error("모든 카드 정보를 입력해주세요.");
        return false;
      }
    } else if (paymentMethod === "bank") {
      if (!formData.bankAccount) {
        toast.error("계좌번호를 입력해주세요.");
        return false;
      }
    } else if (paymentMethod === "phone") {
      if (!formData.phoneNumber) {
        toast.error("휴대폰 번호를 입력해주세요.");
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    setStep(3);

    try {
      const paymentData = {
        plan: plan.id,
        amount: calculateFinalPrice(),
        method: paymentMethod,
        ...formData,
        promoCode: discount ? promoCode : null
      };

      const result = await membershipService.processPayment(paymentData);
      
      setTimeout(() => {
        onSuccess(result);
        toast.success("결제가 완료되었습니다! 🎉");
      }, 1000);
      
    } catch (err) {
      setProcessing(false);
      setStep(2);
      toast.error(err.message);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  결제하기
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {plan.name} 플랜 • ₩{plan.price.toLocaleString()}/{plan.period}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="w-6 h-6" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center mt-6 space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNum 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNum ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  결제 방법 선택
                </h3>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <ApperIcon name={method.icon} className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {method.name}
                      </span>
                      {paymentMethod === method.id && (
                        <ApperIcon name="Check" className="w-5 h-5 ml-auto text-primary-500" />
                      )}
                    </label>
                  ))}
                </div>

                <Button onClick={() => setStep(2)} className="w-full">
                  다음 단계
                  <ApperIcon name="ArrowRight" className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  결제 정보 입력
                </h3>

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <FormField
                      label="카드 번호"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        label="유효기간"
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D+/g, '');
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          handleInputChange('expiryDate', value);
                        }}
                        maxLength={5}
                      />
                      <FormField
                        label="CVV"
                        type="text"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D+/g, ''))}
                        maxLength={3}
                      />
                    </div>
                    <FormField
                      label="카드 소유자명"
                      type="text"
                      placeholder="홍길동"
                      value={formData.holderName}
                      onChange={(e) => handleInputChange('holderName', e.target.value)}
                    />
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <FormField
                    label="계좌번호"
                    type="text"
                    placeholder="123-456-789012"
                    value={formData.bankAccount}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                  />
                )}

                {paymentMethod === "phone" && (
                  <FormField
                    label="휴대폰 번호"
                    type="text"
                    placeholder="010-1234-5678"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                )}

                {/* Promo Code */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex gap-2">
                    <FormField
                      label="프로모션 코드 (선택사항)"
                      type="text"
                      placeholder="코드를 입력하세요"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <div className="pt-7">
                      <Button 
                        variant="outline" 
                        onClick={handlePromoCode}
                        disabled={!promoCode.trim()}
                      >
                        적용
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>플랜 비용</span>
                      <span>₩{plan.price.toLocaleString()}</span>
                    </div>
                    {discount && (
                      <div className="flex justify-between text-green-600">
                        <span>할인</span>
                        <span>
                          -{discount.type === 'percentage' 
                            ? `${discount.discount}%` 
                            : `₩${discount.discount.toLocaleString()}`
                          }
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>총 결제 금액</span>
                        <span>₩{calculateFinalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
                    이전
                  </Button>
                  <Button onClick={handlePayment} className="flex-1">
                    ₩{calculateFinalPrice().toLocaleString()} 결제하기
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <ApperIcon name="Loader2" className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  결제 처리 중...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  잠시만 기다려주세요. 결제를 안전하게 처리하고 있습니다.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;