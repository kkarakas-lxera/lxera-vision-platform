// Smart Intent Engine
const analyzeIntent = async (input: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-profile-intent', {
      body: {
        input,
        context: {
          currentStep: currentStepRef.current,
          currentFocus: smartContext.currentFocus,
          recentInteractions: smartContext.recentInteractions.slice(-5),
          formData: formData,
          activeUI: smartContext.activeUI
        },
        formData
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Intent analysis failed:', error);
    return null;
  }
};

// Execute actions based on intent
const executeSmartAction = async (intent: any) => {
  const { type, entities, suggestedAction, naturalResponse } = intent;

  // Add natural response from AI
  if (naturalResponse) {
    addBotMessage(naturalResponse, 0, 300);
  }

  // Track interaction
  setSmartContext(prev => ({
    ...prev,
    recentInteractions: [...prev.recentInteractions, {
      type,
      data: entities,
      timestamp: new Date()
    }].slice(-10) // Keep last 10 interactions
  }));

  // Map of intent handlers
  const intentHandlers: Record<string, (entities: any) => Promise<void>> = {
    'provide_info': handleInfoProvision,
    'correction': handleCorrection,
    'navigation': handleSmartNavigation,
    'add_item': handleAddItem,
    'remove_item': handleRemoveItem,
    'edit_item': handleEditItem,
    'bulk_operation': handleBulkOperation,
    'review': handleReviewRequest,
    'confirmation': handleConfirmation
  };

  const handler = intentHandlers[type];
  if (handler) {
    await handler(entities);
  } else if (suggestedAction?.type === 'show_ui') {
    showDynamicUI(suggestedAction.params);
  }
};

// Smart handlers
const handleInfoProvision = async (entities: any) => {
  const { field, value } = entities;
  
  // Update form data based on field
  if (field && value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    await saveStepData(true);
    
    // Determine next question or action
    const nextAction = determineNextAction(field);
    if (nextAction) {
      executeNextAction(nextAction);
    }
  }
};

const handleCorrection = async (entities: any) => {
  const { field, value, target } = entities;
  
  if (target === 'last_provided_field') {
    // Correct the most recently provided field
    const lastInteraction = smartContext.recentInteractions
      .filter(i => i.type === 'provide_info')
      .pop();
    
    if (lastInteraction?.data?.field) {
      setFormData(prev => ({ ...prev, [lastInteraction.data.field]: value }));
      await saveStepData(true);
    }
  } else if (field) {
    // Direct field correction
    setFormData(prev => ({ ...prev, [field]: value }));
    await saveStepData(true);
  }
};

const handleSmartNavigation = async (entities: any) => {
  const { target } = entities;
  
  // Map target to step number
  const stepMap: Record<string, number> = {
    'cv': 1,
    'work': 2,
    'education': 3,
    'skills': 4,
    'current': 5,
    'challenges': 6,
    'growth': 7
  };
  
  const targetStep = stepMap[target] || parseInt(target);
  if (targetStep && targetStep <= maxStepReached) {
    navigateToStep(targetStep, 'edit_existing');
  }
};

// Consolidated item management handlers
const handleAddItem = async (entities: any) => {
  const { target } = entities;
  
  const addItemMap: Record<string, () => void> = {
    'work_experience': showInlineWorkForm,
    'job': showInlineWorkForm,
    'position': showInlineWorkForm,
    'education': showInlineEducationForm,
    'degree': showInlineEducationForm,
    'skill': showSkillAddition
  };
  
  const handler = addItemMap[target];
  if (handler) handler();
};

const handleRemoveItem = async (entities: any) => {
  const { target, index } = entities;
  
  if (typeof index !== 'number') return;
  
  const removeActions: Record<string, () => void> = {
    'work_experience': () => {
      setFormData(prev => ({
        ...prev,
        workExperience: prev.workExperience.filter((_, i) => i !== index)
      }));
      addBotMessage(`Removed work experience #${index + 1}`, 0);
    },
    'education': () => {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
      addBotMessage(`Removed education #${index + 1}`, 0);
    }
  };
  
  const action = removeActions[target];
  if (action) {
    action();
    await saveStepData(true);
  }
};

const handleEditItem = async (entities: any) => {
  const { target, index } = entities;
  
  if (typeof index !== 'number') return;
  
  const editItemMap: Record<string, (index: number) => void> = {
    'work_experience': showEditWorkForm,
    'education': showEditEducationForm
  };
  
  const handler = editItemMap[target];
  if (handler) handler(index);
};

