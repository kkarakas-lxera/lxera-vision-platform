
const MetricsSection = () => (
  <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-future-green/20 to-emerald/10">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-3xl lg:text-4xl font-semibold text-business-black mb-8 font-inter">
        Proven Results
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-future-green mb-2 font-inter">75%</div>
          <p className="text-business-black/70 font-inter">Faster issue identification</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-future-green mb-2 font-inter">89%</div>
          <p className="text-business-black/70 font-inter">Accuracy in predicting frustration</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-future-green mb-2 font-inter">60%</div>
          <p className="text-business-black/70 font-inter">Increase in completion rates</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-future-green mb-2 font-inter">85%</div>
          <p className="text-business-black/70 font-inter">Accuracy predicting at-risk learners</p>
        </div>
      </div>
    </div>
  </section>
);

export default MetricsSection;
