"""Build the article figures and result tables from the frozen evaluation snapshot"""

import csv
import html
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/blog/injection-defense'
data = json.loads((ASSETS / 'results.json').read_text())
methods = data['methods']
order = ['FIPI', 'LLMail', 'Synthetic business', 'BIPIA', 'AgentDyn', 'AgentLAB', 'InjecAgent', 'AgentDojo']
notes = {
    'FIPI': '200 held-out FIPI injection prompts, scored by whether the response contains the answer requested by the injection. This tests new examples from the training dataset rather than a new data source.',
    'LLMail': '1,000 injection prompts in the adapted summary task, where an unauthorized send_email request or detected repetition counts as success. The tool request is inspected without executing it.',
    'Synthetic business': '400 injection prompts in simulated business tasks, scored for disclosure of the requested fake secret, protected changes, or repetition. Reviewed scores also include instructions carried in accepted records, while unresolved cases remain in the count table.',
    'BIPIA': '600 injection prompts from the message, table, and code subset, scored with published rules, local model judgments, and saved-response review. The configured rule also counts repetition, while some judgments remain unresolved.',
    'AgentDyn': '560 injection cases across shopping, GitHub, and daily-life tasks, using the original environment checks and configured repetition rule. These results come from the evaluation after the tool-parser repair.',
    'AgentLAB': '416 released Task-Injection cases, replayed without adaptive attack optimization and scored with the original environment checks and configured repetition rule. These results come from the evaluation after the tool-parser repair.',
    'InjecAgent': '2,108 cases across the base and enhanced settings, scored for attacker-directed tool requests or repetition. Some cases use simulated second-stage responses, so these rates concern requested actions rather than completed real-world actions.',
    'AgentDojo': '949 injection cases per model, using original task checks with one fixed published injection template and the configured repetition rule. All nine evaluations are complete, with unresolved cases excluded from the scored denominator.',
}

def bars(title, subtitle, rows, filename, axis='Reported ASR (%) · lower is better', limit=None, mobile=False):
    width, left, right, top, step = 960, 260, 110, 104, 47
    if mobile:
        width, left, right, top, step = 400, 16, 16, 75, 64
    height = top + step * len(rows) + 74
    scores = [row['value'] for row in rows if row['value'] is not None]
    maximum = limit or max(5, min(100, (int(max(scores) / 10) + 1) * 10))
    span = width - left - right
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">', f'<title id="title">{html.escape(title)}</title>', f'<desc id="desc">{html.escape(subtitle)}. ' + html.escape('; '.join(row['label'] + ': ' + (f"{row['value']:.2f}%" if row['value'] is not None else 'pending') for row in rows)) + '</desc>', '<rect width="100%" height="100%" fill="white"/>', '<g font-family="Lato, Arial, sans-serif" fill="#243447">', f'<text x="20" y="32" font-size="23" font-weight="700">{html.escape(title)}</text>', f'<text x="20" y="60" font-size="16" fill="#475569">{html.escape(subtitle)}</text>']
    if mobile:
        # The caption already gives the model name, leaving space for larger row labels
        svg.pop()
        svg[-1] = f'<text x="16" y="30" font-size="20" font-weight="700">{html.escape(title)}</text>'
    for i in range(5):
        tick = maximum * i / 4
        x = left + span * tick / maximum
        if not mobile:
            svg.append(f'<line x1="{x}" x2="{x}" y1="{top - 20}" y2="{top + step * (len(rows) - 1) + 20}" stroke="#e1e7ed"/>')
        anchor = 'start' if mobile and i == 0 else 'end' if mobile and i == 4 else 'middle'
        svg.append(f'<text x="{x}" y="{height - 40}" text-anchor="{anchor}" font-size="15">{tick:g}</text>')
    for i, row in enumerate(rows):
        y = top + step * i
        svg.append(f'<text x="{left if mobile else left - 15}" y="{y + 6}" text-anchor="{"start" if mobile else "end"}" font-size="{18 if mobile else 17}">{html.escape(row["label"])}</text>')
        if row['value'] is None:
            svg.append(f'<text x="{width - right if mobile else left + 12}" y="{y + 6}" text-anchor="{"end" if mobile else "start"}" font-size="16" fill="#64748b">Pending</text>')
            continue
        length = span * row['value'] / maximum
        color = '#6f7c89' if row.get('base') else '#22765f' if row.get('best') else '#417db0'
        svg += [f'<rect x="{left}" y="{y + 17 if mobile else y - 14}" width="{length}" height="{14 if mobile else 28}" rx="3" fill="{color}"/>', f'<text x="{width - right if mobile else left + length + 10}" y="{y + 6}" text-anchor="{"end" if mobile else "start"}" font-size="17" font-weight="700">{row["value"]:.2f}%</text>']
    svg += [f'<text x="{left + span / 2}" y="{height - 6}" text-anchor="middle" font-size="17">{html.escape(axis)}</text>', '</g></svg>']
    (ASSETS / filename).write_text('\n'.join(svg))
    if not mobile:
        bars(title, subtitle, rows, filename.replace('.svg', '-mobile.svg'), axis, limit, mobile=True)

panels, csv_rows = [], []
for name in order:
    rows = sorted(data['benchmarks'][name], key=lambda r: list(methods).index(r['method']))
    complete = [r for r in rows if r['status'] == 'complete' and r['method'] != 'base']
    best = min(r['asr'] for r in complete)
    slug = name.lower().replace(' ', '-')
    bars(name, 'Qwen2.5-7B-Instruct · base model and eight data selection methods', [{'label': methods[r['method']], 'value': r['asr'] if r['status'] == 'complete' else None, 'base': r['method'] == 'base', 'best': r['asr'] == best and r['status'] == 'complete'} for r in rows], slug + '.svg')
    table = '<div class="table-scroll" tabindex="0" role="region" aria-label="' + name + ' result counts"><table><thead><tr><th scope="col">Training data selected by</th><th scope="col">Counted successes / scored</th><th scope="col">Unresolved</th><th scope="col">ASR</th></tr></thead><tbody>'
    for row in rows:
        csv_rows.append({'benchmark': name, **row})
        if row['status'] != 'complete':
            table += f'<tr><th scope="row">{methods[row["method"]]}</th><td colspan="3">Pending, {row["generated_cases"]} / {row["expected_cases"]} total cases recorded</td></tr>'
        else:
            best_class = ' class="best numeric"' if row['asr'] == best else ' class="numeric"'
            table += f'<tr><th scope="row">{methods[row["method"]]}</th><td class="numeric">{row["successes"]} / {row["scored"]}</td><td class="numeric">{row["unresolved"]}</td><td{best_class}>{row["asr"]:.2f}%</td></tr>'
    table += '</tbody></table></div>'
    winners = [methods[row['method']] for row in complete if row['asr'] == best]
    base = next(row for row in rows if row['method'] == 'base')
    winner_text = ' and '.join(winners)
    outcome = f'adapters trained on data selected by {winner_text} tied for the lowest reported ASR' if len(winners) > 1 else f'the adapter trained on data selected by {winner_text} had the lowest reported ASR'
    explanation = f'According to the figure above (<a class="figure-reference" href="#figure-{slug}">Figure</a>), {outcome} at {best:.2f}%, compared with {base["asr"]:.2f}% for the base model. These rates use each model\'s scored cases, with unresolved counts listed separately.'
    panels.append(f'<div class="chart-panel" id="chart-{slug}"><h3>{name}</h3><figure id="figure-{slug}"><div class="chart-scroll" tabindex="0" role="region" aria-label="Scrollable comparison chart"><img src="../assets/blog/injection-defense/{slug}.svg" width="960" height="601" loading="eager" alt="{name}: reported attack success rates for the base model and eight selection methods"></div><figcaption>{notes[name]} Green marks the lowest reported adapter ASR. Each benchmark has its own axis scale.</figcaption></figure><p>{explanation}</p><details><summary>Exact counts and unresolved cases</summary>{table}</details></div>')

