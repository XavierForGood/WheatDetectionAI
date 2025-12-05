from PyInstaller.utils.hooks import collect_all, collect_submodules

# Collect all uvicorn modules
datas, binaries, hiddenimports = collect_all('uvicorn')

# Explicitly collect all submodules
hiddenimports += collect_submodules('uvicorn')
hiddenimports += collect_submodules('uvicorn.loops')
hiddenimports += collect_submodules('uvicorn.protocols')
hiddenimports += collect_submodules('uvicorn.lifespan')