// Bulk Operation Handler
const handleBulkOperation = async (entities: any) => {
  const { operation, target } = entities;
  
  if (operation === 'remove_all' && target === 'certifications') {
    setFormData(prev => ({ ...prev, certifications: [] }));
    addBotMessage("Removed all certifications", 0);
    await saveStepData(true);
  }
};

// Review Request Handler
const handleReviewRequest = async (entities: any) => {
  const { target } = entities;
  
  const reviewMap: Record<string, () => void> = {
    'all': showProfileSummary,
    'everything': showProfileSummary,
    'work': showWorkSummary,
    'education': showEducationSummary
  };
  
  const handler = reviewMap[target];
  if (handler) handler();
};

// Confirmation Handler
const handleConfirmation = async (entities: any) => {
  const { target } = entities;
  
  if (target === 'current_section') {
    // Confirm and move to next step
    moveToNextStep();
  }
};

// Helper functions for next actions
const determineNextAction = (field: string) => {
  const step = currentStepRef.current;
  
  // Map of field progressions
  const fieldProgressions: Record<string, Record<string, { type: string; field: string }>> = {
    '2': { // Work experience step
      'title': { type: 'ask', field: 'company' },
      'company': { type: 'ask', field: 'duration' }
    },
    '5': { // Current work step
      'teamSize': { type: 'ask', field: 'roleInTeam' }
    }
  };
  
  return fieldProgressions[step]?.[field] || null;
};

const executeNextAction = (action: any) => {
  if (action.type !== 'ask') return;
  
  const askActions: Record<string, () => void> = {
    'company': () => {
      addBotMessage("And which company is/was this with?", 0, 300);
    },
    'duration': () => {
      addBotMessage("How long have you been in this role?", 0, 300);
      showQuickReplies([
        { label: "< 1 year", value: "< 1 year" },
        { label: "1-3 years", value: "1-3 years" },
        { label: "3-5 years", value: "3-5 years" },
        { label: "5+ years", value: "5+ years" }
      ]);
    },
    'roleInTeam': () => {
      addBotMessage("And what's your role in the team?", 0, 300);
      showQuickReplies([
        { label: "Individual Contributor", value: "Individual Contributor" },
        { label: "Team Lead", value: "Team Lead" },
        { label: "Manager", value: "Manager" }
      ]);
    }
  };
  
  const handler = askActions[action.field];
  if (handler) handler();
};

// Dynamic UI Display Functions
const showDynamicUI = (params: any) => {
  const { type, data } = params;
  
  const uiMap: Record<string, () => void> = {
    'work_form': showInlineWorkForm,
    'education_form': showInlineEducationForm,
    'skills_review': showSkillsReview,
    'profile_summary': showProfileSummary,
    'challenges_selection': showChallengesSelection,
    'growth_selection': showGrowthSelection,
    'work_summary': showWorkSummary,
    'education_summary': showEducationSummary
  };
  
  const handler = uiMap[type];
  if (handler) {
    handler();
  } else {
    console.log('Unknown UI type:', type);
  }
};

const showSkillsReview = () => {
  const skills = formData.skills || [];
  const messageId = 'skills-review-' + Date.now();
  
  setMessages(prev => [...prev, {
    id: messageId,
    type: 'system',
    content: (
      <div className="max-w-2xl">
        <div className="text-sm font-medium mb-3">Review Your Skills</div>
        <div className="text-xs text-gray-600 mb-4">
          Rate your proficiency level for each skill
        </div>
        
        <div className="space-y-2">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">{skill.name}</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      const updatedSkills = [...skills];
                      updatedSkills[index] = { ...skill, level };
                      setFormData(prev => ({ ...prev, skills: updatedSkills }));
                    }}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      skill.level === level
                        ? level === 0 ? 'bg-gray-200 text-gray-700' :
                          level === 1 ? 'bg-yellow-200 text-yellow-800' :
                          level === 2 ? 'bg-green-200 text-green-800' :
                          'bg-blue-200 text-blue-800'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {level === 0 ? 'None' : level === 1 ? 'Learning' : level === 2 ? 'Using' : 'Expert'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
            addBotMessage("Great! Your skills have been updated. Let's talk about your current work context.");
            setCurrentStep(5);
            setTimeout(() => askCurrentWorkQuestions(), 1000);
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 w-full"
        >
          Continue →
        </button>
      </div>
    ),
    timestamp: new Date()
  }]);
};

