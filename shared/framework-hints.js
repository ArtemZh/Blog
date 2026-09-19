/* Підказки до карток Delivery Framework. Ключ — підпис картки.
 * [джерело, опис]. Описи — своїми словами, не цитати; сторінки PMBOK 8 —
 * за нумерацією книги (Guide, якщо не сказано «Standard»).
 * Усе, чого в PMBOK немає, позначено як практику або іншу методологію. */
(function () {
  var G = function (s) { return 'PMBOK 8 · Guide ' + s; };
  var PR = 'Practice — not PMBOK';
  var SG = 'Scrum Guide 2020';
  var KB = 'Kanban Method';
  var SF = 'SAFe 6';

  window.FW_HINTS = {
    /* ── фази / Focus Areas ── */
    'Initiating': ['PMBOK 8 · Standard §4.5, p. 69', 'Focus Area where the project or phase is authorised and linked to business objectives. In the eighth edition the five process groups return as Focus Areas — concepts a project covers, formally or not.'],
    'Planning': ['PMBOK 8 · Standard §4.5, p. 69', 'Focus Area for deciding how the work, schedule, finance, resources, stakeholders and risks will be handled. Most of the 40 processes live here.'],
    'Executing': ['PMBOK 8 · Standard §4.5, p. 69', 'Focus Area for doing the work: managing execution, quality assurance, knowledge, stakeholder engagement, risk responses and the team.'],
    'Monitoring and Controlling': ['PMBOK 8 · Standard §4.5, p. 69', 'Runs in parallel with Executing, not after it: tracking performance against the plan and assessing changes. That is why both sit on the same span here.'],
    'Closing': ['PMBOK 8 · Standard §4.5, p. 69', 'Focus Area for finalising the project or phase — archiving knowledge, completing planned work and releasing resources.'],

    /* ── домени PMBOK 8 ── */
    'Governance': [G('§2.1, p. 10'), 'The domain that absorbed Integration, quality assurance and sourcing. It runs from Initiate Project or Phase to Close Project or Phase and holds nine processes, including Assess and Implement Changes.'],
    'Stakeholder engagement and communications': [G('§2.5, p. 67'), 'In the eighth edition communications are no longer a separate area: identifying stakeholders, planning engagement and managing communications are seven processes of one Stakeholders domain.'],
    'Resource management (allocation)': [G('§2.6, p. 79'), 'Resources domain: planning, estimating and acquiring the team and physical or virtual resources, then monitoring how they are used.'],
    'People management': [PR + ' · maps to Lead the Team, p. 81', 'Growth, performance and retention of individual people across the project. PMBOK 8 folds developing and managing the team into one process, Lead the Team.'],
    'Team management': [G('§2.6 Lead the Team, p. 81'), 'Guiding the team day to day — feedback, collaboration, conflict resolution and escalation. In PMBOK 6 this was Develop Team and Manage Team.'],
    'Risk management': [G('§2.7, p. 92'), 'Six processes from planning risk management to monitoring risks. Qualitative and quantitative analysis are merged into Perform Risk Analysis.'],

    /* ── PMBOK 6 назви ── */
    'Stakeholder engagement management': ['PMBOK 6 · Knowledge Area 13', 'Identifying stakeholders and managing their engagement. In PMBOK 8 this is the Stakeholders domain, which also absorbed Communications.'],
    'Communications management': ['PMBOK 6 · Knowledge Area 10', 'Planning, managing and monitoring project information. In PMBOK 8 it no longer stands alone — its three processes live inside the Stakeholders domain.'],
    'Scope management': ['PMBOK 8 · Guide §2.2, p. 35', 'Six processes: planning scope management, eliciting requirements, defining scope, developing the scope structure (WBS or another form), then validating and controlling scope. Definition of Done is defined in this domain.'],
    'Schedule management': [G('§2.3, p. 47'), 'Three processes: plan schedule management, develop the schedule model, and monitor and control it.'],
    'Cost management': ['PMBOK 6 · Knowledge Area 7', 'Estimating, budgeting and controlling costs. In PMBOK 8 it widens into Finance.'],
    'Quality management': ['PMBOK 6 · Knowledge Area 8', 'In PMBOK 8 quality is no longer a separate area: it becomes a principle and the Manage Quality Assurance process inside Governance.'],
    'Procurement management': ['PMBOK 6 · Knowledge Area 12', 'In PMBOK 8 procurement as an area disappears: the decision stays as Plan Sourcing Strategy in Governance, and execution moves to Resources.'],
    'Finance management': [G('§2.4, p. 58'), 'Wider than cost: planning financial management, estimating costs, developing the budget and keeping the deliverables financially viable, including revenue forecasts.'],
    'Sourcing strategy': [G('§2.1 Plan Sourcing Strategy, p. 16'), 'Deciding which parts of the project are done internally and which are outsourced, weighing skills, capacity, risk, culture and value.'],

    /* ── рівень проєкту ── */
    'Collect Requirements': ['PMBOK 6 · process 5.2', 'Determining and documenting stakeholder needs. Renamed in PMBOK 8 to Elicit and Analyze Requirements.'],
    'Elicit and Analyze Requirements': [G('§2.2, p. 39'), 'Determining, documenting and managing stakeholder needs and requirements so that they meet project objectives.'],
    'Perform Integrated Change Control': ['PMBOK 6 · process 4.6', 'Reviewing and approving change requests across all baselines. In PMBOK 8 this becomes Assess and Implement Changes in Governance.'],
    'Assess and Implement Changes': [G('§2.1, p. 17'), 'Managing changes that may affect any part of the project and adjusting plans throughout the life cycle. Here it feeds the four disciplines, which in turn update the Product Backlog.'],
    'Product Backlog': [G('§4, p. 114'), 'An ordered list of the work to be done — requirements, features, epics and stories — usually owned by the product owner and representing the product scope and vision.'],
    'Release Backlog': [PR, 'The slice of the Product Backlog planned for the next release. PMBOK 8 describes agile release planning (p. 146) as setting scope and timelines of a 3–6 month release from the roadmap.'],
    'Release management': [PR + ' · see release planning, p. 146', 'Coordinating what is released, when, and with what readiness — across several cycles. Not a PMBOK process; it spans Executing and Monitoring and Controlling at project level.'],
    'Final product, service, or result transition': [G('§2.1 Close Project or Phase, p. 17'), 'Handing the result over to operations or the client and closing the project: archiving knowledge, completing work and releasing resources.'],

    /* ── пресейл ── */
    'Lead / RFP intake': [PR, 'A request arrives from the client or through sales: RFP, RFI or a direct enquiry. Recorded before any estimate is made.'],
    'Client potential assessment': [PR, 'Is the account worth pursuing: budget, growth potential, fit with our capabilities, payment risk.'],
    'Go / no-go decision': [PR, 'Sales and delivery decide whether to invest in a proposal at all. A quick “no” is cheaper than a lost bid.'],
    'Clarification call with the client': [PR, 'First contact with delivery: goals, constraints, decision makers and what “done” means for the client.'],
    'Technical questions & assumptions': [PR, 'Product owner or BA lists open questions and the assumptions the estimate will rest on.'],
    'Rough estimate + WBS': [PR + ' · WBS: see scope baseline, p. 143', 'A first decomposition of scope and a range estimate. PMBOK 8 calls decomposition Develop Scope Structure — WBS is one possible form.'],
    'Team composition & rates': [PR, 'Roles, seniority and allocation needed to deliver, priced with the rate card.'],
    'Assumption & risk log': [PR + ' · cf. assumption log, p. 114', 'Everything the estimate depends on and what may break it. It travels with the deal into delivery.'],
    'Commercial proposal — T&M / FP / Dedicated': [PR, 'The offer and the engagement model: time and materials, fixed price or a dedicated team. The choice follows the uncertainty of the scope.'],
    'Negotiation & scope trade-offs': [PR, 'Price, scope and timeline are balanced with the client. Every trade-off is written back into assumptions.'],
    'Hand-over to delivery: estimate, assumptions, team, risks': [PR, 'Sales passes the deal to the delivery manager with everything the price was based on — so the project does not start from zero.'],
    'Estimate confidence gate': [PR, 'Is the estimate solid enough to sell? If not, a paid discovery is inserted instead of padding the number.'],

    /* ── discovery ── */
    'Discovery SOW & kick-off': [PR, 'A separate small contract for discovery: goals, duration of 2–6 weeks, participants and the expected report.'],
    'Stakeholder interviews': [PR + ' · cf. Identify Stakeholders, p. 70', 'Talking to users, sponsors and the people who decide, to understand needs and constraints first-hand.'],
    'As-is analysis: systems, data, integrations': [PR, 'What exists today on the client side: systems, data quality and integrations the solution must live with.'],
    'Requirements workshop': [PR + ' · cf. Elicit and Analyze Requirements, p. 39', 'Joint session to agree scope, priorities and acceptance criteria.'],
    'Solution options & architecture outline': [PR, 'Two or three options with trade-offs, and the outline of the chosen architecture.'],
    'Technical spike on the riskiest assumption': [PR, 'A short experiment that proves or disproves the assumption most likely to break the estimate.'],
    'Re-estimate — narrow the range': [PR, 'The estimate is redone with what discovery learned; the range should be noticeably narrower.'],
    'Discovery report & decision gate': [PR, 'Findings, options and a new estimate. Three ways out: proposal, T&M instead of fixed price, or walking away.'],

    /* ── артефакти ── */
    'Contract / Agreement Document': [G('§4, p. 114'), 'Agreements define the initial intentions of the project — a contract, SLA, memorandum of understanding, purchase order or even an email.'],
    'Business case': [G('§4, p. 116'), 'A documented economic feasibility study showing why the benefits justify the project.'],
    'Project charter': [G('§4, p. 125'), 'Issued by the sponsor: formally authorises the project and gives the project manager authority to use organisational resources.'],
    'Kick-Off (supervision by Senior PM)': [PR + ' · kickoffs mentioned, p. 181', 'The first meeting of client and team: goals, roles, ways of working and communication channels.'],
    'Communications plan': [G('§4, p. 117'), 'Describes how, when and by whom project information is prepared and distributed, and how communications are monitored.'],
    'Stakeholder register': [G('§4, p. 141'), 'Project document with information about stakeholders, including their assessment and classification.'],
    'Work breakdown structure': [G('§4 scope baseline, p. 143'), 'Hierarchical decomposition of the work into work packages. In PMBOK 8 it is part of the scope baseline and one possible output of Develop Scope Structure.'],
    'Gantt chart': [G('Glossary, p. 268'), 'Bar chart of the schedule: activities down the side, dates across, bars placed by start and finish.'],
    'Resource breakdown structure': [G('§4, p. 132'), 'Hierarchy of resources by category and type — labour, materials, equipment — with skill or grade levels.'],
    'Budget': [G('§4 cost baseline, p. 118'), 'Aggregated cost estimates; its approved, time-phased version without management reserve is the cost baseline, changed only through change control.'],
    'Risk register': [G('§4, p. 137'), 'Repository of risk management outputs: identified individual risks, their analysis and planned responses.'],
    'Stakeholder engagement assessment matrix': [G('§5, p. 200'), 'Compares current and desired engagement of each stakeholder — unaware, resistant, neutral, supportive or leading.'],
    'Tracking tools': [PR, 'Jira, boards and reports where the work is tracked. Chosen and configured by the Senior PM so that metrics can be trusted.'],
    'Roadmap': [G('§4 release planning, p. 146'), 'The product roadmap sets the direction of releases; agile release planning turns it into a 3–6 month release schedule.'],
    'Performance measurement baseline': [G('§4, p. 124'), 'Integrated scope, schedule and cost baselines against which execution is measured and controlled.'],
    'Responsibility assignment matrix': [G('§5, p. 194'), 'Grid showing which people are assigned to each work package or activity — for example, a RACI chart.'],
    'Burn chart': [G('§5, p. 150 · p. 175'), 'Burndown shows work remaining in the iteration; burnup shows work completed toward a milestone against total scope.'],
    'Velocity chart': [G('§5, p. 211'), 'Velocity measures the rate at which a team produces, validates and gets deliverables accepted within a fixed interval.'],
    'Cycle time chart': [G('§5, p. 213'), 'Cycle time is from the start of a task to its completion; lead time is from entering the board to delivery.'],
    'Cumulative flow diagram': [G('Glossary, p. 267'), 'Shows work completed over time together with work in progress and in the backlog — bottlenecks appear as widening bands.'],
    'Project Health Status': [PR + ' · cf. status report, p. 142', 'Regular status report: progress since the last report, forecasts for cost and schedule, risks and decisions needed.'],
    'Risk report': [G('§4, p. 138'), 'Summarises sources of overall project risk and the identified individual risks; built up progressively through the risk processes.'],
    'Employee Risk Reduction report': [PR, 'Tracks people risks — burnout, attrition, single points of knowledge — and the actions taken.'],
    'Assumption log': [G('§4, p. 114'), 'Records all assumptions and constraints through the life cycle; new ones are added and existing ones confirmed or closed. Here it continues the pre-sale assumption log.'],
    'Requirements traceability matrix': [G('§4, p. 131'), 'Links each requirement from its origin to the deliverable that satisfies it, so nothing approved is lost and nothing unapproved is built.'],
    'Team charter': [G('§4, p. 142'), 'Team values, agreements and operating guidelines: communication rules, decision-making criteria, conflict resolution, meeting norms.'],
    'Issue log': [G('§4, p. 123'), 'Project document where issues are recorded and followed up — owner, status and resolution. Unlike a risk, an issue has already happened.'],
    'Lessons learned register': [G('§4, p. 123'), 'Knowledge gained during the project, phase or iteration, recorded as the work goes rather than at the end, so the team and the organisation can reuse it.'],
    'Change log': [G('§4, p. 116'), 'All submitted changes with their current status and disposition. It is the record of Assess and Implement Changes.'],
    'Final report': [G('§4, p. 121'), 'Summary of project performance: scope, quality, cost and schedule objectives, and evidence that completion criteria were met.'],
    'Account overview': [PR, 'One-page view of the client account: contracts, team, revenue, relationship health.'],
    'Feedback from clients': [PR, 'Regular structured feedback — NPS or interviews — recorded and acted on.'],
    'Meeting notes (past meeting recordings or notes)': [PR + ' · cf. lessons learned register, p. 123', 'Decisions and agreements from meetings, kept where the team can find them.'],
    'Team management (1-2-1 meeting, 1-2-1 notes)': [PR + ' · cf. Lead the Team, p. 81', 'One-to-one meetings with team members and notes on growth, concerns and agreements.'],
    'Finance performance: P&L, invoices': [PR + ' · cf. Monitor and Control Finances, p. 62', 'Margin, invoices and payments per account — the financial side of delivery in outsourcing.'],
    'Project Audit (supervision by Senior PM)': [G('§4 audits, p. 148'), 'A structured, independent check that project activities follow organisational and project policies and procedures.'],
    'RFP / RFI from the client': [PR, 'The client’s request for proposal or information — the starting document of pre-sale.'],
    'Client potential report': [PR, 'Summary of the account assessment used for the go / no-go decision.'],
    'Clarification questions list': [PR, 'Questions to the client, with answers recorded as they come.'],
    'Estimate & WBS draft': [PR, 'Draft decomposition and range estimate that the proposal is priced on.'],
    'Team composition & rate card': [PR, 'Proposed roles, seniority and rates.'],
    'Commercial proposal': [PR, 'The offer sent to the client with the engagement model and price.'],
    'Discovery SOW': [PR, 'Contract for the discovery engagement.'],
    'Interview notes': [PR, 'Records of stakeholder interviews.'],
    'As-is map': [PR, 'Map of current systems, data and integrations.'],
    'Solution vision': [PR, 'Chosen solution option with its architecture outline.'],
    'Refined backlog & WBS': [PR, 'Backlog and decomposition rebuilt after discovery.'],
    'Narrowed estimate range': [PR, 'New estimate with a narrower spread.'],
    'Assumption & risk log v2': [PR, 'Assumptions and risks updated with what discovery confirmed or disproved.'],
    'Discovery report': [PR, 'Findings, options, estimate and recommendation.'],

    /* ── цикл: Universal ── */
    'Select work': [PR, 'Choose what goes into the next cycle from the Release Backlog.'],
    'Fix cycle scope': [PR, 'Agree the scope the team commits to for this cycle.'],
    'Track progress': [PR + ' · cf. Monitor and Control Project Performance, p. 17', 'Follow progress and impediments during the cycle.'],
    'Accept result': [PR + ' · cf. Validate Scope', 'Stakeholders accept what was delivered in the cycle.'],
    'Improve process': [PR, 'Look back at how the cycle went and agree improvements.'],
    'Readiness criteria': [PR, 'What an item needs before the team starts it — agreed by the product owner.'],
    'Build increment': [PR, 'Engineering work that produces the increment.'],
    'Verify quality': [PR + ' · Manage Quality Assurance, p. 16', 'Checks built into the work — reviews, tests, definition of done.'],
    'Validate with users': [PR, 'Users or the client try the result in their own scenarios.'],
    'Release increment': [PR, 'The increment is handed to Release management for delivery.'],

    /* ── Scrum ── */
    'Sprint Planning': [SG, 'Starts the Sprint: why it is valuable (Sprint Goal), what can be Done and how the work will get done. Up to 8 hours for a one-month Sprint.'],
    'Daily Scrum': [SG, '15-minute event for the Developers to inspect progress toward the Sprint Goal and adapt the Sprint Backlog.'],
    'Sprint Review': [SG, 'Inspects the outcome of the Sprint with stakeholders and adapts the Product Backlog. The Guide says it should never be treated as a gate to releasing value.'],
    'Sprint Retrospective': [SG, 'Ends the Sprint: the team inspects how it worked and picks improvements. Next Sprint starts right after.'],
    'Sprint Backlog': [SG, 'Sprint Goal, the Product Backlog items selected for the Sprint and the plan for delivering them. Commitment: Sprint Goal.'],
    'Increment': [SG, 'A usable step toward the Product Goal. Work becomes part of an Increment only when it meets the Definition of Done — the commitment of this artifact.'],
    'Product Backlog refinement': [SG, 'Ongoing activity of breaking down and ordering Product Backlog items. The commitment of the Product Backlog is the Product Goal.'],
    'Deliver the Increment': [SG, 'An Increment may be delivered to stakeholders before the Sprint ends. UAT and Definition of Ready are company practices, not part of Scrum.'],

    /* ── Kanban ── */
    'Options': [KB, 'Upstream ideas and requests not yet committed to. Discarding options is normal and cheap.'],
    'Commitment point': [KB, 'Where an item is pulled into the system and the team commits to deliver it. Lead time starts here.'],
    'In progress': [KB, 'Work flows through columns with explicit policies and WIP limits; new work is pulled only when capacity frees up.'],
    'Delivery point': [KB, 'Item is ready to be delivered to the customer.'],
    'Delivered': [KB, 'The customer has it. Lead time ends; flow metrics — lead time, throughput, cycle time — feed the reviews.'],
    'Strategy & Risk Review': [KB + ' · Kanban cadences', 'Strategy Review (typically quarterly) sets direction; Risk Review (monthly) looks at delivery risks. Both shape what enters Options.'],
    'Replenishment': [KB + ' · Kanban cadences', 'Typically weekly: selects items from Options to move past the commitment point.'],
    'Kanban Meeting': [KB + ' · Kanban cadences', 'Daily, about 15 minutes, around the board: what blocks the flow, not who did what.'],
    'Delivery Planning': [KB + ' · Kanban cadences', 'Held per delivery: decides what goes out and how.'],
    'Service Delivery Review': [KB + ' · Kanban cadences', 'Typically bi-weekly with the customer: is the service meeting expectations, what policies should change. Operations Review does the same across services monthly.'],

    /* ── SAFe ── */
    'PI Planning': [SF, 'Two-day event for the whole Agile Release Train: teams agree PI objectives, dependencies and risks for the next 8–12 weeks.'],
    'Iterations': [SF, 'Four or five iterations of about two weeks each, run by the teams inside the Planning Interval.'],
    'IP iteration': [SF, 'Innovation and Planning iteration at the end of the PI: innovation, learning and preparation for the next PI Planning.'],
    'Inspect & Adapt': [SF, 'End-of-PI event: PI system demo, quantitative review and a problem-solving workshop on systemic issues.'],
    'Iteration Planning': [SF, 'Team plans the iteration: goals and stories it commits to.'],
    'Team Sync': [SF, 'Daily team coordination, the SAFe equivalent of the Daily Scrum.'],
    'Iteration Review & Retro': [SF, 'Team demonstrates the iteration increment and reflects on how it worked.'],
    'System Demo': [SF, 'After every iteration: the integrated increment of the whole train is shown to stakeholders.'],
    'Continuous Delivery Pipeline': [SF, 'Continuous Exploration, Integration and Deployment — changes flow to production independently of the PI rhythm.'],
    'Release on Demand': [SF, 'Releasing to customers is a business decision, decoupled from the development cadence.'],

    /* ── Incremental waterfall ── */
    'Requirements': [PR + ' · cf. Elicit and Analyze Requirements, p. 39', 'Requirements for this increment are gathered and baselined before design.'],
    'Design': [PR, 'Solution design for the increment, owned by the architect.'],
    'Build': [PR, 'Development of the increment against the baselined design.'],
    'Test': [PR, 'System and integration testing of the increment.'],
    'Acceptance gate': [PR + ' · cf. Validate Scope', 'Milestone where the client formally accepts the increment. Changes after the baseline go through Assess and Implement Changes.'],
    'Release': [PR, 'The accepted increment goes to operations; the next increment starts from its own requirements.']
  };
})();
