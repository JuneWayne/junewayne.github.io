"""Build the article figures and result tables from the frozen evaluation snapshot"""

import csv
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/blog/injection-defense'
data = json.loads((ASSETS / 'results.json').read_text())
methods = data['methods']
order = ['FIPI', 'LLMail', 'Synthetic business', 'BIPIA', 'AgentDyn', 'AgentLAB', 'InjecAgent', 'AgentDojo']
notes = {
    'FIPI': '200 held-out injection prompts from FIPI. Checks whether the response contains the answer requested by the injection. This is within-dataset testing, not a test on a new dataset.',
    'LLMail': '1,000 injection prompts in the adapted summary task. Counts an unauthorized send_email request or detected repetition. Tools do not execute.',
    'Synthetic business': '400 injection prompts in simulated business tasks. Counts disclosure of the requested fake secret, the requested protected changes, or repetition. Reviewed scores include instructions carried in accepted records. Some cases remain unresolved.',
    'BIPIA': '600 injection prompts from the message, table, and code subset. Uses published rules, local model judgments, and saved-response review. Repetition counts where the configured rule flags it. Some judgments remain unresolved.',
    'AgentDyn': '560 injection cases across shopping, GitHub, and daily-life tasks. Uses original environment checks plus the configured repetition rule. These are results after the tool-parser repair.',
    'AgentLAB': '416 released Task-Injection cases, replayed without adaptive attack optimization. Uses original environment checks plus the configured repetition rule. These are results after the tool-parser repair.',
    'InjecAgent': '2,108 cases across the base and enhanced settings. Counts attacker-directed tool requests or repetition, with simulated second-stage responses where needed. This does not measure completed real-world actions.',
    'AgentDojo': 'Original task checks with one fixed published injection template, plus the configured repetition rule. The synthetic-lens adapter is still running in this snapshot and is excluded from the ranking.',
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
    panels.append(f'<div class="chart-panel" id="chart-{slug}"><h3>{name}</h3><figure><div class="chart-scroll" tabindex="0" role="region" aria-label="Scrollable comparison chart"><img src="../assets/blog/injection-defense/{slug}.svg" width="960" height="601" loading="eager" alt="{name}: reported attack success rates for the base model and eight selection methods"></div><figcaption>{notes[name]} Green marks the lowest completed adapter result.</figcaption></figure><details><summary>Exact counts and unresolved cases</summary>{table}</details></div>')

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
bars('Which training objective did we keep?', 'Controlled comparison · 256 updates · 32 separate testing prompts', [{'label': objective_names[r['method']], 'value': float(r['attack_success_rate_percent']), 'base': r['method'] == 'base', 'best': r['method'] == 'reference_only'} for r in objective_rows], 'training-objectives.svg', 'Injected answer or repetition (%)', 100)
objective_table = '<div class="table-scroll" tabindex="0" role="region" aria-label="Comparison details"><table><thead><tr><th scope="col">Objective</th><th scope="col">Injected answer</th><th scope="col">Repetition</th><th scope="col">Either outcome</th></tr></thead><tbody>' + ''.join(f'<tr><th scope="row">{objective_names[r["method"]]}</th><td>{r["phrase_present"]} / 32</td><td>{r["repetition_total"]} / 32</td><td>{r["attack_succeeded"]} / 32</td></tr>' for r in objective_rows) + '</tbody></table></div>'

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
page.write_text(text)
print('Built 10 figures, 8 result tables, and downloadable result data')