// Generic selection component creator
const createSelectionView = (
  type: 'challenges' | 'growth',
  title: string,
  subtitle: string,
  items: string[],
  selectedKey: 'selectedChallenges' | 'selectedGrowthAreas',
  onContinue: () => void,
  continueLabel: string = 'Continue →'
) => {
  const messageId = `${type}-selection-${Date.now()}`;
  
  setMessages(prev => [...prev, {
    id: messageId,
    type: 'system',
    content: (
      <div className="max-w-2xl">
        <div className="text-sm font-medium mb-3">{title}</div>
        <div className="text-xs text-gray-600 mb-4">{subtitle}</div>
        
        <div className="space-y-2">
          {items.map((item, index) => (
            <label key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formData[selectedKey]?.includes(index)}
                onChange={(e) => {
                  const selected = formData[selectedKey] || [];
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      [selectedKey]: [...selected, index]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      [selectedKey]: selected.filter(i => i !== index)
                    }));
                  }
                }}
                className="mt-1 rounded"
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
        
        <button
          onClick={() => {
            if (!formData[selectedKey]?.length) {
              addBotMessage(`Please select at least one ${type === 'challenges' ? 'challenge' : 'growth area'} to continue.`);
              return;
            }
            setMessages(prev => prev.filter(m => m.id !== messageId));
            onContinue();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 w-full"
        >
          {continueLabel}
        </button>
      </div>
    ),
    timestamp: new Date()
  }]);
};

const showChallengesSelection = () => {
  createSelectionView(
    'challenges',
    'Select Professional Challenges',
    'Choose challenges that resonate with your current role (select at least one)',
    formData.suggestedChallenges || [],
    'selectedChallenges',
    () => {
      addBotMessage("Thanks for sharing! Now let's explore growth opportunities.");
      showGrowth();
    }
  );
};

const showGrowthSelection = () => {
  createSelectionView(
    'growth',
    'Select Growth Opportunities',
    "Choose areas where you'd like to grow (select at least one)",
    formData.suggestedGrowthAreas || [],
    'selectedGrowthAreas',
    () => completeProfile(),
    'Complete Profile →'
  );
};

const showInlineWorkForm = () => {
  const messageId = 'inline-work-form-' + Date.now();
  setMessages(prev => [...prev, {
    id: messageId,
    type: 'system',
    content: (
      <Card className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium mb-3">Add Work Experience</h3>
        <div className="space-y-3">
          <Input placeholder="Job Title" />
          <Input placeholder="Company" />
          <select className="w-full px-3 py-2 border rounded">
            <option>Duration</option>
            <option>&lt; 1 year</option>
            <option>1-3 years</option>
            <option>3-5 years</option>
            <option>5+ years</option>
          </select>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => {
              // Handle save
              setMessages(prev => prev.filter(m => m.id !== messageId));
            }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setMessages(prev => prev.filter(m => m.id !== messageId));
            }}>Cancel</Button>
          </div>
        </div>
      </Card>
    ),
    timestamp: new Date()
  }]);
};

const showInlineEducationForm = () => {
  const messageId = 'inline-education-form-' + Date.now();
  setMessages(prev => [...prev, {
    id: messageId,
    type: 'system',
    content: (
      <Card className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium mb-3">Add Education</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const newEducation = {
            degree: formData.get('degree') as string,
            institution: formData.get('institution') as string,
            year: formData.get('year') as string
          };
          
          setFormData(prev => ({
            ...prev,
            education: [...(prev.education || []), newEducation]
          }));
          setMessages(prev => prev.filter(m => m.id !== messageId));
          addBotMessage(`Added ${newEducation.degree} from ${newEducation.institution}.`);
        }}>
          <div className="space-y-3">
            <Input name="degree" placeholder="Degree" required />
            <Input name="institution" placeholder="Institution" required />
            <Input name="year" placeholder="Year" required />
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save</Button>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setMessages(prev => prev.filter(m => m.id !== messageId));
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Card>
    ),
    timestamp: new Date()
  }]);
};

