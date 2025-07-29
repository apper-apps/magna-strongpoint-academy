import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const ProcessOverview = () => {
  const steps = [
    {
      id: 1,
      title: "강점 찾기",
      description: "개인의 고유한 강점을 발견하고 분석하는 체계적인 방법론을 학습합니다.",
      icon: "Target",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "콘셉트 설계",
      description: "발견한 강점을 바탕으로 독창적인 콘텐츠 콘셉트를 설계합니다.",
      icon: "Lightbulb",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: 3,
      title: "글 시나리오",
      description: "독자의 마음을 사로잡는 스토리텔링 기법과 글 구성 전략을 마스터합니다.",
      icon: "PenTool",
      color: "from-green-500 to-green-600"
    },
    {
      id: 4,
      title: "수익화 실행",
      description: "완성된 콘텐츠를 실제 수익으로 연결하는 비즈니스 모델을 실행합니다.",
      icon: "TrendingUp",
      color: "from-accent-500 to-accent-600"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            4단계로 완성하는
            <span className="gradient-text"> 수익형 글쓰기</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            체계적인 학습으로 당신만의 강점을 수익으로 만들어보세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 group-hover:transform group-hover:scale-105">
                {/* Step number */}
                <div className="absolute -top-4 left-8">
                  <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {step.id}
                  </div>
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <ApperIcon name={step.icon} className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ApperIcon name="ArrowRight" className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              지금 시작하면 1단계 강의 무료!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              4단계 학습 여정의 첫걸음을 무료로 체험해보세요
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <ApperIcon name="Check" className="w-5 h-5" />
                <span className="font-medium">무료 체험</span>
              </div>
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <ApperIcon name="Check" className="w-5 h-5" />
                <span className="font-medium">언제든 업그레이드</span>
              </div>
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <ApperIcon name="Check" className="w-5 h-5" />
                <span className="font-medium">커뮤니티 참여</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessOverview;