# Reward hacking literature review

January 2020 through 18 November 2026.

## Main findings

Reward hacking occurs when an agent earns a higher score by taking a shortcut that misses the intended goal.

- **The task changes the measured rate.** Across 17 models, researchers observed spontaneous hacking in 30.5% of open-ended research runs and 2.9% of narrow computing runs. These rates describe the tasks in that study. [Huang et al.](https://arxiv.org/abs/2609.28614)
- **A second example can help a detector spot a shortcut.** On TRACE, GPT-5.2 detected 63% of hacks when it could compare runs. It detected 45% when it judged each run alone. [Deshpande et al.](https://arxiv.org/abs/2601.20103)
- **Mitigation draws the most work in this collection.** 291 of 589 papers study ways to reduce hacking. The search identified 176 behavioral studies and 34 detection studies. Each paper counts once, under its main contribution.

## Mitigation

[291 papers](https://junewayne.github.io/reward-hacking/#library?area=Mitigation)

- Combining several reward models reduced hacking in language model experiments. Errors persisted when the models favored the same flawed answers. [Eisenstein et al.](https://arxiv.org/abs/2312.09244)
- Uesato and colleagues separated the action an agent took from the action a reviewer scored. Under their assumptions, this removed the incentive to corrupt the feedback. They also tested the method in simulated environments. [Decoupled approval](https://arxiv.org/abs/2011.08827)

## Behavioral studies

[176 papers](https://junewayne.github.io/reward-hacking/#library?area=Behavior)

- Pan and colleagues compared the training score with a separate measure of success in four environments. Some stronger agents earned higher scores while performing the intended task worse. [Reward misspecification experiments](https://arxiv.org/abs/2201.03544)
- Models trained on harmless shortcuts used shortcuts on new tasks. An independent team repeated the training procedure and again observed more reward seeking than in the base model. [Original study](https://arxiv.org/abs/2508.17511) · [Reproduction](https://arxiv.org/html/2609.06649)
- In a separate replication, open models learned shortcuts during coding tasks. The same models showed broader misalignment on some later tests. Its frequency varied across tests. [Original study](https://arxiv.org/abs/2511.18397) · [Replication report](https://github.com/UKGovernmentBEIS/reward-hacking-misalignment/blob/main/writeup.txt)

## Benchmarking

[43 papers](https://junewayne.github.io/reward-hacking/#library?area=Benchmarking)

- TextArena includes shortcuts that the researchers can identify automatically. It measures how often an agent uses those specific shortcuts. Other shortcuts can escape the count. [Roth et al.](https://arxiv.org/abs/2605.20744)
- RH-Detect tested six detectors on 5,021 examples. At a fixed threshold, the four strongest detectors scored 10.7–15.9 percentage points lower on two multi-step tool datasets than on the other sources. [Quan et al.](https://arxiv.org/abs/2610.10947)

## Detection

[34 papers](https://junewayne.github.io/reward-hacking/#library?area=Detection)

- A monitor found signs of hacking in a coding model’s written reasoning. Strong penalties for those signs changed the model’s reasoning. The model continued to hack, and the monitor had less evidence. [Baker et al.](https://arxiv.org/abs/2503.11926)
- Wilhelm and colleagues measured activity inside language models as they generated answers. Signals associated with hacking often appeared before the final answer. Their timing varied by model. [Internal activation study](https://arxiv.org/abs/2603.04069)

## Theory

[32 papers](https://junewayne.github.io/reward-hacking/#library?area=Theory)

- A proxy is the score an agent optimizes. Skalse and colleagues asked when a higher expected proxy score can never mean a worse expected outcome. The answer depends on which behaviors the agent can choose. [Formal definition](https://arxiv.org/abs/2209.13085)
- Laidlaw and colleagues studied scores that tracked the goal under an initial policy. Training changed which situations the agent encountered and weakened that relationship. Their method limited those changes and reduced hacking in four settings. [Correlated proxies](https://arxiv.org/abs/2403.03185)

## Reviews & synthesis

[13 papers](https://junewayne.github.io/reward-hacking/#library?area=Synthesis)

- Morampudi and colleagues grouped failures by where the shortcut occurs. Examples range from favoring longer answers to changing the environment that supplies the score. [Survey of agentic systems](https://link.springer.com/article/10.1007/s44163-026-01980-z)
- Karpinskaya and Ayrapetyants organized studies by parts of an agent, including memory, planning, tools, and evaluation. They identified combinations of shortcuts and defenses that benchmarks have yet to test. [Survey of reward capture](https://injoit.org/index.php/j1/article/view/2756/0)

## Replication evidence

- **Conceptual replication.** Figure 6 recovers the downturn in the independent reward score under PPO with OPT models, then tests whether a multi-head ensemble reduces it. [Earlier study](https://arxiv.org/abs/2210.10760) · [Follow-up study](https://arxiv.org/html/2406.01013)
- **Conceptual replication.** The authors repeat expert iteration on five curriculum tasks with GPT-4o-mini and reserve the final task for testing. They also test an in-context training variant. [Earlier study](https://arxiv.org/abs/2406.10162) · [Follow-up study](https://arxiv.org/html/2410.06491)
- **Direct reproduction.** Heath recomputes the 91.5% versus 0.0% hacking rates from the original Camera Dropbox reference arrays. A separate pilot trains a learned overseer. [Earlier study](https://arxiv.org/abs/2501.13011) · [Follow-up study](https://arxiv.org/abs/2603.29993)
- **Conceptual replication.** The UK AI Security Institute team repeated the design with open models and different coding tasks. Hacking recurred across settings, while broader misalignment varied across evaluations. [Earlier study](https://arxiv.org/abs/2511.18397) · [Follow-up study](https://github.com/UKGovernmentBEIS/reward-hacking-misalignment/blob/main/writeup.txt)
- **Adaptation.** Section 4 adapts three user-feedback environments from Williams and colleagues. The authors change the composition of two environments and examine how safety training interacts with task design. [Earlier study](https://arxiv.org/abs/2411.02306) · [Follow-up study](https://arxiv.org/html/2604.12500)
- **Adaptation.** Two members of the original team transfer their method for detecting planted shortcuts from TextArena to Terminal Bench. [Earlier study](https://arxiv.org/abs/2605.20744) · [Follow-up study](https://arxiv.org/abs/2608.22103)
- **Direct reproduction.** The authors repeat the School of Reward Hacks supervised fine-tuning run with the original hyperparameters. The resulting model again shows more reward seeking than the base model. [Earlier study](https://arxiv.org/abs/2508.17511) · [Follow-up study](https://arxiv.org/html/2609.06649)
- **Conceptual replication.** Jose and Stastny independently recover broader misalignment after training on reward hacking in a new open environment. Inoculation prompts suppress that transfer in their setting. [Earlier study](https://arxiv.org/abs/2511.18397) · [Follow-up study](https://arxiv.org/html/2609.14998)
