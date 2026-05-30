import os
import re
import json
import html
import subprocess
from urllib import parse

import requests

GOOGLE_TRANSLATE_URL = "http://translate.google.com/m?q=%s&tl=%s&sl=%s"
DATA_PATH = "./src/js/i18n.js"


def load_i18n_map(raw_text):
    text = raw_text.replace("export default", "").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback: parse JS object literal with Node.js, then convert to JSON.
        node_script = r"""
const fs = require('fs');
const vm = require('vm');
const path = process.argv[1];
let src = fs.readFileSync(path, 'utf8').replace('export default', '').trim();
const obj = vm.runInNewContext('(' + src + ')', {});
process.stdout.write(JSON.stringify(obj));
"""
        proc = subprocess.run(
            ["node", "-e", node_script, DATA_PATH],
            check=True,
            capture_output=True,
            text=False,
        )
        return json.loads(proc.stdout.decode("utf-8"))


def translate(text, to_language="auto", text_language="auto"):
    encoded = parse.quote(text)
    url = GOOGLE_TRANSLATE_URL % (encoded, to_language, text_language)
    try:
        response = requests.get(url, timeout=10)
    except requests.RequestException:
        return ""

    data = response.text
    expr = r'(?s)class="(?:t0|result-container)">(.*?)<'
    result = re.findall(expr, data)
    if len(result) == 0:
        return ""
    return html.unescape(result[0])


pattern = r"local\([\"'`][\w\d ,-.\?\(\)\+]+[\"'`]\)"
prefix = "./src"

with open(DATA_PATH, encoding="utf-8") as f:
    ori_i18n = f.read()

result = load_i18n_map(ori_i18n)

for root, dirs, files in os.walk(prefix):
    for file in files:
        file_path = os.path.join(root, file)
        if not file_path.endswith((".js", ".vue", ".html")):
            continue

        try:
            with open(file_path, encoding="utf-8") as f:
                ori_content = f.read()
        except UnicodeDecodeError:
            with open(file_path, encoding="gbk", errors="ignore") as f:
                ori_content = f.read()

        matches = re.findall(pattern, ori_content)
        for match in matches:
            key = match[7:-2]
            if key in result:
                continue

            zh = translate(key, "zh-CN", "en")
            zh = zh.replace("聊天", "会话")
            zh = zh.replace("改名", "重命名")
            zh = zh.replace("登出", "注销")
            zh = zh.replace("再生反应", "重新生成")

            result[key] = {
                "en": key,
                "cn": zh,
            }
            print(key, zh)

with open(DATA_PATH, "w+", encoding="utf-8") as f:
    json_content = json.dumps(result, indent=4, ensure_ascii=False)
    f.write("export default " + json_content)
