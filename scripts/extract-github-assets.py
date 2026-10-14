from pathlib import Path, PurePosixPath
import hashlib
import json
import re
import shutil
import stat
import sys
import tempfile
import zipfile

root=Path(sys.argv[1]).resolve()
output=Path(sys.argv[2]).resolve()
manifest=json.loads((root/'ASSETS.json').read_text(encoding='utf-8'))
assets=manifest['assets']
names=[entry['path'] for entry in assets]
if names!=sorted(names) or len(set(names))!=len(names):
    raise ValueError('Asset paths must be unique and sorted')
def safe_name(name):
    if not isinstance(name,str) or '\\' in name or ':' in name or '\x00' in name or name.startswith('/'):
        raise ValueError('Unsafe asset path')
    if any(part in {'','.','..'} for part in name.split('/')):
        raise ValueError('Unsafe asset path component')
    if PurePosixPath(name).suffix.lower() not in {'.png','.webp','.ttf'}:
        raise ValueError('Unsupported asset type')
    return name
for name in names:
    safe_name(name)
with tempfile.TemporaryDirectory(prefix='blazing-assets-') as temporary:
    archive=Path(temporary)/'native-assets.zip'
    total_hash=hashlib.sha256()
    total_bytes=0
    with archive.open('wb') as target:
        for index,part in enumerate(manifest['parts'],1):
            expected=f'assets-part-{index:03d}.zipchunk'
            if part['name']!=expected:
                raise ValueError('Asset parts are missing or out of order')
            source=root/expected
            if source.is_symlink() or not source.is_file():
                raise ValueError('Asset part must be a regular file')
            digest=hashlib.sha256()
            count=0
            with source.open('rb') as stream:
                for chunk in iter(lambda:stream.read(1024*1024),b''):
                    digest.update(chunk);total_hash.update(chunk);target.write(chunk)
                    count+=len(chunk);total_bytes+=len(chunk)
            if count!=part['bytes'] or digest.hexdigest()!=part['sha256']:
                raise ValueError('Asset part checksum mismatch')
    if total_bytes!=manifest['archive']['bytes'] or total_hash.hexdigest()!=manifest['archive']['sha256']:
        raise ValueError('Combined archive checksum mismatch')
    expected={entry['path']:entry for entry in assets}
    with zipfile.ZipFile(archive) as bundle:
        members=bundle.infolist()
        if [member.filename for member in members]!=names or len(members)!=manifest['archive']['fileCount']:
            raise ValueError('ZIP contents differ from the asset manifest')
        if sum(member.file_size for member in members)!=manifest['archive']['uncompressedBytes']:
            raise ValueError('Unexpected uncompressed size')
        for member in members:
            name=safe_name(member.filename)
            if member.is_dir() or stat.S_ISLNK(member.external_attr>>16):
                raise ValueError('ZIP symlinks and directory entries are forbidden')
            target=(output/name).resolve()
            if output not in target.parents:
                raise ValueError('Asset escapes build destination')
        broken=bundle.testzip()
        if broken is not None:
            raise ValueError('ZIP CRC verification failed')
        for member in members:
            data=bundle.read(member)
            item=expected[member.filename]
            if len(data)!=item['bytes'] or hashlib.sha256(data).hexdigest()!=item['sha256']:
                raise ValueError('Native asset checksum mismatch')
            target=(output/member.filename).resolve()
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(data)
print(f"Verified and restored {len(assets)} native assets ({total_bytes} archive bytes)")
