
const MetricsSection = () => (
  <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-green-50 to-emerald-50">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
        Proven Results
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">75%</div>
          <p className="text-business-black/70">Faster issue identification</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">89%</div>
          <p className="text-business-black/70">Accuracy in predicting frustration</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">60%</div>
          <p className="text-business-black/70">Increase in completion rates</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
          <p className="text-business-black/70">Accuracy predicting at-risk learners</p>
        </div>
      </div>
    </div>
  </section>
);

export default MetricsSection;
