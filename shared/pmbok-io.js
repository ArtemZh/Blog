/* Inputs / Tools & Techniques / Outputs процесів PMBOK 8.
 * Витягнуто координатним розбором PDF (позиції фрагментів → колонка, маркер → рівень).
 *
 * ТІЛЬКИ ВЕРХНІЙ РІВЕНЬ. Підпункти («– Scope baseline» під «Project management plan»)
 * у первині йдуть двома стовпчиками і на частині сторінок перетікають між колонками —
 * показувати їх без ручної вичитки не можна. Верхній рівень перевірено вибірково.
 * Шість процесів, перейменованих у 8-й редакції (Integrate and Align Project Plans,
 * Plan Sourcing Strategy, Define Scope, Develop Scope Structure, Plan Financial
 * Management, Monitor Risks), у витяжку з PDF не потрапили — їхній набір зведено
 * вручну з відповідників 6-ї редакції під новими назвами. */
window.PMBOK_IO = {
 "initiate-project-or-phase": {
  "in": [
   "Business documents",
   "Agreements",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Data gathering",
   "Interpersonal and team skills",
   "Meetings",
   "Responsibility assignment matrix",
   "Project canvas"
  ],
  "out": [
   "Project charter",
   "Assumption log"
  ]
 },
 "manage-project-execution": {
  "in": [
   "Project management plan",
   "Project documents",
   "Approved change requests",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Project management information system",
   "Meetings"
  ],
  "out": [
   "Deliverables",
   "Work performance data",
   "Issue log",
   "Change requests",
   "Project management plan updates",
   "Project document updates",
   "Organizational process asset updates"
  ]
 },
 "manage-quality-assurance": {
  "in": [
   "Project management plan",
   "Project documents",
   "Organizational process assets"
  ],
  "tt": [
   "Audits",
   "Checklists",
   "Data representation",
   "Decision-making",
   "Problem-solving",
   "Process improvement"
  ],
  "out": [
   "Quality reports",
   "Change requests",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "manage-project-knowledge": {
  "in": [
   "Project management plan",
   "Project documents",
   "Deliverables",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Knowledge management",
   "Information management",
   "After-action reviews",
   "In-progress postmortems",
   "Storytelling",
   "Retrospective meetings",
   "Interpersonal and team skills"
  ],
  "out": [
   "Lessons learned register",
   "Project management plan updates",
   "Organizational process asset updates"
  ]
 },
 "monitor-and-control-project-performance": {
  "in": [
   "Project management plan",
   "Project documents",
   "Work performance information",
   "Agreements",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Data analysis",
   "Decision-making",
   "Meetings",
   "Project dashboards",
   "Visual controls",
   "Information radiators"
  ],
  "out": [
   "Work performance reports",
   "Change requests",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "assess-and-implement-changes": {
  "in": [
   "Project management plan",
   "Project documents",
   "Work performance reports",
   "Change requests",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Change control tools",
   "Data analysis",
   "Decision-making",
   "Meetings",
   "Integrated change control",
   "Backlog management"
  ],
  "out": [
   "Approved change requests",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "close-project-or-phase": {
  "in": [
   "Project charter",
   "Project management plan",
   "Project documents",
   "Accepted deliverables",
   "Business documents",
   "Agreements",
   "Procurement documentation",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment Project document updates",
   "Lessons learned register Data analysis",
   "Document analysis Final product, service, or",
   "Meetings"
  ],
  "out": [
   "Final report",
   "Organizational process asset updates"
  ]
 },
 "plan-scope-management": {
  "in": [
   "Project charter",
   "Project management plan",
   "Project documents",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Data gathering",
   "Data analysis",
   "Test and inspection planning"
  ],
  "out": [
   "Project management plan updates"
  ]
 },
 "elicit-and-analyze-requirements": {
  "in": [
   "Project charter",
   "Agreements",
   "Business case",
   "Project documents",
   "Project management plan",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Decision-making",
   "Data gathering",
   "Data analysis",
   "Data representation",
   "Interpersonal and team skills",
   "Design thinking",
   "Prioritization/ranking",
   "Meetings"
  ],
  "out": [
   "Requirements documentation"
  ]
 },
 "monitor-and-control-scope": {
  "in": [
   "Project management plan",
   "Project documents",
   "Quality metrics",
   "Approved change requests",
   "Deliverables",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Data analysis",
   "Performance reviews",
   "Audits and inspections",
   "Testing/product evaluations",
   "Data representations",
   "Process automations"
  ],
  "out": [
   "Quality reports",
   "Verified deliverables",
   "Change requests",
   "Quality control measurements",
   "Project management plan updates",
   "Project document updates",
   "Work performance information"
  ]
 },
 "validate-scope": {
  "in": [
   "Project documents",
   "Verified deliverables",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Data gathering",
   "Data analysis",
   "Inspection",
   "Decision-making",
   "Customer talks and tests",
   "Process analysis",
   "Review meetings"
  ],
  "out": [
   "Accepted deliverables",
   "Change requests",
   "Project document updates",
   "Lessons learned updates"
  ]
 },
 "plan-schedule-management": {
  "in": [
   "Project charter",
   "Project management plan",
   "Development approach",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Data analysis",
   "Meetings"
  ],
  "out": [
   "Project management plan updates"
  ]
 },
 "develop-schedule": {
  "in": [
   "Project charter",
   "Project management plan",
   "Development approach",
   "Project documents",
   "Agreements",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Decomposition",
   "Rolling wave planning",
   "Precedence diagramming method",
   "Logical relationship",
   "Leads and lags updates",
   "Dependency determination and integration",
   "Estimation techniques",
   "Reserve analysis",
   "Data analysis",
   "Voting",
   "Schedule network analysis",
   "Schedule compression",
   "Critical path method",
   "Critical chain method",
   "Resource optimization",
   "Project management information system",
   "Agile release planning"
  ],
  "out": [
   "Schedule baseline",
   "Project schedule",
   "Schedule data",
   "Project calendars",
   "Change requests",
   "Project management plan",
   "Project document updates"
  ]
 },
 "monitor-and-control-schedule": {
  "in": [
   "Project management plan",
   "Product backlog",
   "Project documents",
   "Work performance data",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Data analysis",
   "Critical path method",
   "Critical chain method",
   "Project management information system",
   "Resource optimization",
   "Leads and lags",
   "Schedule compression",
   "Branch and bound",
   "Velocity",
   "Daily coordination meetings",
   "Sprint reviews",
   "Backlog refnement"
  ],
  "out": [
   "Work performance information",
   "Schedule forecasts",
   "Change requests",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "estimate-costs": {
  "in": [
   "Project management plan",
   "Project documents",
   "Make-or-buy decisions",
   "Work package estimation",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Analogous estimating",
   "Parametric estimating",
   "Bottom-up estimating",
   "Multipoint estimating",
   "Data analysis",
   "Project management information system",
   "Decision-making"
  ],
  "out": [
   "Cost estimates",
   "Basis of estimates",
   "Project document updates"
  ]
 },
 "develop-budget": {
  "in": [
   "Project management plan",
   "Project documents",
   "Business documents",
   "Agreements",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Cost aggregation",
   "Data analysis",
   "Historical information review",
   "Funding limit reconciliation",
   "Financing"
  ],
  "out": [
   "Cost baseline",
   "Project funding requirements",
   "Project document updates"
  ]
 },
 "monitor-and-control-finances": {
  "in": [
   "Project management plan",
   "Project documents",
   "Work performance data",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Data analysis",
   "To-complete performance index",
   "Project management information system"
  ],
  "out": [
   "Work performance information",
   "Revenue and cost forecasts",
   "Change requests",
   "Funding proposals",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "identify-stakeholders": {
  "in": [
   "Project charter",
   "Business documents",
   "Project management plan",
   "Project documents",
   "Agreements",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Data gathering",
   "Data analysis",
   "Data representation",
   "Meetings"
  ],
  "out": [
   "Stakeholder register",
   "Change requests",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "plan-stakeholder-engagement": {
  "in": [
   "Project charter",
   "Project management plan",
   "Project documents",
   "Agreements",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Data gathering",
   "Data analysis",
   "Decision-making",
   "Data representation",
   "Meetings"
  ],
  "out": [
   "Project management plan updates"
  ]
 },
 "plan-communications-management": {
  "in": [
   "Project charter",
   "Project management plan",
   "Project documents",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Communication requirements analysis",
   "Communication technology",
   "Communication models",
   "Communication methods",
   "Interpersonal and team skills",
   "Data representation",
   "Meetings"
  ],
  "out": [
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "manage-stakeholder-engagement": {
  "in": [
   "Project management plan",
   "Project documents",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Communication skills",
   "Interpersonal and team skills",
   "Ground rules",
   "Meetings"
  ],
  "out": [
   "Change requests",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "manage-communications": {
  "in": [
   "Project management plan",
   "Project documents",
   "Work performance reports",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Communication technology",
   "Communication methods",
   "Communication skills",
   "Project management information system",
   "Project reporting",
   "Interpersonal and team skills",
   "Meetings"
  ],
  "out": [
   "Project communications",
   "Project management plan updates",
   "Project document updates",
   "Organizational process asset updates"
  ]
 },
 "monitor-stakeholder-engagement": {
  "in": [
   "Project management plan",
   "Project documents",
   "Work performance data",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Data analysis",
   "Decision-making",
   "Data representation",
   "Communication skills",
   "Interpersonal and team skills",
   "Meetings"
  ],
  "out": [
   "Work performance information",
   "Change requests",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "monitor-communications": {
  "in": [
   "Project management plan",
   "Project documents",
   "Work performance data",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Project management information system",
   "Data representation",
   "Interpersonal and team skills",
   "Meetings"
  ],
  "out": [
   "Work performance information",
   "Change requests",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "plan-resource-management": {
  "in": [
   "Project charter",
   "Project management plan",
   "Project documents",
   "Enterprise environmental factors",
   "Organizational process assets management"
  ],
  "tt": [
   "Expert judgment",
   "Data gathering updates",
   "Data analysis",
   "Data representation",
   "Organizational theory",
   "Meetings",
   "Green human resource",
   "Resource-based view"
  ],
  "out": [
   "Project management plan",
   "Team charter",
   "Project document updates"
  ]
 },
 "estimate-resources": {
  "in": [
   "Project management plan",
   "Project documents",
   "Project schedule",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Bottom-up estimating",
   "Analogous estimating",
   "Parametric estimating",
   "Data analysis",
   "Project management",
   "Meetings",
   "Data gathering",
   "Artifcial intelligence",
   "Predictive analytics",
   "Virtual reality",
   "Augmented reality",
   "Branch and bound",
   "Genetic algorithms",
   "Constructive cost model"
  ],
  "out": [
   "Resource requirements",
   "Basis of estimates",
   "Resource breakdown",
   "Project document updates"
  ]
 },
 "acquire-resources": {
  "in": [
   "Project management plan",
   "Project documents",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Decision-making",
   "Interpersonal and team skills",
   "Preassignment",
   "Virtual teams"
  ],
  "out": [
   "Physical or virtual resource assignments",
   "Project team assignments",
   "Resource calendars",
   "Change requests",
   "Project management plan updates",
   "Project document updates",
   "Enterprise environmental factor updates",
   "Organizational process asset updates"
  ]
 },
 "lead-the-team": {
  "in": [
   "Project management plan",
   "Project documents",
   "Team performance assessments",
   "Enterprise environmental",
   "Organizational process",
   "Etc Six Thinking Hats® is a registered trademark of Thede Bono Group"
  ],
  "tt": [
   "Colocation",
   "Virtual teams",
   "Communication technology",
   "Interpersonal and team skills",
   "Problem-solving",
   "Retrospectives",
   "Recognition and rewards factors factor updates",
   "Individual and team",
   "Data analysis",
   "Meetings",
   "Emotional intelligence",
   "Organizational cultural intelligence",
   "Leadership",
   "Tuckman ladder",
   "Project management information system",
   "Virtual collaboration tools"
  ],
  "out": [
   "Team performance assessments",
   "Change requests",
   "Project management plan updates",
   "Project document updates",
   "Enterprise environmental",
   "Organizational processassessmentsassets asset updates"
  ]
 },
 "monitor-and-control-resourcing": {
  "in": [
   "Project management plan",
   "Project documents",
   "Work performance data",
   "Agreements",
   "Organizational process assets"
  ],
  "tt": [
   "Data analysis",
   "Problem-solving",
   "Interpersonal and team skills",
   "Project management information system",
   "Value stream mapping",
   "Continuous improvement",
   "Theory of constraints",
   "Control charts",
   "Branch and bound"
  ],
  "out": [
   "Work performance information",
   "Change requests",
   "Project management plan updates",
   "Project document updates"
  ]
 },
 "plan-risk-management": {
  "in": [
   "Project charter",
   "Project management plan",
   "Project documents",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment Project management plan",
   "Data gathering",
   "Data analysis",
   "Meetings"
  ],
  "out": [
   "Risk management plan"
  ]
 },
 "identify-risks": {
  "in": [
   "Project management plan",
   "Project documents",
   "Agreements",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Data gathering",
   "Data analysis",
   "Interpersonal and team",
   "Prompt lists",
   "Meetings",
   "Artifcial intelligence"
  ],
  "out": [
   "Risk register",
   "Risk report",
   "Project document updates"
  ]
 },
 "perform-risk-analysis": {
  "in": [
   "Project management plan",
   "Project documents",
   "Enterprise environmental factors",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Data gathering and analysis",
   "Interpersonal and team skills",
   "Risk categorization",
   "Data analysis",
   "Data representation"
  ],
  "out": [
   "Project document updates"
  ]
 },
 "plan-risk-responses": {
  "in": [
   "Project management plan",
   "Project documents",
   "Enterprise environmental",
   "Organizational process"
  ],
  "tt": [
   "Expert judgment",
   "Data gathering",
   "Interpersonal and team",
   "Strategies for threats",
   "Strategies for opportunities",
   "Contingent response",
   "Strategies for overall",
   "Data analysis",
   "Decision-making"
  ],
  "out": [
   "Change requests",
   "Project management plan",
   "Project document updates"
  ]
 },
 "implement-risk-responses": {
  "in": [
   "Project management plan",
   "Project documents",
   "Organizational process assets"
  ],
  "tt": [
   "Expert judgment",
   "Interpersonal and team skills",
   "Project management information system"
  ],
  "out": [
   "Change requests",
   "Project document updates"
  ]
 },
 "integrate-and-align-project-plans": {
   "in": [
     "Project charter",
     "Outputs from other processes",
     "Enterprise environmental factors",
     "Organizational process assets"
   ],
   "tt": [
     "Expert judgment",
     "Data gathering",
     "Interpersonal and team skills",
     "Meetings"
   ],
   "out": [
     "Project management plan"
   ]
 },
 "plan-sourcing-strategy": {
   "in": [
     "Project charter",
     "Business documents",
     "Project management plan",
     "Project documents",
     "Enterprise environmental factors",
     "Organizational process assets"
   ],
   "tt": [
     "Expert judgment",
     "Data gathering",
     "Data analysis",
     "Source selection analysis",
     "Meetings"
   ],
   "out": [
     "Procurement management plan",
     "Procurement strategy",
     "Bid documents",
     "Procurement statement of work",
     "Source selection criteria",
     "Make-or-buy decisions",
     "Independent cost estimates",
     "Change requests"
   ]
 },
 "define-scope": {
   "in": [
     "Project charter",
     "Project management plan",
     "Project documents",
     "Enterprise environmental factors",
     "Organizational process assets"
   ],
   "tt": [
     "Expert judgment",
     "Data analysis",
     "Decision making",
     "Interpersonal and team skills",
     "Product analysis"
   ],
   "out": [
     "Project scope statement",
     "Project document updates"
   ]
 },
 "develop-scope-structure": {
   "in": [
     "Project management plan",
     "Project documents",
     "Enterprise environmental factors",
     "Organizational process assets"
   ],
   "tt": [
     "Expert judgment",
     "Decomposition"
   ],
   "out": [
     "Scope baseline",
     "Project document updates"
   ]
 },
 "plan-financial-management": {
   "in": [
     "Project charter",
     "Project management plan",
     "Enterprise environmental factors",
     "Organizational process assets"
   ],
   "tt": [
     "Expert judgment",
     "Data analysis",
     "Meetings"
   ],
   "out": [
     "Financial management plan"
   ]
 },
 "monitor-risks": {
   "in": [
     "Project management plan",
     "Project documents",
     "Work performance data",
     "Work performance reports"
   ],
   "tt": [
     "Data analysis",
     "Audits",
     "Meetings"
   ],
   "out": [
     "Work performance information",
     "Change requests",
     "Project management plan updates",
     "Project document updates",
     "Organizational process assets updates"
   ]
 }
};
