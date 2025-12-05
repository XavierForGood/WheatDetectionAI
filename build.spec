from PyInstaller.utils.hooks import collect_all

block_cipher = None

datas = [
    ('backend', 'backend'),
    ('frontend/dist', 'frontend/dist'),
    ('backend/models', 'backend/models'),
]

binaries = []
hiddenimports = [
    'uvicorn',
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.loops.asyncio',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.http.h11_impl',
    'uvicorn.protocols.http.httptools_impl',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.protocols.websockets.wsproto_impl',
    'uvicorn.protocols.websockets.websockets_impl',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    'uvicorn.lifespan.off',
    'uvicorn.server',
    'uvicorn.config',
    'uvicorn.main',
    'uvicorn.importer',
    'uvicorn.supervisors',
    'uvicorn.supervisors.basereload',
    'uvicorn.supervisors.multiprocess',
    'uvicorn.supervisors.statreload',
    'uvicorn.supervisors.watchfilesreload',
    'uvicorn.workers',
    'engineio.async_drivers.threading',
    'fastapi',
    'starlette',
    'starlette.applications',
    'starlette.routing',
    'starlette.responses',
    'starlette.middleware',
    'pydantic',
    'pydantic.deprecated',
    'pydantic.deprecated.decorator',
    'multipart',
    'python_multipart',
    'click',
    'h11',
    'httptools',
    'websockets',
    'websockets.legacy',
    'websockets.legacy.server',
    'wsproto',
    'anyio',
    'sniffio',
]

# Collect setuptools data (fixes jaraco/text/Lorem ipsum.txt error)
tmp_ret = collect_all('setuptools')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]

# Collect uvicorn data
tmp_ret = collect_all('uvicorn')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]

# Collect fastapi data
tmp_ret = collect_all('fastapi')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]

# Collect starlette data
tmp_ret = collect_all('starlette')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]

# Collect click data
tmp_ret = collect_all('click')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]

a = Analysis(
    ['run.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=['./'],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='WheatDetectionAI',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='pic/logo.png',
    onefile=True,
)