fields = sorted(set().union(*(row.keys() for row in csv_rows)))
with (ASSETS / 'results.csv').open('w', newline='') as stream:
    writer = csv.DictWriter(stream, fieldnames=fields, lineterminator='\n')
    writer.writeheader()
    writer.writerows(csv_rows)

detector_rows = data['detectors']
bars('Detector accuracy before data selection', 'Same 500 validation pairs · the layer is selected separately for each detector', [{'label': methods[r['method']], 'value': r['validation_accuracy']} for r in detector_rows], 'detector-accuracy.svg', 'Validation balanced accuracy (%)', 100)
detector_table = '<div class="table-scroll" tabindex="0" role="region" aria-label="Comparison details"><table><thead><tr><th scope="col">Detector</th><th scope="col">Selected layer</th><th scope="col">Validation accuracy</th></tr></thead><tbody>' + ''.join(f'<tr><th scope="row">{methods[r["method"]]}</th><td>{r["layer"]}</td><td>{r["validation_accuracy"]:.1f}%</td></tr>' for r in detector_rows) + '</tbody></table></div>'

objective_names = {'base': 'Base model', 'reference_only': 'Reference response only', 'separation_only': 'Hidden state separation', 'combined': 'Combined objectives'}
objective_rows = [r for r in data['objectives'] if r['method'] == 'base' or r['update'] == '256']
bars('Training objective comparison', 'Diagnostic comparison · 256 updates · 32 separate testing prompts', [{'label': objective_names[r['method']], 'value': float(r['attack_success_rate_percent']), 'base': r['method'] == 'base', 'best': r['method'] == 'reference_only'} for r in objective_rows], 'training-objectives.svg', 'Injected answer or repetition (%)', 100)
objective_table = '<div class="table-scroll" tabindex="0" role="region" aria-label="Comparison details"><table><thead><tr><th scope="col">Objective</th><th scope="col">Injected answer</th><th scope="col">Repetition</th><th scope="col">Either outcome</th></tr></thead><tbody>' + ''.join(f'<tr><th scope="row">{objective_names[r["method"]]}</th><td>{r["phrase_present"]} / 32</td><td>{r["repetition_total"]} / 32</td><td>{r["attack_succeeded"]} / 32</td></tr>' for r in objective_rows) + '</tbody></table></div>'

# These two figures illustrate the formulas rather than report experiment results
bars('Worked selection example', 'Illustrative probabilities · pair score = (0.90 + 0.03) / 2 = 0.465', [{'label': 'Injection prompt', 'value': 90}, {'label': 'Safe prompt', 'value': 3}], 'selection-example.svg', 'Incorrect-label probability (%)', 100)