// Generic edit form creator
const createEditForm = <T extends Record<string, any>>(
  type: 'work' | 'education',
  index: number,
  item: T,
  fields: Array<{ name: string; placeholder: string; value: string }>,
  updateHandler: (updatedItem: T) => void,
  successMessage: (item: T) => string
) => {
  const messageId = `edit-${type}-form-${Date.now()}`;
  
  setMessages(prev => [...prev, {
    id: messageId,
    type: 'system',
    content: (
      <div className="max-w-2xl">
        <div className="text-sm font-medium mb-3">
          Edit {type === 'work' ? `${item.title} at ${item.company}` : item.degree}
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const updatedItem = {} as T;
          
          fields.forEach(field => {
            updatedItem[field.name] = form.get(field.name) as string;
          });
          
          updateHandler(updatedItem);
          setMessages(prev => prev.filter(m => m.id !== messageId));
          addBotMessage(successMessage(updatedItem));
        }}>
          <div className="space-y-3">
            {fields.map(field => (
              <input
                key={field.name}
                name={field.name}
                type="text"
                placeholder={field.placeholder}
                defaultValue={field.value}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            ))}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessages(prev => prev.filter(m => m.id !== messageId));
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    ),
    timestamp: new Date()
  }]);
};

const showEditWorkForm = (index: number) => {
  const work = formData.workExperience?.[index];
  if (!work) return;
  
  createEditForm(
    'work',
    index,
    work,
    [
      { name: 'title', placeholder: 'Job Title', value: work.title },
      { name: 'company', placeholder: 'Company', value: work.company },
      { name: 'duration', placeholder: 'Duration', value: work.duration }
    ],
    (updatedWork) => {
      setFormData(prev => ({
        ...prev,
        workExperience: prev.workExperience.map((w, i) => 
          i === index ? { ...updatedWork, responsibilities: [] } : w
        )
      }));
    },
    (item) => `Updated ${item.title} at ${item.company}.`
  );
};

const showEditEducationForm = (index: number) => {
  const edu = formData.education?.[index];
  if (!edu) return;
  
  createEditForm(
    'education',
    index,
    edu,
    [
      { name: 'degree', placeholder: 'Degree', value: edu.degree },
      { name: 'institution', placeholder: 'Institution', value: edu.institution },
      { name: 'year', placeholder: 'Year', value: edu.year }
    ],
    (updatedEdu) => {
      setFormData(prev => ({
        ...prev,
        education: prev.education.map((e, i) => 
          i === index ? updatedEdu : e
        )
      }));
    },
    (item) => `Updated ${item.degree} from ${item.institution}.`
  );
};

const showSkillAddition = () => {
  const messageId = 'skill-addition-' + Date.now();
  setMessages(prev => [...prev, {
    id: messageId,
    type: 'system',
    content: (
      <div className="max-w-2xl">
        <div className="text-sm font-medium mb-3">Add a New Skill</div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const skillName = formData.get('skill') as string;
          if (skillName) {
            setFormData(prev => ({
              ...prev,
              skills: [...(prev.skills || []), { name: skillName, level: 2 }]
            }));
            setMessages(prev => prev.filter(m => m.id !== messageId));
            addBotMessage(`Added "${skillName}" to your skills. Would you like to add another?`);
            showQuickReplies([
              { label: "Add another skill", value: "add_skill" },
              { label: "Review all skills", value: "review_skills" },
              { label: "Continue", value: "continue_next" }
            ]);
          }
        }}>
          <div className="flex gap-2">
            <FormInput
              name="skill"
              type="text"
              placeholder="Enter skill name"
              className={FORM_CLASSES.flexInput}
              required
              autoFocus
            />
            <PrimaryButton type="submit">
              Add
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={() => {
                setMessages(prev => prev.filter(m => m.id !== messageId));
                addBotMessage("Cancelled. What would you like to do next?");
              }}
            >
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </div>
    ),
    timestamp: new Date()
  }]);
};

const showProfileSummary = () => {
  const messageId = 'profile-summary-' + Date.now();
  setMessages(prev => [...prev, {
    id: messageId,
    type: 'system',
    content: (
      <div className="max-w-2xl space-y-4">
        <div className="text-sm font-medium mb-3">Your Complete Profile Summary</div>
        
        {/* Personal Info */}
        {formData.fullName && (
          <ProfileSectionCard title="Personal Information">
            <p className="text-sm">{formData.fullName}</p>
            {formData.email && <p className={FORM_CLASSES.cardSubtext}>{formData.email}</p>}
          </ProfileSectionCard>
        )}
        
        {/* Work Experience */}
        {formData.workExperience?.length > 0 && (
          <ProfileSectionCard title="Work Experience">
            {formData.workExperience.map((work, i) => (
              <div key={i} className="mb-2">
                <p className={FORM_CLASSES.cardTitle}>{work.title}</p>
                <p className={FORM_CLASSES.cardSubtext}>{work.company} • {work.duration}</p>
              </div>
            ))}
          </ProfileSectionCard>
        )}
        
        {/* Education */}
        {formData.education?.length > 0 && (
          <ProfileSectionCard title="Education">
            {formData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className={FORM_CLASSES.cardTitle}>{edu.degree}</p>
                <p className={FORM_CLASSES.cardSubtext}>{edu.institution} • {edu.year}</p>
              </div>
            ))}
          </ProfileSectionCard>
        )}
        
        {/* Skills */}
        {formData.skills?.length > 0 && (
          <ProfileSectionCard title="Skills">
            <div className="flex flex-wrap gap-1">
              {formData.skills.map((skill, i) => (
                <span key={i} className={FORM_CLASSES.skillTag}>
                  {skill.name}
                </span>
              ))}
            </div>
          </ProfileSectionCard>
        )}
        
        <PrimaryButton
          onClick={() => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
            addBotMessage("What would you like to edit?");
            showQuickReplies([
              { label: "Work Experience", value: "edit_work" },
              { label: "Education", value: "edit_education" },
              { label: "Skills", value: "edit_skills" },
              { label: "Everything looks good", value: "profile_complete" }
            ]);
          }}
        >
          Continue
        </PrimaryButton>
      </div>
    ),
    timestamp: new Date()
  }]);
};

