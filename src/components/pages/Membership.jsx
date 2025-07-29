import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import RoleBadge from "@/components/molecules/RoleBadge";
import PaymentModal from "@/components/organisms/PaymentModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { useAuth } from "@/hooks/useAuth";
import { membershipService } from "@/services/api/membershipService";

const Membership = () => {
  const { user, updateUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await membershipService.getPlans();
      setPlans(data);
    } catch (err) {
      setError("플랜 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    if (plan.id === "free") {
      toast.info("현재 무료 플랜을 이용 중입니다.");
      return;
    }
    
    if (user?.role === "Premium" && plan.id === "premium") {
      toast.info("현재 프리미엄 플랜을 이용 중입니다.");
      return;
    }
    
    if (user?.role === "Master" && (plan.id === "premium" || plan.id === "master")) {
      toast.info("현재 최고 등급 플랜을 이용 중입니다.");
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    const roleMap = {
      premium: "Premium",
      master: "Master"
    };

    updateUser({
      role: roleMap[paymentResult.plan],
      subscription: {
        plan: paymentResult.plan,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true
      }
    });

    toast.success("멤버십 업그레이드가 완료되었습니다! 🎉");
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const getCurrentPlan = () => {
    const roleToId = {
      "Free_User": "free",
      "Premium": "premium",
      "Master": "master"
    };
    return roleToId[user?.role] || "free";
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPlans} />;

  const currentPlanId = getCurrentPlan();

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500/10 to-accent-500/10 px-4 py-2 rounded-full">
          <ApperIcon name="Crown" className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            멤버십 & 결제
          </span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          강점을 발견하는 여정을
          <span className="block gradient-text">더욱 특별하게</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          당신의 성장 단계에 맞는 최적의 플랜을 선택하고, 
          개인화된 학습 경험을 시작하세요.
        </p>

        {/* Current Plan Status */}
        <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">현재 플랜:</span>
          <RoleBadge role={user?.role} />
          {user?.subscription?.endDate && (
            <span className="text-sm text-gray-500">
              • {new Date(user.subscription.endDate).toLocaleDateString()} 까지
            </span>
          )}
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
              plan.popular 
                ? 'border-primary-500 scale-105' 
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
            } ${
              currentPlanId === plan.id ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge variant="primary" className="px-4 py-1">
                  <ApperIcon name="Star" className="w-4 h-4 mr-1" />
                  가장 인기
                </Badge>
              </div>
            )}

            {currentPlanId === plan.id && (
              <div className="absolute -top-4 right-4">
                <Badge variant="success" className="px-3 py-1">
                  <ApperIcon name="Check" className="w-4 h-4 mr-1" />
                  현재 플랜
                </Badge>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500">/{plan.period}</span>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <ApperIcon name="Check" className="w-5 h-5 text-green-500" />
                  포함된 기능
                </h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <ApperIcon name="CheckCircle" className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ApperIcon name="X" className="w-5 h-5 text-gray-400" />
                    제한사항
                  </h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-500">
                        <ApperIcon name="XCircle" className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button
              onClick={() => handlePlanSelect(plan)}
              variant={plan.popular ? "primary" : "outline"}
              size="lg"
              className="w-full"
              disabled={currentPlanId === plan.id}
            >
              {currentPlanId === plan.id ? (
                <>
                  <ApperIcon name="Check" className="w-4 h-4 mr-2" />
                  현재 이용중
                </>
              ) : plan.id === "free" ? (
                "무료로 시작하기"
              ) : (
                `${plan.name} 시작하기`
              )}
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          자주 묻는 질문
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              question: "언제든지 플랜을 변경할 수 있나요?",
              answer: "네, 언제든지 업그레이드하거나 다운그레이드할 수 있습니다. 변경 즉시 적용됩니다."
            },
            {
              question: "결제는 어떻게 이루어지나요?",
              answer: "신용카드, 체크카드, 계좌이체, 휴대폰 결제를 지원합니다. 모든 결제는 SSL로 보호됩니다."
            },
            {
              question: "환불 정책은 어떻게 되나요?",
              answer: "구독 후 7일 이내 100% 환불 가능합니다. 그 이후는 남은 기간에 대한 비례 환불입니다."
            },
            {
              question: "마스터 플랜의 1:1 코칭은 어떻게 받나요?",
              answer: "매월 2회 30분씩 화상 또는 전화로 진행되며, 전담 코치가 배정됩니다."
            }
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
};

export default Membership;