for mobile in [False, True]:
    width, height = (400, 360) if mobile else (960, 360)
    left, right, top, bottom = 56, 32, 76, 284
    span = width - left - right
    title = 'Probability and token loss' if mobile else 'Reference-token probability and loss'
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">', '<title id="title">Reference-token probability and loss</title>', '<desc id="desc">An illustration of negative log probability. Probability 0.10 gives loss 2.30; probability 0.80 gives loss 0.22. This is not a measured training curve.</desc>', '<rect width="100%" height="100%" fill="white"/>', '<g font-family="Lato, Arial, sans-serif" fill="#243447">', f'<text x="16" y="30" font-size="{19 if mobile else 23}" font-weight="700">{title}</text>']
    for loss in [0, 1, 2, 3, 4, 5]:
        y = bottom - loss / 5 * (bottom - top)
        svg += [f'<line x1="{left}" x2="{width - right}" y1="{y}" y2="{y}" stroke="#e1e7ed"/>', f'<text x="{left - 12}" y="{y + 5}" text-anchor="end" font-size="15">{loss}</text>']
    for probability in [0, 0.25, 0.5, 0.75, 1]:
        x = left + probability * span
        svg.append(f'<text x="{x}" y="{bottom + 25}" text-anchor="middle" font-size="15">{probability:g}</text>')
    points = []
    for step in range(1, 101):
        probability = step / 100
        x = left + probability * span
        y = bottom - (-math.log(probability)) / 5 * (bottom - top)
        points.append(f'{x:.2f},{y:.2f}')
    svg.append('<polyline points="' + ' '.join(points) + '" fill="none" stroke="#417db0" stroke-width="3"/>')
    for probability in [0.1, 0.8]:
        loss = -math.log(probability)
        x = left + probability * span
        y = bottom - loss / 5 * (bottom - top)
        anchor = 'start' if probability == 0.1 else 'end'
        offset = 12 if probability == 0.1 else -12
        label_y = y - (58 if mobile and probability == 0.8 else 18)
        if mobile and probability == 0.8:
            svg.append(f'<line x1="{x}" x2="{x}" y1="{y - 8}" y2="{label_y + 8}" stroke="#9aafc2"/>')
        svg += [f'<circle cx="{x}" cy="{y}" r="5" fill="#245e95"/>', f'<text x="{x + offset}" y="{label_y}" text-anchor="{anchor}" font-size="16">p = {probability:.2f}, loss = {loss:.2f}</text>']
    svg += [f'<text x="{left + span / 2}" y="348" text-anchor="middle" font-size="17">Reference-token probability</text>', f'<text x="18" y="{(top + bottom) / 2}" text-anchor="middle" transform="rotate(-90 18 {(top + bottom) / 2})" font-size="17">Token loss</text>', '</g></svg>']
    filename = 'reference-token-loss-mobile.svg' if mobile else 'reference-token-loss.svg'
    (ASSETS / filename).write_text('\n'.join(svg))

page = ROOT / 'blog/prompt-injection-data-curation.html'
text = page.read_text()
for key, value in [('RESULTS', '\n'.join(panels)), ('DETECTORS', detector_table), ('OBJECTIVES', objective_table)]:
    start, end = f'<!-- BEGIN {key} -->', f'<!-- END {key} -->'
    before, rest = text.split(start, 1)
    _, after = rest.split(end, 1)
    text = before + start + '\n' + value + '\n' + end + after
# Separate SVG layouts keep all labels readable without shrinking desktop charts
text = re.sub(r'<picture><source[^>]+>(<img[^>]+>)</picture>', r'\1', text)
text = re.sub(r'<img src="(\.\./assets/blog/injection-defense/[^\"]+)\.svg"[^>]+>', lambda match: '<picture><source media="(max-width: 580px)" srcset="' + match.group(1) + '-mobile.svg">' + match.group(0) + '</picture>', text)

# Number figures in reading order, including benchmark charts hidden by the selector
text = re.sub(r'<span class="figure-number">Figure \d+\.</span>\s*', '', text)
figure_numbers = {}
def number_figure(match):
    identifier, contents = match.groups()
    number = len(figure_numbers) + 1
    figure_numbers[identifier] = number
    contents = contents.replace('<figcaption>', f'<figcaption><span class="figure-number">Figure {number}.</span> ', 1)
    return f'<figure id="{identifier}" data-figure-number="{number}">{contents}</figure>'

text = re.sub(r'<figure id="([^"]+)"(?: data-figure-number="\d+")?>(.*?)</figure>', number_figure, text, flags=re.S)
text = re.sub(r'<a class="figure-reference" href="#([^"]+)">Figure(?: \d+)?</a>', lambda match: f'<a class="figure-reference" href="#{match[1]}">Figure {figure_numbers[match[1]]}</a>', text)
page.write_text(text)
print(f'Updated {len(figure_numbers)} numbered figures, 8 result tables, and downloadable result data')
