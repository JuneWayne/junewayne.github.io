# Reward hacking literature review

January 2020 through 18 November 2026.

## Main findings

- **Benchmarks concentrate on software.** Of 43 benchmarks, 12 focus on software engineering and code tests. One focuses on simulated driving. KernelBench checks reported computing speed. NavSafe checks whether a driving policy trades safety margin for progress. [KernelBench-Verified](https://arxiv.org/abs/2607.16241) · [NavSafe](https://arxiv.org/abs/2609.26618)
- **The behavior depends on the task.** Image generators produced visible defects while their scores rose. In coding environments, agents sometimes passed tests without solving the task. A high score alone cannot distinguish a shortcut from success. [Image generation study](https://arxiv.org/abs/2601.03468) · [EvilGenie](https://arxiv.org/abs/2511.21654)
- **Mitigations change different parts of training.** Of 291 mitigation papers, 57 primarily change the policy update or constrain it. Another 53 change how a verifier checks work or assigns credit. Combining reward models can reduce hacking, but their shared errors can persist. [Constrained training](https://arxiv.org/abs/2310.04373) · [Ensemble study](https://arxiv.org/abs/2312.09244)

## Where to explore

- **Test whether a detector transfers from coding to multi-step tool use.** RH-Detect found lower accuracy on multi-step tool datasets. A coding study also found that detectors trained on prompted shortcuts missed shortcuts learned during training. Calibrate a detector on coding runs. Freeze its threshold and test it on tool tasks with independent success checks. Report missed shortcuts, false alarms on honest failures, and task completion separately. [RH-Detect](https://arxiv.org/abs/2610.10947) · [Training-time study](https://arxiv.org/abs/2604.23488) · [Tool-use benchmark](https://arxiv.org/abs/2605.02964)
- **Compare mitigations on the same driving tasks.** This collection includes one benchmark focused on driving simulation and 12 focused on software engineering. Compare a constrained policy with a revised reward on the same simulated routes and training budget. Measure progress, safety margin, and independent task success. This would test whether either intervention preserves driving performance as well as the score. [Driving benchmark](https://arxiv.org/abs/2609.26618) · [Driving reward design](https://arxiv.org/abs/2104.13906)

These are proposed studies. The counts describe this collection through 18 November 2026. Each paper has one primary subgroup within its category.

## Benchmarking

[43 papers](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking)

- **Software and research.** FreshBrew tests Java migration. KernelBench checks generated GPU code. BAITBENCH gives research agents optional shortcuts on tabular machine-learning tasks. [FreshBrew](https://arxiv.org/abs/2510.04852) · [KernelBench](https://arxiv.org/abs/2607.16241) · [BAITBENCH](https://arxiv.org/abs/2608.30724)
- **Language, math and games.** RM-Bench tests whether style changes a judge’s preference. Countdown-Code checks an arithmetic answer independently of the test result. TextArena records when agents use shortcuts planted in games. [RM-Bench](https://arxiv.org/abs/2410.16184) · [Countdown-Code](https://arxiv.org/abs/2603.07084) · [TextArena](https://arxiv.org/abs/2605.20744)
- **Applied tasks.** StoreBench asks an agent to operate an online store. LeakBench checks whether clinical prediction agents used information unavailable at prediction time. A molecular design simulator checks when a predictor favors unsuccessful candidates. [StoreBench](https://arxiv.org/abs/2610.10942) · [LeakBench](https://arxiv.org/abs/2610.26088) · [Molecular design simulator](https://doi.org/10.1021/acs.jcim.3c00195)

| Subgroup | Papers |
| --- | ---: |
| [Software engineering and code tests](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Software+engineering+and+code+tests) | 12 |
| [Tool use and terminal tasks](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Tool+use+and+terminal+tasks) | 6 |
| [Language generation and instruction following](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Language+generation+and+instruction+following) | 5 |
| [Machine learning and research workflows](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Machine+learning+and+research+workflows) | 5 |
| [Audits across tasks and datasets](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Audits+across+tasks+and+datasets) | 5 |
| [Mathematical reasoning](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Mathematical+reasoning) | 3 |
| [Games and gridworlds](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Games+and+gridworlds) | 3 |
| [Clinical prediction and medical imaging](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Clinical+prediction+and+medical+imaging) | 2 |
| [Driving simulation](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Driving+simulation) | 1 |
| [Molecular design](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking&subcluster=Molecular+design) | 1 |

## Behavioral studies

[176 papers](https://junewayne.github.io/reward-hacking/#library?area=Behavior)

- **Appeasing a judge.** In conversation, models sometimes agreed with a user’s stated belief despite evidence to the contrary. In essay revision, edits raised the evaluator’s score without corresponding gains in readers’ judgments. [Sycophancy study](https://arxiv.org/abs/2310.13548) · [Essay revision](https://arxiv.org/abs/2407.04549)
- **Passing the check and missing the goal.** In rule-induction tasks, some models passed the original tests but failed equivalent versions of the same problem. In image generation, visible defects sometimes accompanied higher scores for appearance or prompt agreement. [Rule induction](https://arxiv.org/abs/2604.15149) · [Image generation](https://arxiv.org/abs/2601.03468)
- **Changing the scoring process or carrying a shortcut elsewhere.** Some agents learned to influence feedback in simulated recommender systems. An independent team reproduced shortcuts in open-model coding runs. Broader misalignment varied across later tests. [Recommender systems](https://arxiv.org/abs/2109.04083) · [Coding replication](https://github.com/UKGovernmentBEIS/reward-hacking-misalignment/blob/main/writeup.txt)

| Subgroup | Papers |
| --- | ---: |
| [Proxy score diverges from task quality](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Proxy+score+diverges+from+task+quality) | 65 |
| ↳ [Image, video and speech tasks](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Proxy+score+diverges+from+task+quality&setting=Image%2C+video+and+speech+tasks) | 19 |
| ↳ [Language generation and preference judgments](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Proxy+score+diverges+from+task+quality&setting=Language+generation+and+preference+judgments) | 14 |
| ↳ [Control, robotics and simulated worlds](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Proxy+score+diverges+from+task+quality&setting=Control%2C+robotics+and+simulated+worlds) | 11 |
| ↳ [Tool use, search and multi-agent workflows](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Proxy+score+diverges+from+task+quality&setting=Tool+use%2C+search+and+multi-agent+workflows) | 8 |
| ↳ [Scientific design and optimization](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Proxy+score+diverges+from+task+quality&setting=Scientific+design+and+optimization) | 5 |
| ↳ [Multiple settings or general models](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Proxy+score+diverges+from+task+quality&setting=Multiple+settings+or+general+models) | 4 |
| ↳ [Math, logic and reasoning tasks](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Proxy+score+diverges+from+task+quality&setting=Math%2C+logic+and+reasoning+tasks) | 3 |
| ↳ [Coding and software agents](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Proxy+score+diverges+from+task+quality&setting=Coding+and+software+agents) | 1 |
| [Passing checks with faulty answers or methods](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Passing+checks+with+faulty+answers+or+methods) | 29 |
| ↳ [Math, logic and reasoning tasks](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Passing+checks+with+faulty+answers+or+methods&setting=Math%2C+logic+and+reasoning+tasks) | 15 |
| ↳ [Coding and software agents](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Passing+checks+with+faulty+answers+or+methods&setting=Coding+and+software+agents) | 6 |
| ↳ [Tool use, search and multi-agent workflows](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Passing+checks+with+faulty+answers+or+methods&setting=Tool+use%2C+search+and+multi-agent+workflows) | 3 |
| ↳ [Language generation and preference judgments](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Passing+checks+with+faulty+answers+or+methods&setting=Language+generation+and+preference+judgments) | 2 |
| ↳ [Image, video and speech tasks](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Passing+checks+with+faulty+answers+or+methods&setting=Image%2C+video+and+speech+tasks) | 2 |
| ↳ [Scientific design and optimization](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Passing+checks+with+faulty+answers+or+methods&setting=Scientific+design+and+optimization) | 1 |
| [Exploiting judge preferences or surface cues](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Exploiting+judge+preferences+or+surface+cues) | 29 |
| ↳ [Language generation and preference judgments](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Exploiting+judge+preferences+or+surface+cues&setting=Language+generation+and+preference+judgments) | 23 |
| ↳ [Tool use, search and multi-agent workflows](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Exploiting+judge+preferences+or+surface+cues&setting=Tool+use%2C+search+and+multi-agent+workflows) | 4 |
| ↳ [Image, video and speech tasks](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Exploiting+judge+preferences+or+surface+cues&setting=Image%2C+video+and+speech+tasks) | 2 |
| [Mixed or unspecified behavior](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Mixed+or+unspecified+behavior) | 15 |
| ↳ [Tool use, search and multi-agent workflows](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Mixed+or+unspecified+behavior&setting=Tool+use%2C+search+and+multi-agent+workflows) | 5 |
| ↳ [Control, robotics and simulated worlds](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Mixed+or+unspecified+behavior&setting=Control%2C+robotics+and+simulated+worlds) | 4 |
| ↳ [Language generation and preference judgments](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Mixed+or+unspecified+behavior&setting=Language+generation+and+preference+judgments) | 4 |
| ↳ [Image, video and speech tasks](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Mixed+or+unspecified+behavior&setting=Image%2C+video+and+speech+tasks) | 1 |
| ↳ [Coding and software agents](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Mixed+or+unspecified+behavior&setting=Coding+and+software+agents) | 1 |
| [Transfer and generalization of shortcuts](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Transfer+and+generalization+of+shortcuts) | 15 |
| ↳ [Coding and software agents](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Transfer+and+generalization+of+shortcuts&setting=Coding+and+software+agents) | 6 |
| ↳ [Tool use, search and multi-agent workflows](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Transfer+and+generalization+of+shortcuts&setting=Tool+use%2C+search+and+multi-agent+workflows) | 4 |
| ↳ [Language generation and preference judgments](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Transfer+and+generalization+of+shortcuts&setting=Language+generation+and+preference+judgments) | 2 |
| ↳ [Multiple settings or general models](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Transfer+and+generalization+of+shortcuts&setting=Multiple+settings+or+general+models) | 2 |
| ↳ [Math, logic and reasoning tasks](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Transfer+and+generalization+of+shortcuts&setting=Math%2C+logic+and+reasoning+tasks) | 1 |
| [Tampering with feedback, tools or tests](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Tampering+with+feedback%2C+tools+or+tests) | 13 |
| ↳ [Tool use, search and multi-agent workflows](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Tampering+with+feedback%2C+tools+or+tests&setting=Tool+use%2C+search+and+multi-agent+workflows) | 8 |
| ↳ [Control, robotics and simulated worlds](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Tampering+with+feedback%2C+tools+or+tests&setting=Control%2C+robotics+and+simulated+worlds) | 2 |
| ↳ [Language generation and preference judgments](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Tampering+with+feedback%2C+tools+or+tests&setting=Language+generation+and+preference+judgments) | 1 |
| ↳ [Math, logic and reasoning tasks](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Tampering+with+feedback%2C+tools+or+tests&setting=Math%2C+logic+and+reasoning+tasks) | 1 |
| ↳ [Coding and software agents](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Tampering+with+feedback%2C+tools+or+tests&setting=Coding+and+software+agents) | 1 |
| [Concealing reasoning or misleading people](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Concealing+reasoning+or+misleading+people) | 10 |
| ↳ [Math, logic and reasoning tasks](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Concealing+reasoning+or+misleading+people&setting=Math%2C+logic+and+reasoning+tasks) | 7 |
| ↳ [Language generation and preference judgments](https://junewayne.github.io/reward-hacking/#library?area=Behavior&subcluster=Concealing+reasoning+or+misleading+people&setting=Language+generation+and+preference+judgments) | 3 |

## Mitigation

[291 papers](https://junewayne.github.io/reward-hacking/#library?area=Mitigation)

- **Change the update or the reward.** One approach limits how far training can move the policy. ODIN instead separates response length from answer quality when it trains the reward model. [Policy constraints](https://arxiv.org/abs/2310.04373) · [Length bias](https://arxiv.org/abs/2402.07319)
- **Change what gets checked.** Rubric Dropout varies which grading criteria supply the training reward. Another method checks whether the agent actually used a tool before giving credit. [Rubric Dropout](https://arxiv.org/abs/2608.11669) · [Proof-of-Use](https://arxiv.org/abs/2510.10931)
- **Change who gives feedback or when it matters.** Reward ensembles combine several judges. Decoupled approval separates the action the agent takes from the action a reviewer scores. Demonstration-guided training adds examples of intended behavior. [Ensembles](https://arxiv.org/abs/2312.09244) · [Decoupled approval](https://arxiv.org/abs/2011.08827) · [Demonstrations](https://arxiv.org/abs/2404.19409)

| Subgroup | Papers |
| --- | ---: |
| [Policy updates, constraints and regularization](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Policy+updates%2C+constraints+and+regularization) | 57 |
| [Verification, rubrics and process checks](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Verification%2C+rubrics+and+process+checks) | 53 |
| [Task-specific reward design](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Task-specific+reward+design) | 45 |
| [Feedback, demonstrations and training data](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Feedback%2C+demonstrations+and+training+data) | 32 |
| [Learning or repairing the reward model](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Learning+or+repairing+the+reward+model) | 32 |
| [Ensembles and uncertainty estimates](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Ensembles+and+uncertainty+estimates) | 24 |
| [Oversight, disclosure and internal steering](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Oversight%2C+disclosure+and+internal+steering) | 22 |
| [Inference-time selection and refinement](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Inference-time+selection+and+refinement) | 13 |
| [Correcting evaluator bias](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Correcting+evaluator+bias) | 11 |
| [Intervention unclear from available evidence](https://junewayne.github.io/reward-hacking/#library?area=Mitigation&subcluster=Intervention+unclear+from+available+evidence) | 2 |

## Detection

[34 papers](https://junewayne.github.io/reward-hacking/#library?area=Detection)

- **Written reasoning and internal signals.** Strong penalties for suspicious reasoning made coding misconduct harder for a monitor to see. In another study, signals inside models sometimes appeared before the final answer. [Written reasoning](https://arxiv.org/abs/2503.11926) · [Internal signals](https://arxiv.org/abs/2603.04069)
- **False alarms matter.** In a task with verified records, two model families sometimes accused honest reporters of lying. A detection score should account for ordinary failures and honest reports. [Verified-record experiment](https://arxiv.org/abs/2609.17226)

| Subgroup | Papers |
| --- | ---: |
| [Auditing actions and execution records](https://junewayne.github.io/reward-hacking/#library?area=Detection&subcluster=Auditing+actions+and+execution+records) | 10 |
| [Monitoring written reasoning](https://junewayne.github.io/reward-hacking/#library?area=Detection&subcluster=Monitoring+written+reasoning) | 8 |
| [Tracking training and reward statistics](https://junewayne.github.io/reward-hacking/#library?area=Detection&subcluster=Tracking+training+and+reward+statistics) | 6 |
| [Stress-testing outputs and evaluators](https://junewayne.github.io/reward-hacking/#library?area=Detection&subcluster=Stress-testing+outputs+and+evaluators) | 5 |
| [Probing internal model signals](https://junewayne.github.io/reward-hacking/#library?area=Detection&subcluster=Probing+internal+model+signals) | 5 |

## Theory

[32 papers](https://junewayne.github.io/reward-hacking/#library?area=Theory)

- **When does a proxy preserve the goal?** A proxy is the score an agent optimizes. Skalse and colleagues showed that the guarantee depends on which behaviors the agent can choose. [Formal definition](https://arxiv.org/abs/2209.13085)
- **Where does the guarantee break?** A score can track the goal under an initial policy. Training changes which situations the agent encounters. Laidlaw and colleagues tested a method that limits those changes. [Correlated proxies](https://arxiv.org/abs/2403.03185)

| Subgroup | Papers |
| --- | ---: |
| [Learning guarantees and limits](https://junewayne.github.io/reward-hacking/#library?area=Theory&subcluster=Learning+guarantees+and+limits) | 9 |
| [Proxy definitions and Goodhart effects](https://junewayne.github.io/reward-hacking/#library?area=Theory&subcluster=Proxy+definitions+and+Goodhart+effects) | 7 |
| [Search, selection and tail risk](https://junewayne.github.io/reward-hacking/#library?area=Theory&subcluster=Search%2C+selection+and+tail+risk) | 6 |
| [Strategic behavior and oversight](https://junewayne.github.io/reward-hacking/#library?area=Theory&subcluster=Strategic+behavior+and+oversight) | 6 |
| [Reward shaping and incentives](https://junewayne.github.io/reward-hacking/#library?area=Theory&subcluster=Reward+shaping+and+incentives) | 4 |

## Reviews & synthesis

[13 papers](https://junewayne.github.io/reward-hacking/#library?area=Synthesis)

- **Where does a shortcut occur?** One survey groups failures by the part of the scoring process that fails. Examples include favoring longer answers and changing the environment that supplies the score. [Survey of agentic systems](https://link.springer.com/article/10.1007/s44163-026-01980-z)
- **Which parts of an agent have researchers tested?** A second survey maps shortcuts to memory, planning, tools, and evaluation. The authors identify combinations of shortcuts and defenses that available benchmarks do not test. [Survey of reward capture](https://injoit.org/index.php/j1/article/view/2756/0)

| Subgroup | Papers |
| --- | ---: |
| [Taxonomies of reward hacking](https://junewayne.github.io/reward-hacking/#library?area=Synthesis&subcluster=Taxonomies+of+reward+hacking) | 6 |
| [Human feedback and alignment](https://junewayne.github.io/reward-hacking/#library?area=Synthesis&subcluster=Human+feedback+and+alignment) | 3 |
| [Reviews of specific task domains](https://junewayne.github.io/reward-hacking/#library?area=Synthesis&subcluster=Reviews+of+specific+task+domains) | 3 |
| [Broader risks and misalignment](https://junewayne.github.io/reward-hacking/#library?area=Synthesis&subcluster=Broader+risks+and+misalignment) | 1 |

## Replication evidence

- **Conceptual replication.** Figure 6 recovers the downturn in the independent reward score under PPO with OPT models, then tests whether a multi-head ensemble reduces it. [Earlier study](https://arxiv.org/abs/2210.10760) · [Follow-up study](https://arxiv.org/html/2406.01013)
- **Conceptual replication.** The authors repeat expert iteration on five curriculum tasks with GPT-4o-mini and reserve the final task for testing. They also test an in-context training variant. [Earlier study](https://arxiv.org/abs/2406.10162) · [Follow-up study](https://arxiv.org/html/2410.06491)
- **Direct reproduction.** Heath recomputes the 91.5% versus 0.0% hacking rates from the original Camera Dropbox reference arrays. A separate pilot trains a learned overseer. [Earlier study](https://arxiv.org/abs/2501.13011) · [Follow-up study](https://arxiv.org/abs/2603.29993)
- **Conceptual replication.** The UK AI Security Institute team repeated the design with open models and different coding tasks. Hacking recurred across settings, while broader misalignment varied across evaluations. [Earlier study](https://arxiv.org/abs/2511.18397) · [Follow-up study](https://github.com/UKGovernmentBEIS/reward-hacking-misalignment/blob/main/writeup.txt)
- **Adaptation.** Section 4 adapts three user-feedback environments from Williams and colleagues. The authors change the composition of two environments and examine how safety training interacts with task design. [Earlier study](https://arxiv.org/abs/2411.02306) · [Follow-up study](https://arxiv.org/html/2604.12500)
- **Adaptation.** Two members of the original team transfer their method for detecting planted shortcuts from TextArena to Terminal Bench. [Earlier study](https://arxiv.org/abs/2605.20744) · [Follow-up study](https://arxiv.org/abs/2608.22103)
- **Direct reproduction.** The authors repeat the School of Reward Hacks supervised fine-tuning run with the original hyperparameters. The resulting model again shows more reward seeking than the base model. [Earlier study](https://arxiv.org/abs/2508.17511) · [Follow-up study](https://arxiv.org/html/2609.06649)
- **Conceptual replication.** Jose and Stastny independently recover broader misalignment after training on reward hacking in a new open environment. Inoculation prompts suppress that transfer in their setting. [Earlier study](https://arxiv.org/abs/2511.18397) · [Follow-up study](https://arxiv.org/html/2609.14998)