// Reusable className constants
const FORM_CLASSES = {
  primaryButton: "px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700",
  secondaryButton: "px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50",
  fullPrimaryButton: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 w-full",
  input: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm",
  flexInput: "flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm",
  cardContainer: "p-3 bg-gray-50 rounded-lg",
  hoverCard: "p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer",
  cardHeader: "text-xs font-medium text-gray-600 mb-2",
  cardTitle: "text-sm font-medium",
  cardSubtext: "text-xs text-gray-600",
  skillTag: "px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs",
  editLink: "text-xs text-blue-600 hover:underline"
};

// Reusable button components
const PrimaryButton = ({ onClick, children, className = "", ...props }: any) => (
  <button
    onClick={onClick}
    className={`${FORM_CLASSES.primaryButton} ${className}`}
    {...props}
  >
    {children}
  </button>
);

const SecondaryButton = ({ onClick, children, className = "", ...props }: any) => (
  <button
    onClick={onClick}
    className={`${FORM_CLASSES.secondaryButton} ${className}`}
    {...props}
  >
    {children}
  </button>
);

const FormInput = ({ className = "", ...props }: any) => (
  <input
    className={`${FORM_CLASSES.input} ${className}`}
    {...props}
  />
);

// Profile section card component
const ProfileSectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className={FORM_CLASSES.cardContainer}>
    <h4 className={FORM_CLASSES.cardHeader}>{title}</h4>
    {children}
  </div>
);

// Generic summary component creator
const createSummaryView = (
  title: string,
  items: any[],
  renderItem: (item: any, index: number) => React.ReactNode,
  editHandler: (index: number) => void,
  emptyMessage: string
) => {
  const messageId = `${title.toLowerCase().replace(' ', '-')}-summary-${Date.now()}`;
  
  setMessages(prev => [...prev, {
    id: messageId,
    type: 'system',
    content: (
      <div className="max-w-2xl">
        <div className="text-sm font-medium mb-3">{title}</div>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className={FORM_CLASSES.cardContainer}>
                <div className="flex justify-between items-start">
                  {renderItem(item, i)}
                  <button
                    onClick={() => {
                      setMessages(prev => prev.filter(m => m.id !== messageId));
                      editHandler(i);
                    }}
                    className={FORM_CLASSES.editLink}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">{emptyMessage}</p>
        )}
        <PrimaryButton
          onClick={() => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
            addBotMessage(`${title} reviewed. What's next?`);
          }}
          className="mt-4"
        >
          Done
        </PrimaryButton>
      </div>
    ),
    timestamp: new Date()
  }]);
};

const showWorkSummary = () => {
  createSummaryView(
    'Your Work Experience',
    formData.workExperience || [],
    (work) => (
      <div>
        <p className={FORM_CLASSES.cardTitle}>{work.title}</p>
        <p className={FORM_CLASSES.cardSubtext}>{work.company} • {work.duration}</p>
      </div>
    ),
    showEditWorkForm,
    'No work experience added yet.'
  );
};

const showEducationSummary = () => {
  createSummaryView(
    'Your Education',
    formData.education || [],
    (edu) => (
      <div>
        <p className={FORM_CLASSES.cardTitle}>{edu.degree}</p>
        <p className={FORM_CLASSES.cardSubtext}>{edu.institution} • {edu.year}</p>
      </div>
    ),
    showEditEducationForm,
    'No education added yet.'
  );
};