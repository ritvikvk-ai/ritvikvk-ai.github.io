import pathlib
d=pathlib.Path(__file__).parent;common=(d/'common.js').read_text()
for f in d.glob('[d-z]-*.html'):
    (d.parent/f.name).write_text(f.read_text().replace('/*@COMMON*/',common))
    print('built',f.name)
