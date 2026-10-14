"""Read-only comparison of Pages TARs and every public artifact file (#39)."""
import concurrent.futures
import hashlib
import json
import pathlib
import sys
import tarfile
import urllib.parse
import urllib.request
from datetime import datetime, timezone

old_tar, new_tar, output = map(pathlib.Path, sys.argv[1:4])
base_url = 'https://arosare.github.io/naruto-blazing-revival/'
meta = '<meta name="generator" content="MakeProject · Release 33">'.encode()
sha = lambda data: hashlib.sha256(data).hexdigest()

def read_tar(filename):
    with tarfile.open(filename) as archive:
        result = {}
        for member in archive.getmembers():
            assert not member.issym() and not member.islnk()
            if member.isfile():
                name = member.name.removeprefix('./')
                assert not name.startswith('/') and '..' not in name.split('/')
                result[name] = archive.extractfile(member).read()
        return result

before, after = read_tar(old_tar), read_tar(new_tar)
assert before.keys() == after.keys()
references = html = unchanged = 0
for name, data in after.items():
    reference = name == 'reference-pour-chatgpt.html' or (name.startswith('import-reference/') and name.endswith('.html'))
    if name.endswith('.html'):
        html += 1
        head = data.split(b'<head', 1)[1].split(b'</head>', 1)[0]
        assert head.count(meta) == 1, name
    if reference:
        references += 1
        assert meta not in before[name] and data.replace(meta, b'', 1) == before[name], name
    else:
        unchanged += 1
        assert data == before[name], name
assert (references, html, unchanged, len(after)) == (182, 183, 3105, 3287)
stamp = datetime.now(timezone.utc).isoformat()

def check(name):
    url = base_url + urllib.parse.quote(name, safe='/') + '?issue39=' + urllib.parse.quote(stamp)
    request = urllib.request.Request(url, headers={'Cache-Control': 'no-cache', 'User-Agent': 'Issue39-read-only-artifact-check'})
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read()
        record = {'path': name, 'status': response.status, 'expectedSha256': sha(after[name]), 'publicSha256': sha(data)}
        assert response.status == 200 and data == after[name], record
        return record

records = []
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    for record in pool.map(check, sorted(after)):
        records.append(record)
        if len(records) % 500 == 0:
            print(f'{len(records)}/3287 public files match', flush=True)
report = {'startedAtUtc': stamp, 'finishedAtUtc': datetime.now(timezone.utc).isoformat(), 'url': base_url,
          'previousTarSha256': sha(old_tar.read_bytes()), 'publishedTarSha256': sha(new_tar.read_bytes()),
          'referencePages': references, 'htmlPages': html, 'unchangedFiles': unchanged,
          'publicFilesMatched': len(records), 'method': 'GET only; exact bytes, no normalization; cache-busting query', 'records': records}
with output.open('x', encoding='utf-8') as stream:
    json.dump(report, stream, ensure_ascii=False, indent=2)
    stream.write('\n')
print(json.dumps({key: value for key, value in report.items() if key != 'records'}, indent=2))
