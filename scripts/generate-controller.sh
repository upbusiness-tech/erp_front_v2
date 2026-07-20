#!/bin/bash
# -----------------------------------------------------------------------------
# Gera um arquivo xxx.controller.tsx com a estrutura inicial do controller.
#
# Uso:
#   npm run generate:controller -- useEmployeeList
#   npm run generate:controller -- src/features/Xxx/useEmployeeList
#
# O nome pode ser:
#   - Apenas o nome base:    useEmployeeList
#   - Caminho + nome base:   src/features/Employee/useEmployeeList
#
# O script cria:
#   useEmployeeList.controller.tsx
#   com export function useEmployeeListController() { return {}; }
# -----------------------------------------------------------------------------

set -euo pipefail

NAME="$1"
DIR=""
BASE=""

# Separa diretório do nome base
if [[ "$NAME" == */* ]]; then
  DIR="${NAME%/*}"
  BASE="${NAME##*/}"
else
  DIR="."
  BASE="$NAME"
fi

# Remove extensão .ts/.tsx se vier junto
BASE="${BASE%.tsx}"
BASE="${BASE%.ts}"

# Remove sufixo .controller se vier junto
BASE="${BASE%.controller}"

# Garante que o diretório existe
mkdir -p "$DIR"

FILEPATH="${DIR}/${BASE}.controller.tsx"

# Já existe?
if [ -f "$FILEPATH" ]; then
  echo "ERRO: $FILEPATH já existe." >&2
  exit 1
fi

cat > "$FILEPATH" <<- EOM
export function ${BASE}Controller() {
  return {};
}
EOM

echo "✓ Criado: $FILEPATH"
