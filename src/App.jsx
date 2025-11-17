import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, AlertCircle } from 'lucide-react';

const DAILY_QUESTIONS = [
  { 
    id: "date", 
    label: "Date of application", 
    type: "date",
    required: true
  },
  { 
    id: "environment", 
    label: "What type of environment were you in during the trial?", 
    type: "single_select", 
    options: ["Backyard/Patio", "Park/Open Field", "Wooded/Forest Area", "Near Water/Swamp", "Other"],
    required: true
  },
  { 
    id: "temperature_humidity", 
    label: "Temperature (°F) and Humidity (%)", 
    type: "multi_numerical", 
    units: ["°F", "%"], 
    labels: ["Temperature", "Humidity"],
    required: false,
    help: "Optional but helpful - check weather.com if unsure"
  },
  { 
    id: "alcohol_drinks", 
    label: "How many alcoholic drinks did you consume in the 6 hours before applying the product?", 
    type: "numerical_input", 
    min_value: 0, 
    unit: "drinks",
    required: true,
    help: "1 drink = 12oz beer, 5oz wine, or 1.5oz spirits"
  },
  { 
    id: "metabolism_foods", 
    label: "In the 3 hours before application, did you consume caffeine, high-sugar foods/drinks, or spicy food?", 
    type: "single_select", 
    options: ["None", "Moderate Amount", "Heavy Amount"],
    required: true
  },
  { 
    id: "scented_products", 
    label: "Did you apply any scented products (soap, lotion, perfume, etc.) in the 3 hours before application?", 
    type: "binary_select", 
    options: ["Yes", "No"],
    required: true
  },
  { 
    id: "scent_type", 
    label: "What was the primary scent of the product you used?", 
    type: "single_select_with_text", 
    options: ["Unscented", "Citrus/Lemon", "Floral/Jasmine", "Coconut/Vanilla", "Earthy/Herbal", "Other"],
    visibility_rule: { scented_products: "Yes" },
    required: false
  },
  { 
    id: "time_applied", 
    label: "What time did you apply Mosquito Butter?", 
    type: "time_input",
    required: true
  },
  { 
    id: "body_area", 
    label: "Which body area did you treat?", 
    type: "single_select", 
    options: ["Full Arm (1 side)", "Full Leg (1 side)", "Neck/Face", "Torso/Back", "Other"],
    required: true
  },
  { 
    id: "amount_applied", 
    label: "Approximately how many pea-sized amounts did you apply?", 
    type: "numerical_input", 
    min_value: 0.5, 
    step: 0.5, 
    unit: "pea-sized amounts",
    required: true,
    help: "A pea-sized amount is about the size of a green pea (roughly 0.5 inches in diameter)"
  },
  {
    id: "clothing",
    label: "What clothing were you wearing on the treated area?",
    type: "single_select",
    options: ["Fully Exposed (no clothing)", "Short Sleeves/Shorts", "Long Sleeves/Pants (thin fabric)", "Long Sleeves/Pants (thick fabric)"],
    required: true
  },
  { 
    id: "exposure_start", 
    label: "What time did you START your outdoor mosquito exposure?", 
    type: "time_input",
    required: true
  },
  { 
    id: "got_bitten_treated", 
    label: "Did you get bitten on the TREATED area?", 
    type: "binary_select", 
    options: ["Yes", "No"],
    required: true,
    help: "Only count confirmed bites on the area where you applied Mosquito Butter"
  },
  { 
    id: "first_bite_time", 
    label: "What time did you get your FIRST bite on the treated area?", 
    type: "time_input",
    visibility_rule: { got_bitten_treated: "Yes" },
    required: false
  },
  { 
    id: "exposure_duration", 
    label: "How long were you exposed to mosquitoes before ending the trial (without getting bitten on treated area)?", 
    type: "numerical_input", 
    min_value: 0, 
    unit: "minutes",
    visibility_rule: { got_bitten_treated: "No" },
    required: false,
    help: "For example: if you were outside from 7:00pm to 8:30pm, enter 90 minutes"
  },
  { 
    id: "total_bites_all", 
    label: "Total number of confirmed mosquito bites (treated + untreated areas combined)?", 
    type: "numerical_input", 
    min_value: 0, 
    unit: "bites",
    required: true
  },
  {
    id: "total_bites_untreated",
    label: "How many bites were on UNTREATED areas of your body?",
    type: "numerical_input",
    min_value: 0,
    unit: "bites",
    required: true,
    help: "This helps us understand mosquito activity level"
  },
  { 
    id: "bite_severity", 
    label: "If you got bitten, rate the worst bite reaction:", 
    type: "scale", 
    scale_min: 1, 
    scale_max: 5, 
    min_label: "1 - Barely noticeable", 
    max_label: "5 - Required medical attention",
    required: false,
    help: "Skip this if you didn't get any bites"
  },
  { 
    id: "reapplied_products", 
    label: "Did you reapply ANY repellent products during the trial?", 
    type: "binary_select", 
    options: ["Yes", "No"],
    required: true
  },
  { 
    id: "ease_of_application", 
    label: "The product was easy to apply to my skin", 
    type: "likert_5_point",
    required: true
  },
  { 
    id: "texture_feel", 
    label: "The texture/feel on my skin was pleasant", 
    type: "likert_5_point",
    required: true
  },
  { 
    id: "scent_satisfaction", 
    label: "I liked the natural scent", 
    type: "likert_5_point",
    required: true
  },
  { 
    id: "greasy_sticky", 
    label: "The product felt greasy or sticky after 10 minutes", 
    type: "likert_5_point",
    required: true,
    help: "1 = Not greasy at all, 5 = Very greasy"
  },
  { 
    id: "protection_satisfaction", 
    label: "I'm satisfied with the bite protection provided", 
    type: "likert_5_point",
    required: true
  },
  { 
    id: "purchase_intent", 
    label: "I would purchase Mosquito Butter based on this trial", 
    type: "likert_5_point",
    required: true
  },
  { 
    id: "daily_notes", 
    label: "Additional comments or observations:", 
    type: "text_area",
    required: false
  }
];

