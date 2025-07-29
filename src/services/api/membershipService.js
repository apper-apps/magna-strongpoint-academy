const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const membershipPlans = [
  {
    id: "free",
    name: "무료",
    price: 0,
    period: "월",
    features: [
      "기본 강의 1-2단계 수강",
      "커뮤니티 참여",
      "진도 관리",
      "기본 학습 도구"
    ],
    limitations: [
      "3-4단계 강의 제한",
      "마스터 콘텐츠 제한",
      "개인 상담 미제공"
    ],
    popular: false,
    color: "gray"
  },
  {
    id: "premium",
    name: "프리미엄",
    price: 29000,
    period: "월",
    features: [
      "전체 강의 1-4단계 수강",
      "개별 피드백",
      "우선 지원",
      "심화 학습 자료",
      "월간 그룹 세션",
      "진도 상세 분석"
    ],
    limitations: [
      "마스터 전용 콘텐츠 제한"
    ],
    popular: true,
    color: "primary"
  },
  {
    id: "master",
    name: "마스터",
    price: 99000,
    period: "월",
    features: [
      "모든 프리미엄 혜택",
      "1:1 개인 코칭 (월 2회)",
      "마스터 전용 콘텐츠",
      "수익화 전략 상담",
      "네트워킹 이벤트 참여",
      "무제한 피드백",
      "우선 신강의 액세스"
    ],
    limitations: [],
    popular: false,
    color: "accent"
  }
];

export const membershipService = {
  async getPlans() {
    await delay(200);
    return [...membershipPlans];
  },

  async getPlanById(planId) {
    await delay(150);
    const plan = membershipPlans.find(p => p.id === planId);
    if (!plan) throw new Error("플랜을 찾을 수 없습니다.");
    return { ...plan };
  },

  async processPayment(paymentData) {
    await delay(2000); // Simulate payment processing
    
    // Simulate payment validation
    if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
      throw new Error("유효하지 않은 카드 번호입니다.");
    }
    
    if (!paymentData.expiryDate || !paymentData.cvv) {
      throw new Error("카드 정보가 완전하지 않습니다.");
    }

    // Simulate random payment failure (5% chance)
    if (Math.random() < 0.05) {
      throw new Error("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }

    return {
      success: true,
      transactionId: `TXN_${Date.now()}`,
      message: "결제가 성공적으로 완료되었습니다.",
      amount: paymentData.amount,
      plan: paymentData.plan
    };
  },

  async getPaymentMethods() {
    await delay(100);
    return [
      { id: "card", name: "신용/체크카드", icon: "CreditCard" },
      { id: "bank", name: "계좌이체", icon: "Building2" },
      { id: "phone", name: "휴대폰 결제", icon: "Smartphone" }
    ];
  },

  async validatePromoCode(code) {
    await delay(300);
    
    const validCodes = {
      "WELCOME10": { discount: 10, type: "percentage" },
      "FIRST50": { discount: 50, type: "percentage" },
      "SAVE5000": { discount: 5000, type: "fixed" }
    };

    const promo = validCodes[code.toUpperCase()];
    if (!promo) {
      throw new Error("유효하지 않은 프로모션 코드입니다.");
    }

    return {
      valid: true,
      discount: promo.discount,
      type: promo.type,
      message: `${promo.type === 'percentage' ? promo.discount + '%' : promo.discount.toLocaleString() + '원'} 할인이 적용됩니다.`
    };
  }
};