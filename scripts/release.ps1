#Requires -Version 7
<#
Release: versión + changelog + imagen Docker en un solo paso.

Uso:
  pnpm release          # bump patch (1.0.0 -> 1.0.1)
  pnpm release minor    # bump minor (1.0.0 -> 1.1.0)
  pnpm release major    # bump major (1.0.0 -> 2.0.0)

Requiere sesión activa contra Harbor (docker login <registry>).
Config por variables de entorno o editando los defaults de abajo:
  HARBOR_REGISTRY, HARBOR_PROJECT, IMAGE_NAME
#>
param(
    [ValidateSet('patch', 'minor', 'major')]
    [string]$Bump = 'patch'
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

$registry  = $env:HARBOR_REGISTRY ?? 'harbor.example.com'      # <-- CAMBIAR por tu Harbor
$project   = $env:HARBOR_PROJECT ?? 'licencias'                # <-- CAMBIAR por tu proyecto en Harbor
$imageName = $env:IMAGE_NAME ?? 'administrador-licencias'
$image     = "$registry/$project/$imageName"

# --- Verificaciones previas ---
if (git status --porcelain) {
    throw 'Working tree con cambios sin commitear. Haz commit o stash antes del release.'
}
if ((git branch --show-current) -ne 'main') {
    throw 'Los releases se hacen desde main.'
}
git pull --ff-only origin main

# --- 1. Bump de versión (el commit y el tag se crean junto con el changelog) ---
pnpm version $Bump --no-git-tag-version | Out-Null
$version = node -p "require('./package.json').version"
Write-Host "Release $version -> ${image}:$version" -ForegroundColor Cyan

# --- 2. Changelog: agrega la sección con los commits desde el último tag ---
pnpm dlx conventional-changelog-cli -p conventionalcommits -i CHANGELOG.md -s

# --- 3. Commit + tag del release ---
git add package.json CHANGELOG.md
git commit -m "chore(release): $version"
git tag $version

# --- 4. Imagen: build y push a Harbor ---
# Se hace antes del push git: si falla, el release no se publicó en ningún lado.
try {
    docker build `
        -t "${image}:$version" `
        -t "${image}:latest" `
        --label "org.opencontainers.image.version=$version" `
        --label "org.opencontainers.image.revision=$(git rev-parse HEAD)" `
        .
    docker push "${image}:$version"
    docker push "${image}:latest"
}
catch {
    Write-Host "Falló el build/push de la imagen. Para deshacer el release local:" -ForegroundColor Yellow
    Write-Host "  git tag -d $version; git reset --hard HEAD~1" -ForegroundColor Yellow
    throw
}

# --- 5. Publicar commit y tag (dispara el CI de Jenkins) ---
git push origin main --follow-tags

Write-Host "Listo: ${image}:$version publicada y CHANGELOG.md actualizado." -ForegroundColor Green