const BASELINE_QUESTIONS = [
  {
    id: "age_range",
    label: "Age range",
    type: "single_select",
    options: ["18-25", "26-35", "36-45", "46-55", "56+"],
    required: true
  },
  {
    id: "sex",
    label: "Sex",
    type: "single_select",
    options: ["Male", "Female", "Prefer not to say"],
    required: true
  },
  {
    id: "typical_mosquito_attraction",
    label: "Do you typically attract mosquitoes?",
    type: "single_select",
    options: ["Rarely", "Sometimes", "Often", "Very Often"],
    required: true
  },
  {
    id: "skin_type",
    label: "Skin type",
    type: "single_select",
    options: ["Dry", "Normal", "Oily", "Combination", "Sensitive"],
    required: true
  },
  {
    id: "previous_repellent_use",
    label: "What repellents have you used before? (e.g., DEET, Picaridin, natural oils)",
    type: "text_area",
    required: false
  }
];

const LIKERT_SCALE = {
  scale_min: 1, 
  scale_max: 5, 
  min_label: "1 - Strongly Disagree", 
  max_label: "5 - Strongly Agree" 
};

const App = () => {
  const [userId, setUserId] = useState(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [baselineData, setBaselineData] = useState({});
  const [dailyEntries, setDailyEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      // Generate or retrieve user ID
      const newId = 'MB2W_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setUserId(newId);

      // Try to load existing data
      try {
        const baselineKey = `baseline_${newId}`;
        const baselineResult = await window.storage.get(baselineKey, true);
        
        if (baselineResult && baselineResult.value) {
          setBaselineData(JSON.parse(baselineResult.value));
          setIsNewUser(false);
        }
      } catch (e) {
        console.log("No existing baseline data");
      }

      // Load daily entries
      try {
        const entriesKey = `entries_${newId}`;
        const entriesResult = await window.storage.get(entriesKey, true);
        
        if (entriesResult && entriesResult.value) {
          setDailyEntries(JSON.parse(entriesResult.value));
        }
      } catch (e) {
        console.log("No existing entries");
      }

      setIsLoading(false);
    } catch (e) {
      console.error("Initialization error:", e);
      setError("Failed to initialize app. Please refresh.");
      setIsLoading(false);
    }
  };

  const handleBaselineSubmit = async () => {
    // Validate required fields
    for (const q of BASELINE_QUESTIONS) {
      if (q.required && !baselineData[q.id]) {
        setError(`Please complete: ${q.label}`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const baselineKey = `baseline_${userId}`;
      await window.storage.set(baselineKey, JSON.stringify({
        ...baselineData,
        userId,
        startDate: new Date().toISOString()
      }), true);

      setIsNewUser(false);
      setSuccess("Welcome to the 2-week trial! Start logging your daily applications.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      console.error("Baseline save error:", e);
      setError("Failed to save baseline data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDailySubmit = async () => {
    // Validate required fields
    for (const q of DAILY_QUESTIONS) {
      const isVisible = !q.visibility_rule || 
        (currentEntry[Object.keys(q.visibility_rule)[0]] === Object.values(q.visibility_rule)[0]);
      
      if (isVisible && q.required) {
        const value = currentEntry[q.id];
        if (value === undefined || value === null || value === '' || 
            (Array.isArray(value) && value.some(v => v === '' || v === undefined))) {
          setError(`Please complete: ${q.label}`);
          window.scrollTo(0, 0);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newEntry = {
        ...currentEntry,
        entryId: Date.now(),
        submittedAt: new Date().toISOString()
      };

      const updatedEntries = [...dailyEntries, newEntry];
      const entriesKey = `entries_${userId}`;
      
      await window.storage.set(entriesKey, JSON.stringify(updatedEntries), true);

      setDailyEntries(updatedEntries);
      setCurrentEntry({});
      setShowDailyForm(false);
      setSuccess("Daily entry saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error("Daily save error:", e);
      setError("Failed to save entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (questionId, value, isBaseline = false) => {
    if (isBaseline) {
      setBaselineData(prev => ({ ...prev, [questionId]: value }));
    } else {
      setCurrentEntry(prev => ({ ...prev, [questionId]: value }));
    }
    setError(null);
  };

  const renderInput = (q, data, isBaseline = false) => {
    const value = data[q.id] || '';
    const baseClasses = "mt-2 p-3 w-full border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition duration-150 bg-white";

    switch (q.type) {
      case 'date':
        return (
          <input
            type="date"
            className={baseClasses}
            value={value}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleInputChange(q.id, e.target.value, isBaseline)}
          />
        );

      case 'numerical_input':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step={q.step || 1}
              min={q.min_value !== undefined ? q.min_value : 0}
              className={baseClasses}
              value={value}
              onChange={(e) => handleInputChange(q.id, e.target.value, isBaseline)}
            />
            {q.unit && <span className="text-amber-800 font-medium text-sm">{q.unit}</span>}
          </div>
        );

      case 'time_input':
        return (
          <input
            type="time"
            className={baseClasses}
            value={value}
            onChange={(e) => handleInputChange(q.id, e.target.value, isBaseline)}
          />
        );

      case 'multi_numerical':
        return (
          <div className="grid grid-cols-2 gap-4">
            {q.units.map((unit, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  {q.labels[index]} ({unit})
                </label>
                <input
                  type="number"
                  step="any"
                  className={baseClasses}
                  value={Array.isArray(value) ? value[index] || '' : ''}
                  onChange={(e) => {
                    const newValue = Array.isArray(data[q.id]) ? [...data[q.id]] : [];
                    newValue[index] = e.target.value;
                    handleInputChange(q.id, newValue, isBaseline);
                  }}
                />
              </div>
            ))}
          </div>
        );

      case 'single_select':
      case 'binary_select':
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            {q.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleInputChange(q.id, option, isBaseline)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition duration-200 ${
                  value === option
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white text-amber-900 border-2 border-amber-300 hover:bg-amber-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'single_select_with_text':
        const isOtherSelected = value && !q.options.includes(value);
        return (
          <div className="space-y-3 mt-2">
            <div className="flex flex-wrap gap-2">
              {q.options.filter(opt => opt !== "Other").map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInputChange(q.id, option, isBaseline)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition duration-200 ${
                    value === option
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white text-amber-900 border-2 border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => handleInputChange(q.id, '', isBaseline)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition duration-200 self-start ${
                  isOtherSelected ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-amber-900 border-2 border-amber-300 hover:bg-amber-50'
                }`}
              >
                Other
              </button>
              {isOtherSelected && (
                <input
                  type="text"
                  placeholder="Please specify..."
                  className={baseClasses}
                  value={value}
                  onChange={(e) => handleInputChange(q.id, e.target.value, isBaseline)}
                  autoFocus
                />
              )}
            </div>
          </div>
        );

      case 'scale':
      case 'likert_5_point':
        const minVal = q.scale_min || LIKERT_SCALE.scale_min;
        const maxVal = q.scale_max || LIKERT_SCALE.scale_max;
        const options = Array.from({ length: maxVal - minVal + 1 }, (_, i) => i + minVal);

        return (
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-xs text-amber-800 px-1">
              <span>{q.min_label || LIKERT_SCALE.min_label}</span>
              <span>{q.max_label || LIKERT_SCALE.max_label}</span>
            </div>
            <div className="flex justify-between gap-2 p-2 bg-amber-50 rounded-lg">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInputChange(q.id, option.toString(), isBaseline)}
                  className={`flex-1 p-3 rounded-lg text-sm font-semibold transition duration-200 border-2
                    ${value === option.toString()
                      ? 'bg-amber-600 text-white shadow-lg border-amber-700'
                      : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'text_area':
        return (
          <textarea
            className={baseClasses}
            rows="3"
            value={value}
            onChange={(e) => handleInputChange(q.id, e.target.value, isBaseline)}
            placeholder="Optional notes..."
          />
        );

      default:
        return <input type="text" className={baseClasses} value={value} onChange={(e) => handleInputChange(q.id, e.target.value, isBaseline)} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-amber-50">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-semibold">Loading your trial...</p>
        </div>
      </div>
    );
  }

  // Baseline Survey
  if (isNewUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4 border-amber-200">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🦟</div>
            <h1 className="text-4xl font-extrabold text-green-800 mb-2">
              Welcome to Your 14-Day Trial!
            </h1>
            <p className="text-amber-700 italic text-lg">Nature on your side. Bites not invited.</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">📋 How This Works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete this baseline survey (one time only)</li>
              <li>• Use Mosquito Butter daily for 14 days</li>
              <li>• Log each application in this app</li>
              <li>• Track your protection results</li>
              <li>• Bookmark this page to return daily!</li>
            </ul>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-400 text-red-800 rounded-lg mb-4">
              <p className="font-bold">⚠️ {error}</p>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-amber-900 border-b-2 border-amber-300 pb-2">
              Baseline Information
            </h2>

            {BASELINE_QUESTIONS.map((q) => (
              <div key={q.id} className="p-5 border-l-4 border-amber-500 bg-amber-50 rounded-lg">
                <label className="block text-base font-semibold text-gray-900 mb-1">
                  {q.label}
                  {q.required && <span className="text-red-600 ml-1">*</span>}
                </label>
                {renderInput(q, baselineData, true)}
              </div>
            ))}

            <div className="text-xs text-center p-3 bg-green-50 border-2 border-green-300 rounded-lg text-green-800">
              Your Volunteer ID: <span className="font-mono font-bold">{userId}</span>
              <p className="mt-1 text-gray-600">Save this ID! You'll need it if you switch devices.</p>
            </div>
          </div>

          <button
            onClick={handleBaselineSubmit}
            disabled={isSubmitting}
            className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-amber-500 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-amber-600 shadow-lg transition duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Starting Trial...' : 'Start My 14-Day Trial →'}
          </button>
        </div>
      </div>
    );
  }

  // Daily Tracking Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-4 border-amber-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-green-800 mb-1">
                Your 14-Day Trial
              </h1>
              <p className="text-gray-600">Day {dailyEntries.length} of 14</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{dailyEntries.length}</div>
                <div className="text-xs text-gray-600">Entries</div>
              </div>
              <button
                onClick={() => setShowDailyForm(true)}
                disabled={dailyEntries.length >= 14}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-amber-500 text-white font-bold rounded-xl hover:from-green-700 hover:to-amber-600 shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                New Entry
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between mb-1 text-sm font-medium text-amber-900">
              <span>Trial Progress</span>
              <span>{Math.round((dailyEntries.length / 14) * 100)}%</span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-3 border-2 border-amber-300">
              <div
                className="bg-gradient-to-r from-green-600 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(dailyEntries.length / 14) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {success && (
          <div className="p-4 bg-green-50 border-2 border-green-400 text-green-800 rounded-lg mb-6">
            <p className="font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </p>
          </div>
        )}

        {/* Daily Entry Form */}
        {showDailyForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-4 border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 border-b-2 border-amber-300 pb-2 mb-6">
              Daily Application Log - Day {dailyEntries.length + 1}
            </h2>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-400 text-red-800 rounded-lg mb-4">
                <p className="font-bold">⚠️ {error}</p>
              </div>
            )}

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {DAILY_QUESTIONS.map((q) => {
                const isHidden = q.visibility_rule && 
                  currentEntry[Object.keys(q.visibility_rule)[0]] !== Object.values(q.visibility_rule)[0];

                if (isHidden) return null;

                return (
                  <div key={q.id} className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      {q.label}
                      {q.required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    {q.help && (
                      <p className="text-xs text-gray-600 italic mb-2">💡 {q.help}</p>
                    )}
                    {renderInput(q, currentEntry, false)}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDailyForm(false);
                  setCurrentEntry({});
                  setError(null);
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDailySubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-amber-500 text-white font-bold rounded-xl hover:from-green-700 hover:to-amber-600 shadow-lg transition duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}

        {/* Entry History */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-4 border-amber-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Your Entries
          </h2>

          {dailyEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600">No entries yet. Click "New Entry" to start logging!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyEntries.slice().reverse().map((entry, idx) => {
                const dayNumber = dailyEntries.length - idx;
                return (
                  <div key={idx} className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200 hover:border-amber-400 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-gray-900">
                          Day {dayNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          {entry.date} at {entry.time_applied}
                        </div>
                      </div>
                      {entry.got_bitten_treated === 'No' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          ✓ Protected
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          Bitten
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Environment: <span className="font-medium text-gray-900">{entry.environment}</span></div>
                      <div className="text-gray-600">Area: <span className="font-medium text-gray-900">{entry.body_area}</span></div>
                      <div className="text-gray-600">Total bites: <span className="font-medium text-gray-900">{entry.total_bites_all}</span></div>
                      <div className="text-gray-600">Protection: <span className="font-medium text-gray-900">{entry.protection_satisfaction}/5</span></div>
                    </div>
                    {entry.daily_notes && (
                      <div className="mt-2 pt-2 border-t border-amber-200">
                        <p className="text-xs text-gray-600 italic">"{entry.daily_notes}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completion Message */}
        {dailyEntries.length >= 14 && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-amber-50 rounded-2xl shadow-xl p-8 border-4 border-green-400 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-800 mb-2">Trial Complete!</h2>
            <p className="text-gray-700 mb-4">
              Thank you for completing your 14-day trial. Your data will help us improve Mosquito Butter!
            </p>
            <p className="text-sm text-gray-600">
              Your Volunteer ID: <span className="font-mono font-bold">{userId}</span>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Crafted by <span className="font-semibold text-amber-700">WANTED LAB</span></p>
        </div>
      </div>
    </div>
  );
};

export default App;
